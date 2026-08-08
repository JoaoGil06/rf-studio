import { useMemo } from 'react';
import { LoginForm } from '../../../components/LoginForm';
import { useLoginViewModel } from '../viewmodel/login.viewmodel';
import styles from './login.view.module.css';

export function LoginView() {
  const { register, handleSubmit, submit, errors, formError, isSubmitting } = useLoginViewModel();

  const onSubmit = useMemo(() => handleSubmit(submit), [handleSubmit, submit]);

  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <div className={styles.logotype}>Rita Ferreira</div>
        <div className={styles.tagline}>NAILS AND BROWS DESIGNER</div>
      </div>

      <LoginForm
        register={register}
        errors={errors}
        onSubmit={onSubmit}
        formError={formError}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
