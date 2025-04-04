import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { MainLayout } from '../../../layout/MainLayout/MainLayout';
import { Input } from '../../../common/Input/Input';
import { Button } from '../../../common/Button/Button';
import styles from './RegisterPage.module.css';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { register, error: registerError } = useAuthContext();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!name) {
      newErrors.name = t('auth.nameRequired');
      isValid = false;
    }

    if (!email) {
      newErrors.email = t('auth.emailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.emailInvalid');
      isValid = false;
    }

    if (!password) {
      newErrors.password = t('auth.passwordRequired');
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = t('auth.passwordMinLength');
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await register({ name, email, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <MainLayout hideSidebar>
      <div className={styles.registerPage}>
        <div className={styles.registerCard}>
          <div className={styles.registerHeader}>
            <h1 className={styles.registerTitle}>{t('auth.createAccount')}</h1>
          </div>
          <div className={styles.registerBody}>
            {registerError && (
              <div className="error-message" style={{ color: 'var(--error)', marginBottom: 'var(--spacing-md)' }}>
                {registerError}
              </div>
            )}
            <form className={styles.registerForm} onSubmit={handleSubmit}>
              <Input
                type="text"
                label={t('auth.name')}
                placeholder={t('auth.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              <Input
                type="email"
                label={t('auth.email')}
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Input
                type="password"
                label={t('auth.password')}
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                helperText={t('auth.passwordMinLength')}
              />
              <Input
                type="password"
                label={t('auth.confirmPassword')}
                placeholder={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
              />
              <Button type="submit" fullWidth>
                {t('auth.register')}
              </Button>
              <div className={styles.termsText}>
                {t('auth.termsAgreement')}{' '}
                <Link to="/terms">{t('auth.termsOfService')}</Link> {t('auth.and')}{' '}
                <Link to="/privacy">{t('auth.privacyPolicy')}</Link>.
              </div>
              <div className={styles.formFooter}>
                <span className={styles.loginLink}>
                  {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.login')}</Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
