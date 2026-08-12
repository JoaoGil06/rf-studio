import { useCallback, useMemo, useState } from 'react';
import { AddTile } from '../../../components/AddTile';
import { CategoryTabs } from '../../../components/CategoryTabs';
import { DeleteProductModal } from '../../../components/DeleteProductModal';
import { EditProductModal } from '../../../components/EditProductModal';
import { Loader } from '../../../components/Loader';
import { Modal } from '../../../components/Modal';
import { PageHeader } from '../../../components/PageHeader';
import { ProductCard } from '../../../components/ProductCard';
import { ProductForm } from '../../../components/ProductForm';
import { useProductsViewModel } from '../viewmodel/products.viewmodel';
import styles from './products.view.module.css';

export function ProductsView() {
  const {
    categories,
    category,
    selectCategory,
    productIds,
    sentinelRef,
    isLoading,
    isLoadingMore,
    loadError,
    resetForm,
    register,
    control,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting,
  } = useProductsViewModel();
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
    () => !isLoading && !loadError && productIds.length === 0,
    [isLoading, loadError, productIds.length],
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
      <p className={styles.emptyTitle}>Ainda sem {category.noun}.</p>
      <p className={styles.emptyBody}>
        Comece pelo cartão de adição — o primeiro fica disponível de imediato.
      </p>
    </div>
  );

  return (
    <main className={styles.page}>
      <PageHeader whisper="gestão de" title="Produtos">
        <CategoryTabs
          categories={categories}
          activeSlug={category.slug}
          onSelect={selectCategory}
          label="Categoria de produtos"
        />
      </PageHeader>

      {loadError && renderLoadError()}

      {isEmpty && renderIsEmptyMessage()}

      <div className={styles.grid}>
        {productIds.map((id) => (
          <ProductCard key={id} id={id} onEdit={setEditingId} onDelete={setDeletingId} />
        ))}

        {/* Also the pagination sentinel: the tile is the last cell of the grid by
            design, so approaching it is approaching the end of the list. */}
        <AddTile label={addLabel} onClick={openForm} ref={sentinelRef} />
      </div>

      {isLoadingMore && <Loader />}

      <Modal isOpen={isFormOpen} onClose={closeForm} title={formTitle}>
        <ProductForm
          category={category}
          register={register}
          control={control}
          errors={errors}
          onSubmit={onSubmit}
          formError={formError}
          isSubmitting={isSubmitting}
          submitLabel="ADICIONAR"
          busyLabel="A ADICIONAR…"
        />
      </Modal>

      <EditProductModal productId={editingId} onClose={closeEdit} />
      <DeleteProductModal productId={deletingId} onClose={closeDelete} />
    </main>
  );
}
