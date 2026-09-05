import { useMemo } from 'react';
import { formatPhoneNumber } from '../../../lib/format/phone';
import { useClientRowModel } from '../model/clientRow.model';
import type { ClientRowViewModel } from '../types/clientRow.types';

export const UNKNOWN_INITIAL = '?';

export const ACTION_LABELS = {
  edit: 'Editar',
  delete: 'Remover',
} as const;

export function useClientRowViewModel(id: string): ClientRowViewModel | null {
  const { client } = useClientRowModel(id);

  return useMemo(() => {
    if (!client) {
      return null;
    }

    const clientInitial = client.name.trim().charAt(0).toUpperCase() || UNKNOWN_INITIAL;

    return {
      name: client.name,
      initial: clientInitial,
      phoneNumber: formatPhoneNumber(client.phoneNumber),
      email: client.email,
      editLabel: `${ACTION_LABELS.edit} ${client.name}`,
      deleteLabel: `${ACTION_LABELS.delete} ${client.name}`,
    };
  }, [client]);
}
