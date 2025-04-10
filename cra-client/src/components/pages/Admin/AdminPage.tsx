import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Verificar si el usuario es administrador
  if (user?.role !== 'ADMIN') {
    return (
      <div className="container">
        <div className="access-denied" style={{ textAlign: 'center', margin: '2rem 0' }}>
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder a esta página.</p>
          <Button
            onClick={() => navigate('/')}
            className="modern-button"
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ margin: '2rem 0' }}>
        <h1>Panel de Administración</h1>
        <p>Bienvenido, {user.name}</p>

        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div className="admin-card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', height: '100%' }}>
            <h2>Usuarios</h2>
            <p>Gestiona los usuarios de la plataforma.</p>
            <div style={{ marginTop: '10px' }}>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                className="modern-button"
              >
                Gestionar Usuarios
              </Button>
            </div>
          </div>

          <div className="admin-card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', height: '100%' }}>
            <h2>Deportes</h2>
            <p>Administra los deportes disponibles en la plataforma.</p>
            <div style={{ marginTop: '10px' }}>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/sports')}
                className="modern-button"
              >
                Gestionar Deportes
              </Button>
            </div>
          </div>

          <div className="admin-card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', height: '100%' }}>
            <h2>Eventos</h2>
            <p>Administra los eventos deportivos.</p>
            <div style={{ marginTop: '10px' }}>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/events')}
                className="modern-button"
              >
                Gestionar Eventos
              </Button>
            </div>
          </div>

          <div className="admin-card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', height: '100%' }}>
            <h2>Apuestas</h2>
            <p>Revisa y gestiona las apuestas realizadas.</p>
            <div style={{ marginTop: '10px' }}>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/bets')}
                className="modern-button"
              >
                Gestionar Apuestas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
