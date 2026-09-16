import { useFragment } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const RESERVATION_ROW_FRAGMENT = graphql(`
  fragment ReservationRowFields on Schedule {
    id
    date
    status
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

export function useReservationRowModel(id: string) {
  const { data, complete } = useFragment({
    fragment: RESERVATION_ROW_FRAGMENT,
    fragmentName: 'ReservationRowFields',
    from: { __typename: 'Schedule', id },
  });

  return { reservation: complete ? data : null };
}
