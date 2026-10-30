import { useFragment, useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';
import {
  removeFromScheduleConnections,
  SCHEDULES_OPERATION,
} from '../../../graphql/scheduleConnections';

export const RESERVATION_STATUS_FRAGMENT = graphql(`
  fragment ReservationStatusFields on Schedule {
    id
    status
    date
    user {
      id
      name
    }
  }
`);

export const UPDATE_RESERVATION_STATUS_MUTATION = graphql(`
  mutation UpdateReservationStatus($input: UpdateScheduleInput!) {
    updateSchedule(input: $input) {
      __typename
      ... on UpdateScheduleSuccess {
        schedule {
          id
          status
        }
      }
      ... on ScheduleNotFoundError {
        message
      }
      ... on ServiceNotFoundError {
        message
      }
      ... on ScheduleAlreadyBookedError {
        message
      }
    }
  }
`);

export function useReservationStatusModalModel(scheduleId: string | null) {
  const { data, complete } = useFragment({
    fragment: RESERVATION_STATUS_FRAGMENT,
    fragmentName: 'ReservationStatusFields',
    from: scheduleId ? { __typename: 'Schedule' as const, id: scheduleId } : null,
  });

  const [updateStatus, { loading }] = useMutation(UPDATE_RESERVATION_STATUS_MUTATION, {
    update(cache, { data: result }) {
      if (result?.updateSchedule.__typename !== 'UpdateScheduleSuccess') {
        return;
      }

      removeFromScheduleConnections(cache, result.updateSchedule.schedule.id);
    },
    refetchQueries: [SCHEDULES_OPERATION],
  });

  return {
    reservation: complete ? data : null,
    updateStatus,
    isUpdating: loading,
  };
}
