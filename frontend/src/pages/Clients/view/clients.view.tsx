import { useCallback, useMemo, useState } from 'react';
import { ClientForm } from '../../../components/ClientForm';
import { ClientRow } from '../../../components/ClientRow';
import { DeleteClientModal } from '../../../components/DeleteClientModal';
import { EditClientModal } from '../../../components/EditClientModal';
import { Loader } from '../../../components/Loader';
import { PageHeader } from '../../../components/PageHeader';
import { useClientsViewModel } from '../viewmodel/clients.viewmodel';
import styles from './clients.view.module.css';

export function ClientsView() {
  const {
    clientIds,
    sentinelRef,
    isLoading,
    isLoadingMore,
    loadError,
    resetForm,
    register,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting,
  } = useClientsViewModel();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const closeEdit = useCallback(() => setEditingId(null), []);
  const closeDelete = useCallback(() => setDeletingId(null), []);

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (values) => {
        if (await submit(values)) {
          resetForm();
        }
      }),
    [handleSubmit, submit, resetForm],
  );

  const isEmpty = useMemo(
    () => !isLoading && !loadError && clientIds.length === 0,
    [isLoading, loadError, clientIds.length],
  );

  const renderLoadError = () => (
    <p className={styles.loadError} role="alert">
      {loadError}
    </p>
  );

  const renderIsEmptyMessage = () => (
    <div className={styles.emptyPanel}>
      <p className={styles.emptyTitle}>Ainda sem clientes</p>
      <p className={styles.emptyBody}>
        Adicione a primeira acima. Cada cliente recebe uma página pessoal com a sua fidelidade e as
        cores disponíveis.
      </p>
    </div>
  );

  return (
    <main className={styles.page}>
      <PageHeader whisper="as nossas" title="Clientes" />

      <ClientForm
        register={register}
        errors={errors}
        onSubmit={onSubmit}
        formError={formError}
        isSubmitting={isSubmitting}
        submitLabel="ADICIONAR"
        busyLabel="A ADICIONAR…"
        layout="bar"
      />

      {loadError && renderLoadError()}

      {isEmpty && renderIsEmptyMessage()}

      <div className={styles.list}>
        {clientIds.map((id) => (
          <ClientRow key={id} id={id} onEdit={setEditingId} onDelete={setDeletingId} />
        ))}

        {/* The add bar is at the top of this page, so there is no tile to hang the
            sentinel on — it gets an element of its own after the last row. */}
        <div className={styles.sentinel} aria-hidden="true" ref={sentinelRef} />
      </div>

      {isLoadingMore && <Loader />}

      <EditClientModal clientId={editingId} onClose={closeEdit} />
      <DeleteClientModal clientId={deletingId} onClose={closeDelete} />
    </main>
  );
}
