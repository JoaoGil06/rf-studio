import { useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const REGISTER_SCHEDULE_MUTATION = graphql(`
  mutation RegisterSchedule($input: RegisterScheduleInput!) {
    registerSchedule(input: $input) {
      __typename
      ... on RegisterScheduleSuccess {
        schedule {
          id
          date
          status
          finalPrice
          service {
            id
            durationMinutes
          }
          ...ReservationEntryFields
        }
      }
      ... on UserNotFoundError {
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

export function useNewReservationModalModel() {
  const [registerSchedule, { loading }] = useMutation(REGISTER_SCHEDULE_MUTATION, {
    refetchQueries: ['Agenda'],
    awaitRefetchQueries: true,
  });

  return { registerSchedule, isSaving: loading };
}
