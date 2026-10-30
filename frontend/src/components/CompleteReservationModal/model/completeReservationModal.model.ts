import { useFragment, useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';
import {
  removeFromScheduleConnections,
  SCHEDULES_OPERATION,
} from '../../../graphql/scheduleConnections';

export const COMPLETE_RESERVATION_FRAGMENT = graphql(`
  fragment CompleteReservationFields on Schedule {
    id
    date
    finalPrice
    user {
      id
      name
    }
    service {
      id
      name
      category
    }
  }
`);

export const COMPLETE_RESERVATION_MUTATION = graphql(`
  mutation CompleteReservation($input: CompleteScheduleInput!) {
    completeSchedule(input: $input) {
      __typename
      ... on CompleteScheduleSuccess {
        schedule {
          id
          status
          tip
          finalPrice
        }
      }
      ... on ScheduleNotFoundError {
        message
      }
      ... on ServiceNotFoundError {
        message
      }
      ... on ProductNotFoundError {
        message
      }
      ... on ScheduleNotCompletableError {
        message
      }
    }
  }
`);

export const RESERVATION_PRODUCTS_OPERATION = 'ReservationProducts';

export function useCompleteReservationModalModel(scheduleId: string) {
  const { data, complete } = useFragment({
    fragment: COMPLETE_RESERVATION_FRAGMENT,
    fragmentName: 'CompleteReservationFields',
    from: { __typename: 'Schedule' as const, id: scheduleId },
  });

  const [completeSchedule, { loading }] = useMutation(COMPLETE_RESERVATION_MUTATION, {
    update(cache, { data: result }) {
      if (result?.completeSchedule.__typename !== 'CompleteScheduleSuccess') {
        return;
      }

      removeFromScheduleConnections(cache, result.completeSchedule.schedule.id);
    },
    refetchQueries: ({ data: result }) =>
      result?.completeSchedule.__typename === 'ProductNotFoundError'
        ? [SCHEDULES_OPERATION, RESERVATION_PRODUCTS_OPERATION]
        : [SCHEDULES_OPERATION],
  });

  return { reservation: complete ? data : null, completeSchedule, isSaving: loading };
}
