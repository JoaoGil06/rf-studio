import { useFragment } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const RESERVATION_ENTRY_FRAGMENT = graphql(`
  fragment ReservationEntryFields on Schedule {
    id
    date
    status
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

export function useReservationEntryModel(id: string) {
  const { data, complete } = useFragment({
    fragment: RESERVATION_ENTRY_FRAGMENT,
    fragmentName: 'ReservationEntryFields',
    from: { __typename: 'Schedule', id },
  });

  return { reservation: complete ? data : null };
}
