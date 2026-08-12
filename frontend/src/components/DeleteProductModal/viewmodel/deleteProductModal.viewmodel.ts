import { useCallback } from 'react';
import { isBadUserInput } from '../../../graphql/errors';
import { PRODUCT_ERROR_MESSAGES } from '../../../utils/constants/productMessages';
import { useDeleteProductModalModel } from '../model/deleteProductModal.model';

export const DELETE_PRODUCT_LABELS = {
  title: 'Remover produto',
  keep: 'MANTER',
  remove: 'REMOVER',
} as const;

export function useDeleteProductModalViewModel(productId: string | null) {
  const { product, deleteProduct, isDeleting } = useDeleteProductModalModel(productId);

  const confirm = useCallback(async (): Promise<string | null> => {
    if (!productId) {
      return PRODUCT_ERROR_MESSAGES.deleteFailed;
    }

    try {
      const { data: result } = await deleteProduct({ variables: { input: { id: productId } } });

      if (!result) {
        return PRODUCT_ERROR_MESSAGES.network;
      }

      switch (result.deleteProduct.__typename) {
        case 'DeleteProductSuccess':
          return null;

        case 'ProductNotFoundError':
          return PRODUCT_ERROR_MESSAGES.notFound;
      }
    } catch (mutationError) {
      return isBadUserInput(mutationError)
        ? PRODUCT_ERROR_MESSAGES.badInput
        : PRODUCT_ERROR_MESSAGES.network;
    }
  }, [deleteProduct, productId]);

  return {
    name: product?.name ?? null,
    confirm,
    isDeleting,
    title: DELETE_PRODUCT_LABELS.title,
    keepLabel: DELETE_PRODUCT_LABELS.keep,
    removeLabel: DELETE_PRODUCT_LABELS.remove,
  };
}
