import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { isBadUserInput } from '../../../graphql/errors';
import {
  buildSlots,
  isSlotCovered,
  isSlotTaken,
  toLocalDateTime,
  type TimeSpan,
} from '../../../lib/date/slots';
import { formatDuration } from '../../../lib/format/duration';
import { formatEuros } from '../../../lib/format/money';
import { BOOKING_COPY, SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import { BOOKING_STATUS } from '../../../utils/constants/scheduleStatuses';
import { STUDIO_HOURS, STUDIO_SLOT_MINUTES } from '../../../utils/constants/studioHours';
import {
  bookingFormDefaults,
  bookingSchema,
  type BookingDay,
  type BookingFormValues,
  type BookingSlot,
  type ServiceOption,
  type ServiceOptionGroup,
} from '../../BookingForm/types/bookingForm.types';
import { useNewReservationModalModel } from '../model/newReservationModal.model';

const MS_PER_MINUTE = 60_000;

function toBookingSlot(time: string, held: number, busy: readonly TimeSpan[]): BookingSlot {
  if (isSlotCovered(time, busy)) {
    return { time, label: `${time} — ${BOOKING_COPY.coveredSuffix}`, isTaken: true };
  }

  if (isSlotTaken(time, held, busy)) {
    return { time, label: `${time} — ${BOOKING_COPY.noTimeSuffix}`, isTaken: true };
  }

  return { time, label: time, isTaken: false };
}

/** Each service starts when the previous one ends. */
function toBookings(
  start: Date,
  serviceIds: readonly string[],
  durations: ReadonlyMap<string, number>,
): { serviceId: string; at: Date }[] {
  let elapsedMinutes = 0;

  return serviceIds.map((serviceId) => {
    const at = new Date(start.getTime() + elapsedMinutes * MS_PER_MINUTE);
    elapsedMinutes += durations.get(serviceId) ?? STUDIO_SLOT_MINUTES;

    return { serviceId, at };
  });
}

export function useNewReservationModalViewModel(
  day: BookingDay | null,
  serviceGroups: readonly ServiceOptionGroup[],
) {
  const { registerSchedule } = useNewReservationModalModel();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: 'onSubmit',
    defaultValues: bookingFormDefaults,
  });

  const resetForm = useCallback(() => reset(bookingFormDefaults), [reset]);

  const options = useMemo(() => {
    const byId = new Map<string, ServiceOption>();

    for (const group of serviceGroups) {
      for (const option of group.options) {
        byId.set(option.id, option);
      }
    }

    return byId;
  }, [serviceGroups]);

  const durations = useMemo(() => {
    const byService = new Map<string, number>();

    for (const option of options.values()) {
      byService.set(
        option.id,
        option.durationMinutes > 0 ? option.durationMinutes : STUDIO_SLOT_MINUTES,
      );
    }

    return byService;
  }, [options]);

  // The services are already stored — by `react-hook-form` — so the hour list is
  // derived from them rather than mirrored into state of its own. `useWatch` rather
  // than `watch()`: it subscribes to this one field, and it is a hook the React
  // Compiler can actually memoize around.
  const serviceIds = useWatch({ control, name: 'serviceIds' });

  // Null until a service is chosen: the hour list waits for a duration.
  const held = useMemo(
    () =>
      serviceIds.length === 0
        ? null
        : serviceIds.reduce((total, id) => total + (durations.get(id) ?? STUDIO_SLOT_MINUTES), 0),
    [durations, serviceIds],
  );

  const chosenServices = useMemo(
    () => serviceIds.flatMap((id) => options.get(id) ?? []),
    [serviceIds, options],
  );

  // Chosen services leave the select, which also makes adding one twice impossible.
  const availableGroups = useMemo(
    () =>
      serviceGroups
        .map((group) => ({
          label: group.label,
          options: group.options.filter((option) => !serviceIds.includes(option.id)),
        }))
        .filter((group) => group.options.length > 0),
    [serviceGroups, serviceIds],
  );

  const serviceSummary = useMemo(() => {
    if (chosenServices.length < 2 || held === null) {
      return null;
    }

    const price = chosenServices.reduce((total, option) => total + option.price, 0);

    return [
      BOOKING_COPY.summaryReservations(chosenServices.length),
      formatDuration(held),
      formatEuros(price),
    ]
      .filter(Boolean)
      .join(' · ');
  }, [chosenServices, held]);

  const submitLabel = useMemo(
    () =>
      serviceIds.length > 1 ? BOOKING_COPY.submitMany(serviceIds.length) : BOOKING_COPY.submit,
    [serviceIds.length],
  );

  /**
   * The studio's grid only. A one-off `13:00` already on the books shows in the
   * pane, but it is not an hour the sheet should offer for a new booking.
   *
   * Empty until a service is chosen: without a duration there is no honest answer
   * to which hours are free, and a list that changes its mind after the fact is
   * worse than one that waits.
   */
  const slots = useMemo<readonly BookingSlot[]>(() => {
    if (!day || held === null) {
      return [];
    }

    return buildSlots(STUDIO_HOURS, STUDIO_SLOT_MINUTES).map((time) =>
      toBookingSlot(time, held, day.busy),
    );
  }, [day, held]);

  const isTimeLocked = useMemo(() => held === null, [held]);

  // Revalidates once a submit has failed, so the "at least one" error clears on the
  // add that resolves it rather than on the next submit.
  const setServiceIds = useCallback(
    (next: string[]) => setValue('serviceIds', next, { shouldValidate: isSubmitted }),
    [setValue, isSubmitted],
  );

  const addService = useCallback(
    (id: string) => {
      const current = getValues('serviceIds');

      if (id && !current.includes(id)) {
        setServiceIds([...current, id]);
      }
    },
    [getValues, setServiceIds],
  );

  const removeService = useCallback(
    (id: string) => {
      const next = getValues('serviceIds').filter((chosenId) => chosenId !== id);

      setServiceIds(next);

      // The select locks with no service chosen, and must not keep submitting a
      // value it no longer shows.
      if (next.length === 0) {
        setValue('time', '');
      }
    },
    [getValues, setServiceIds, setValue],
  );

  // Returns the failure rather than setting it, so the loop can word a partial
  // failure differently from a first one.
  const bookOne = useCallback(
    async (userId: string, serviceId: string, at: Date): Promise<string | null> => {
      try {
        const { data: result } = await registerSchedule({
          variables: {
            input: {
              userId,
              serviceId,
              date: at.toISOString(),
              status: BOOKING_STATUS,
            },
          },
        });

        if (!result) {
          return SCHEDULE_ERROR_MESSAGES.network;
        }

        switch (result.registerSchedule.__typename) {
          case 'RegisterScheduleSuccess':
            return null;

          case 'ScheduleAlreadyBookedError':
            return SCHEDULE_ERROR_MESSAGES.alreadyBooked;

          case 'UserNotFoundError':
            return SCHEDULE_ERROR_MESSAGES.clientNotFound;

          case 'ServiceNotFoundError':
            return SCHEDULE_ERROR_MESSAGES.serviceNotFound;
        }
      } catch (mutationError) {
        return isBadUserInput(mutationError)
          ? SCHEDULE_ERROR_MESSAGES.badInput
          : SCHEDULE_ERROR_MESSAGES.network;
      }
    },
    [registerSchedule],
  );

  const submit = useCallback(
    async (values: BookingFormValues): Promise<boolean> => {
      if (!day || held === null) {
        setError('root', { message: SCHEDULE_ERROR_MESSAGES.badInput });
        return false;
      }

      const at = toLocalDateTime(day.key, values.time);

      if (!at) {
        setError('root', { message: SCHEDULE_ERROR_MESSAGES.badInput });
        return false;
      }

      // The select disables a taken hour, but a chosen one can be taken afterwards
      // by adding another service — the option stays selected, and only this
      // catches it.
      if (isSlotTaken(values.time, held, day.busy)) {
        setError('time', { message: SCHEDULE_ERROR_MESSAGES.timeTaken });
        return false;
      }

      const bookings = toBookings(at, values.serviceIds, durations);

      for (const [index, booking] of bookings.entries()) {
        const failure = await bookOne(values.userId, booking.serviceId, booking.at);

        if (!failure) {
          continue;
        }

        if (index === 0) {
          setError('root', { message: failure });
          return false;
        }

        // What was booked stays booked, and must not be sent again on retry.
        setValue('serviceIds', values.serviceIds.slice(index));
        setValue('time', '');
        setError('root', {
          message: BOOKING_COPY.partialBooking(index, bookings.length, failure),
        });

        return false;
      }

      return true;
    },
    [day, held, durations, bookOne, setError, setValue],
  );

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  return {
    register,
    handleSubmit,
    submit,
    resetForm,
    errors,
    formError,
    // Not the mutation's `loading`: that drops between calls, which would re-enable
    // the button mid-chain and allow a double booking.
    isSaving: isSubmitting,
    slots,
    isTimeLocked,
    availableGroups,
    chosenServices,
    serviceSummary,
    submitLabel,
    addService,
    removeService,
  };
}
