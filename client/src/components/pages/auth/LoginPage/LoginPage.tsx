import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { MainLayout } from '../../../layout/MainLayout/MainLayout';
import { Input } from '../../../common/Input/Input';
import { Button } from '../../../common/Button/Button';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, error: loginError } = useAuthContext();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
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
            <h1 className={styles.loginTitle}>Login to BetMaster</h1>
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
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              <Button type="submit" fullWidth>
                Login
              </Button>
              <div className={styles.formFooter}>
                <Link to="/forgot-password">Forgot password?</Link>
                <span className={styles.registerLink}>
                  Don't have an account? <Link to="/register">Register</Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
