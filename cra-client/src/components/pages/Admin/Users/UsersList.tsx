import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../../services/admin.service';
import { User } from '../../../../services/auth.service';
import Button from '../../../common/Button/Button';
import './UsersList.css';

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getUsers();
        setUsers(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar los usuarios');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="users-loading">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="users-error">Error: {error}</div>;
  }

  return (
    <div className="users-list-container">
      <div className="users-list-header">
        <h1>Gestión de Usuarios</h1>
        <p>Total de usuarios: {users.length}</p>
      </div>

      <div className="users-list-table-container">
        <table className="users-list-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`user-role ${user.role.toLowerCase()}`}>
                    {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewUser(user.id)}
                    className="view-user-button"
                  >
                    Ver detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;
