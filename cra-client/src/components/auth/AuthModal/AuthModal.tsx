import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../common/Modal/Modal';
import LoginForm from '../LoginForm/LoginForm';
import RegisterForm from '../RegisterForm/RegisterForm';
import './AuthModal.css';

export type AuthModalMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  const handleSuccess = () => {
    onClose();
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  // Asegurarse de que el modo se actualice cuando cambia initialMode
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const title = mode === 'login' ? t('auth.login') : t('auth.register');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="auth-modal">
      <div className="auth-modal-content">
        {mode === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onRegisterClick={toggleMode} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onLoginClick={toggleMode} />
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;
