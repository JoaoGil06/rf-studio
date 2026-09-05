import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  clientFormDefaults,
  clientSchema,
  type ClientFormValues,
} from '../../../components/ClientForm/types/clientForm.types';
import { isBadUserInput } from '../../../graphql/errors';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { CLIENT_ERROR_MESSAGES } from '../../../utils/constants/clientMessages';
import { useClientsModel } from '../model/clients.model';

export function useClientsViewModel() {
  const { data, loading, error, isLoadingMore, canLoadMore, loadMore, registerClient } =
    useClientsModel();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    mode: 'onSubmit',
    defaultValues: clientFormDefaults,
  });

  const clientIds = useMemo(() => (data?.users.edges ?? []).map((edge) => edge.node.id), [data]);

  const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, enabled: canLoadMore });

  const resetForm = useCallback(() => reset(clientFormDefaults), [reset]);

  const submit = useCallback(
    async (values: ClientFormValues): Promise<boolean> => {
      try {
        const { data: result } = await registerClient({
          variables: {
            input: {
              name: values.name,
              email: values.email,
              phoneNumber: values.phoneNumber,
              // No password: the backend generates one it never returns. The
              // client's surface is the ?hash= link, not a password login.
            },
          },
        });

        if (!result) {
          setError('root', { message: CLIENT_ERROR_MESSAGES.network });
          return false;
        }

        switch (result.registerUser.__typename) {
          case 'RegisterUserSuccess':
            // The refetch has already landed (awaitRefetchQueries), so the bar
            // clears onto a list that already shows her.
            return true;

          case 'UserAlreadyExistsError':
            setError('root', { message: CLIENT_ERROR_MESSAGES.alreadyExists });
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
    [registerClient, setError],
  );

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  const loadError = useMemo(() => (error ? CLIENT_ERROR_MESSAGES.load : null), [error]);

  return {
    clientIds,
    sentinelRef,
    isLoading: loading,
    isLoadingMore,
    loadError,
    resetForm,
    register,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting,
  };
}
