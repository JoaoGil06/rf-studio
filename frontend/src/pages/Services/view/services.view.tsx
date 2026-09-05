import { useCallback, useMemo, useState } from 'react';
import { AddTile } from '../../../components/AddTile';
import { CategoryTabs } from '../../../components/CategoryTabs';
import { DeleteServiceModal } from '../../../components/DeleteServiceModal';
import { EditServiceModal } from '../../../components/EditServiceModal';
import { Loader } from '../../../components/Loader';
import { Modal } from '../../../components/Modal';
import { PageHeader } from '../../../components/PageHeader';
import { ServiceCard } from '../../../components/ServiceCard';
import { ServiceForm } from '../../../components/ServiceForm';
import { useServicesViewModel } from '../viewmodel/services.viewmodel';
import styles from './services.view.module.css';

export function ServicesView() {
  const {
    categories,
    category,
    selectCategory,
    serviceIds,
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
  } = useServicesViewModel();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const closeEdit = useCallback(() => setEditingId(null), []);
  const closeDelete = useCallback(() => setDeletingId(null), []);

  const openForm = useCallback(() => {
    resetForm();
    setIsFormOpen(true);
  }, [resetForm]);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    resetForm();
  }, [resetForm]);

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (values) => {
        if (await submit(values)) {
          closeForm();
        }
      }),
    [handleSubmit, submit, closeForm],
  );

  const isEmpty = useMemo(
    () => !isLoading && !loadError && serviceIds.length === 0,
    [isLoading, loadError, serviceIds.length],
  );

  const formTitle = useMemo(() => `Novo ${category.noun}`, [category.noun]);
  const addLabel = useMemo(() => `Adicionar ${category.noun}`, [category.noun]);

  const renderLoadError = () => (
    <p className={styles.loadError} role="alert">
      {loadError}
    </p>
  );

  const renderIsEmptyMessage = () => (
    <div className={styles.emptyPanel}>
      <p className={styles.emptyTitle}>Ainda sem serviços.</p>
      <p className={styles.emptyBody}>
        Comece pelo cartão de adição — o primeiro fica disponível de imediato.
      </p>
    </div>
  );

  return (
    <main className={styles.page}>
      <PageHeader whisper="gestão de" title="Serviços">
        <CategoryTabs
          categories={categories}
          activeSlug={category.slug}
          onSelect={selectCategory}
          label="Categoria de serviços"
        />
      </PageHeader>

      {loadError && renderLoadError()}

      {isEmpty && renderIsEmptyMessage()}

      <div className={styles.grid}>
        {serviceIds.map((id) => (
          <ServiceCard key={id} id={id} onEdit={setEditingId} onDelete={setDeletingId} />
        ))}

        <AddTile label={addLabel} onClick={openForm} ref={sentinelRef} />
      </div>

      {isLoadingMore && <Loader />}

      <p className={styles.note}>
        Os serviços ficam disponíveis para associar às reservas ao concluir.
      </p>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={formTitle}>
        <ServiceForm
          register={register}
          errors={errors}
          onSubmit={onSubmit}
          formError={formError}
          isSubmitting={isSubmitting}
          submitLabel="ADICIONAR"
          busyLabel="A ADICIONAR…"
        />
      </Modal>

      <EditServiceModal serviceId={editingId} onClose={closeEdit} />
      <DeleteServiceModal serviceId={deletingId} onClose={closeDelete} />
    </main>
  );
}
