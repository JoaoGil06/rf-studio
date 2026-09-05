import { useMemo } from 'react';
import { formatPhoneNumber } from '../../../lib/format/phone';
import { useClientRowModel } from '../model/clientRow.model';
import type { ClientRowViewModel } from '../types/clientRow.types';

export const UNKNOWN_INITIAL = '?';

export function useClientRowViewModel(id: string): ClientRowViewModel | null {
  const { client } = useClientRowModel(id);

  return useMemo(() => {
    if (!client) {
      return null;
    }

    const clientInitial = client.name.trim().charAt(0).toUpperCase() || UNKNOWN_INITIAL;

    return {
      name: client.name,
      // The fallback is load-bearing: a name that is only whitespace yields an
      // empty string, and an empty avatar reads as a rendering fault.
      initial: clientInitial,
      phoneNumber: formatPhoneNumber(client.phoneNumber),
      email: client.email,
    };
  }, [client]);
}
