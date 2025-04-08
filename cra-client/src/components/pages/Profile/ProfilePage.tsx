import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import Card, { CardHeader, CardBody } from '../../common/Card/Card';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import authService from '../../../services/auth.service';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(true);
    setUpdateSuccess(false);
    setUpdateError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormErrors({
      name: '',
      email: '',
    });
  };

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: '',
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

    // Clear update messages
    setUpdateSuccess(false);
    setUpdateError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setUpdateSuccess(false);
    setUpdateError('');

    try {
      await updateUser(formData);
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (error: any) {
      setUpdateError(error.response?.data?.error || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return <div className="profile-loading">{t('common.loading')}</div>;
  }

  return (
    <div className="profile-page">
      <div className="page-container profile-container">
        <h1 className="profile-title">{t('profile.title')}</h1>

        <Card className="profile-card">
          <CardHeader>
            <h2 className="profile-card-title">{t('profile.personalInfo')}</h2>
          </CardHeader>
          <CardBody>
            {updateSuccess && (
              <div className="profile-success-message">
                {t('profile.updateSuccess')}
              </div>
            )}

            {updateError && (
              <div className="profile-error-message">
                {updateError}
              </div>
            )}

            {isEditing ? (
              <form className="profile-form" onSubmit={handleSubmit}>
                <Input
                  type="text"
                  name="name"
                  label={t('auth.name')}
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
                  value={formData.email}
                  onChange={handleChange}
                  error={formErrors.email}
                  fullWidth
                  required
                />

                <div className="profile-form-actions">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    {t('common.cancel')}
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('common.loading') : t('common.save')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="profile-info-item">
                  <span className="profile-info-label">{t('auth.name')}:</span>
                  <span className="profile-info-value">{user.name}</span>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-label">{t('auth.email')}:</span>
                  <span className="profile-info-value">{user.email}</span>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-label">{t('profile.role')}:</span>
                  <span className="profile-info-value">{user.role}</span>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-label">{t('profile.balance')}:</span>
                  <span className="profile-info-value">${user.balance.toFixed(2)}</span>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-label">{t('profile.memberSince')}:</span>
                  <span className="profile-info-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="profile-actions">
                  <Button onClick={handleEdit}>
                    {t('common.edit')}
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
