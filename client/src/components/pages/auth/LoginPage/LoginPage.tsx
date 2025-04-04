import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { MainLayout } from '../../../layout/MainLayout/MainLayout';
import { Input } from '../../../common/Input/Input';
import { Button } from '../../../common/Button/Button';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, error: loginError } = useAuthContext();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

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
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await login({ email, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <MainLayout hideSidebar>
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>{t('auth.loginToAccount')}</h1>
          </div>
          <div className={styles.loginBody}>
            {loginError && (
              <div className="error-message" style={{ color: 'var(--error)', marginBottom: 'var(--spacing-md)' }}>
                {loginError}
              </div>
            )}
            <form className={styles.loginForm} onSubmit={handleSubmit}>
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
              />
              <Button type="submit" fullWidth>
                {t('auth.login')}
              </Button>
              <div className={styles.formFooter}>
                <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
                <span className={styles.registerLink}>
                  {t('auth.dontHaveAccount')} <Link to="/register">{t('auth.register')}</Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
