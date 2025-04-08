import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import './RegisterForm.css';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const { t } = useTranslation();
  const { register, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    
    let isValid = true;
    
    // Name validation
    if (!formData.name) {
      errors.name = t('auth.validation.nameRequired');
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = t('auth.validation.nameLength');
      isValid = false;
    }
    
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
    } else if (formData.password.length < 6) {
      errors.password = t('auth.validation.passwordLength');
      isValid = false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = t('auth.validation.confirmPasswordRequired');
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.validation.passwordsDoNotMatch');
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
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      
      await register(registerData);
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
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        
        <Input
          type="text"
          name="name"
          label={t('auth.name')}
          placeholder={t('auth.namePlaceholder')}
          value={formData.name}
          onChange={handleChange}
          error={formErrors.name}
          fullWidth
          required
        />
        
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
        
        <Input
          type="password"
          name="confirmPassword"
          label={t('auth.confirmPassword')}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={formErrors.confirmPassword}
          fullWidth
          required
        />
        
        <div className="form-actions">
          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.loading') : t('auth.register')}
          </Button>
        </div>
        
        {onLoginClick && (
          <div className="form-footer">
            <p>
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                type="button"
                className="text-button"
                onClick={onLoginClick}
              >
                {t('auth.loginHere')}
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;
