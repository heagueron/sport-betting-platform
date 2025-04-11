import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Verificar si el usuario es administrador
  if (user?.role !== 'ADMIN') {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder a esta página.</p>
          <Button
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, {user.name}</p>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h2>Usuarios</h2>
          <p>Gestiona los usuarios de la plataforma.</p>
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/users')}
            >
              Gestionar Usuarios
            </Button>
          </div>
        </div>

        <div className="admin-card">
          <h2>Deportes</h2>
          <p>Administra los deportes disponibles en la plataforma.</p>
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/sports')}
            >
              Gestionar Deportes
            </Button>
          </div>
        </div>

        <div className="admin-card">
          <h2>Eventos</h2>
          <p>Administra los eventos deportivos.</p>
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/events')}
            >
              Gestionar Eventos
            </Button>
          </div>
        </div>

        <div className="admin-card">
          <h2>Apuestas</h2>
          <p>Revisa y gestiona las apuestas realizadas.</p>
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/bets')}
            >
              Gestionar Apuestas
            </Button>
          </div>
        </div>
      </div>

      <div className="admin-footer">
        <Button
          onClick={() => navigate('/')}
        >
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};

export default AdminPage;
