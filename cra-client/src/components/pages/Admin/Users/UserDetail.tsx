import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import adminService from '../../../../services/admin.service';
import { User } from '../../../../services/auth.service';
import Button from '../../../common/Button/Button';
import './UserDetail.css';

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estado para los campos editables
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('USER');
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await adminService.getUserById(userId);
        setUser(response.data);

        // Inicializar los campos editables
        setName(response.data.name);
        setEmail(response.data.email);
        setRole(response.data.role);
        setBalance(response.data.balance);

        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar el usuario');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSave = async () => {
    if (!userId || !user) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      // Actualizar los datos básicos del usuario
      const updatedUser = await adminService.updateUser(userId, {
        name,
        email,
      });

      // Si el rol ha cambiado, actualizarlo
      if (role !== user.role) {
        await adminService.changeUserRole(userId, role);
      }

      // Si el balance ha cambiado, actualizarlo
      if (balance !== user.balance) {
        // Aquí podríamos implementar una función específica para actualizar el balance
        await adminService.updateUser(userId, { balance });
      }

      setUser(updatedUser.data);
      setSuccessMessage('Usuario actualizado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar el usuario');
      console.error('Error updating user:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (!userId || !user) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      const response = await adminService.changeUserRole(userId, newRole);
      setUser(response.data);
      setRole(response.data.role);

      setSuccessMessage(`Rol actualizado a ${newRole}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cambiar el rol');
      console.error('Error changing role:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleActivateUser = async () => {
    if (!userId || !user) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      const response = await adminService.activateUser(userId);
      setUser(response.data);
      setBalance(response.data.balance);

      setSuccessMessage('Usuario activado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al activar el usuario');
      console.error('Error activating user:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!userId || !user) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      const response = await adminService.deactivateUser(userId);
      setUser(response.data);
      setBalance(response.data.balance);

      setSuccessMessage('Usuario desactivado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al desactivar el usuario');
      console.error('Error deactivating user:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="user-detail-container">
        <div className="user-detail-loading">Cargando usuario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-detail-container">
        <div className="user-detail-error">
          <h2>Error</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/admin/users')}>Volver a la lista</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-detail-container">
        <div className="user-detail-error">
          <h2>Usuario no encontrado</h2>
          <Button onClick={() => navigate('/admin/users')}>Volver a la lista</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-detail-container">
      <div className="user-detail-header">
        <h1>Detalles del Usuario</h1>
        <Button onClick={() => navigate('/admin/users')}>Volver a la lista</Button>
      </div>

      {successMessage && (
        <div className="user-detail-success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="user-detail-error-message">
          {error}
        </div>
      )}

      <div className="user-detail-card">
        <div className="user-detail-section">
          <h2>Información Básica</h2>

          <div className="user-detail-field">
            <label htmlFor="user-id">ID:</label>
            <input
              id="user-id"
              type="text"
              value={user.id}
              disabled
              className="user-detail-input"
            />
          </div>

          <div className="user-detail-field">
            <label htmlFor="user-name">Nombre:</label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="user-detail-input"
            />
          </div>

          <div className="user-detail-field">
            <label htmlFor="user-email">Email:</label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="user-detail-input"
            />
          </div>

          <div className="user-detail-field">
            <label htmlFor="user-created">Fecha de registro:</label>
            <input
              id="user-created"
              type="text"
              value={formatDate(user.createdAt)}
              disabled
              className="user-detail-input"
            />
          </div>

          <div className="user-detail-field">
            <label htmlFor="user-updated">Última actualización:</label>
            <input
              id="user-updated"
              type="text"
              value={formatDate(user.updatedAt)}
              disabled
              className="user-detail-input"
            />
          </div>
        </div>

        <div className="user-detail-section">
          <h2>Rol y Estado</h2>

          <div className="user-detail-field">
            <label htmlFor="user-role">Rol:</label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="user-detail-select"
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="user-detail-field">
            <label htmlFor="user-balance">Balance:</label>
            <input
              id="user-balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="user-detail-input"
            />
          </div>

          <div className="user-detail-status">
            <p>Estado: {balance > 0 ? 'Activo' : 'Inactivo'}</p>
          </div>

          <div className="user-detail-actions">
            <Button
              variant="outline"
              onClick={() => handleRoleChange(role === 'ADMIN' ? 'USER' : 'ADMIN')}
              disabled={saving}
              className="role-button"
            >
              {role === 'ADMIN' ? 'Cambiar a Usuario' : 'Cambiar a Administrador'}
            </Button>

            {balance <= 0 ? (
              <Button
                onClick={handleActivateUser}
                disabled={saving}
                className="activate-button"
              >
                Activar Usuario
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleDeactivateUser}
                disabled={saving}
                className="deactivate-button"
              >
                Desactivar Usuario
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="user-detail-footer">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="save-button"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
};

export default UserDetail;
