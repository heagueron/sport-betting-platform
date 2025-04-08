import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import './LoginForm.css';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const { t } = useTranslation();
  const { login, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
    };

    let isValid = true;

    // Email validation
    if (!formData.email) {
      errors.email = t('auth.validation.emailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('auth.validation.emailInvalid');
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = t('auth.validation.passwordRequired');
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }

    // Clear global error when typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <Input
          type="email"
          name="email"
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          fullWidth
          required
        />

        <Input
          type="password"
          name="password"
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          fullWidth
          required
        />

        <div className="form-actions">
          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.loading') : t('auth.login')}
          </Button>
        </div>

        {onRegisterClick && (
          <div className="form-footer">
            <p>
              {t('auth.noAccount')}{' '}
              <button
                type="button"
                className="text-button"
                onClick={onRegisterClick}
              >
                {t('auth.registerNow')}
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
