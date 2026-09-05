import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { isBadUserInput } from '../../../graphql/errors';
import { CLIENT_ERROR_MESSAGES } from '../../../utils/constants/clientMessages';
import { clientSchema, type ClientFormValues } from '../../ClientForm/types/clientForm.types';
import { useEditClientModalModel } from '../model/editClientModal.model';

export const EDIT_CLIENT_LABELS = {
  title: 'Editar cliente',
  submit: 'GUARDAR',
  busy: 'A GUARDAR…',
} as const;

export function useEditClientModalViewModel(clientId: string | null) {
  const { client, updateClient, isSaving } = useEditClientModalModel(clientId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClientFormValues>({ resolver: zodResolver(clientSchema), mode: 'onSubmit' });

  useEffect(() => {
    if (!client) {
      return;
    }

    reset({ name: client.name, email: client.email, phoneNumber: client.phoneNumber });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, reset]);

  const submit = useCallback(
    async (values: ClientFormValues): Promise<boolean> => {
      if (!clientId) {
        return false;
      }

      try {
        const { data: result } = await updateClient({
          variables: {
            input: {
              id: clientId,
              name: values.name,
              email: values.email,
              phoneNumber: values.phoneNumber,
              // No birthDate: the backend reads an omitted field as "leave it
              // alone", and no surface in this app has ever collected one.
            },
          },
        });

        if (!result) {
          setError('root', { message: CLIENT_ERROR_MESSAGES.network });
          return false;
        }

        switch (result.updateUser.__typename) {
          case 'UpdateUserSuccess':
            return true;

          case 'UserAlreadyExistsError':
            setError('root', { message: CLIENT_ERROR_MESSAGES.alreadyExists });
            return false;

          case 'UserNotFoundError':
            setError('root', { message: CLIENT_ERROR_MESSAGES.notFound });
            return false;
        }
      } catch (mutationError) {
        setError('root', {
          message: isBadUserInput(mutationError)
            ? CLIENT_ERROR_MESSAGES.badInput
            : CLIENT_ERROR_MESSAGES.network,
        });

        return false;
      }
    },
    [updateClient, clientId, setError],
  );

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  return {
    client,
    title: EDIT_CLIENT_LABELS.title,
    submitLabel: EDIT_CLIENT_LABELS.submit,
    busyLabel: EDIT_CLIENT_LABELS.busy,
    register,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting: isSaving,
  };
}
