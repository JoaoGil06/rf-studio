import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { isBadUserInput } from '../../../graphql/errors';
import { buildSlots, isSlotTaken, toLocalDateTime } from '../../../lib/date/slots';
import { SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import { BOOKING_STATUS } from '../../../utils/constants/scheduleStatuses';
import { STUDIO_HOURS, STUDIO_SLOT_MINUTES } from '../../../utils/constants/studioHours';
import {
  bookingFormDefaults,
  bookingSchema,
  type BookingDay,
  type BookingFormValues,
  type BookingSlot,
  type ServiceOptionGroup,
} from '../../BookingForm/types/bookingForm.types';
import { useNewReservationModalModel } from '../model/newReservationModal.model';

export function useNewReservationModalViewModel(
  day: BookingDay | null,
  serviceGroups: readonly ServiceOptionGroup[],
) {
  const { registerSchedule, isSaving } = useNewReservationModalModel();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: 'onSubmit',
    defaultValues: bookingFormDefaults,
  });

  const resetForm = useCallback(() => reset(bookingFormDefaults), [reset]);

  const durations = useMemo(() => {
    const byService = new Map<string, number>();

    for (const group of serviceGroups) {
      for (const option of group.options) {
        byService.set(
          option.id,
          option.durationMinutes > 0 ? option.durationMinutes : STUDIO_SLOT_MINUTES,
        );
      }
    }

    return byService;
  }, [serviceGroups]);

  // The service is already stored — by `react-hook-form` — so the hour list is
  // derived from it rather than mirrored into state of its own. `useWatch` rather
  // than `watch()`: it subscribes to this one field, and it is a hook the React
  // Compiler can actually memoize around.
  const serviceId = useWatch({ control, name: 'serviceId' });

  const held = useMemo(() => durations.get(serviceId) ?? null, [durations, serviceId]);

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

    return buildSlots(STUDIO_HOURS, STUDIO_SLOT_MINUTES).map((time) => ({
      time,
      isTaken: isSlotTaken(time, held, day.busy),
    }));
  }, [day, held]);

  const isTimeLocked = useMemo(() => held === null, [held]);

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
      // by switching to a longer service — the option stays selected, and only
      // this catches it.
      if (isSlotTaken(values.time, held, day.busy)) {
        setError('time', { message: SCHEDULE_ERROR_MESSAGES.timeTaken });
        return false;
      }

      try {
        const { data: result } = await registerSchedule({
          variables: {
            input: {
              userId: values.userId,
              serviceId: values.serviceId,
              date: at.toISOString(),
              status: BOOKING_STATUS,
            },
          },
        });

        if (!result) {
          setError('root', { message: SCHEDULE_ERROR_MESSAGES.network });
          return false;
        }

        switch (result.registerSchedule.__typename) {
          case 'RegisterScheduleSuccess':
            return true;

          case 'ScheduleAlreadyBookedError':
            setError('root', { message: SCHEDULE_ERROR_MESSAGES.alreadyBooked });
            return false;

          case 'UserNotFoundError':
            setError('root', { message: SCHEDULE_ERROR_MESSAGES.clientNotFound });
            return false;

          case 'ServiceNotFoundError':
            setError('root', { message: SCHEDULE_ERROR_MESSAGES.serviceNotFound });
            return false;
        }
      } catch (mutationError) {
        setError('root', {
          message: isBadUserInput(mutationError)
            ? SCHEDULE_ERROR_MESSAGES.badInput
            : SCHEDULE_ERROR_MESSAGES.network,
        });

        return false;
      }
    },
    [day, held, registerSchedule, setError],
  );

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  return {
    register,
    handleSubmit,
    submit,
    resetForm,
    errors,
    formError,
    isSaving,
    slots,
    isTimeLocked,
  };
}
