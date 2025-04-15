import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import adminService, { Sport } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import './SportDetail.css';

const SportDetail: React.FC = () => {
  const { sportId } = useParams<{ sportId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [sport, setSport] = useState<Sport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estado para los campos editables
  const [name, setName] = useState<string>('');

  useEffect(() => {
    const fetchSport = async () => {
      if (!sportId) return;

      try {
        setLoading(true);
        const response = await adminService.getSportById(sportId);
        setSport(response.data);

        // Inicializar los campos editables
        setName(response.data.name);

        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar el deporte');
        console.error('Error fetching sport:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSport();
  }, [sportId]);

  const handleSave = async () => {
    if (!sportId || !sport) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      // Actualizar los datos básicos del deporte
      const updatedSport = await adminService.updateSport(sportId, {
        name,
      });

      setSport(updatedSport.data);
      setSuccessMessage('Deporte actualizado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar el deporte');
      console.error('Error updating sport:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleActivateSport = async () => {
    if (!sportId || !sport) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      const response = await adminService.activateSport(sportId);
      setSport(response.data);

      setSuccessMessage('Deporte activado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al activar el deporte');
      console.error('Error activating sport:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateSport = async () => {
    if (!sportId || !sport) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      const response = await adminService.deactivateSport(sportId);
      setSport(response.data);

      setSuccessMessage('Deporte desactivado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al desactivar el deporte');
      console.error('Error deactivating sport:', err);
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
      <div className="sport-detail-container">
        <div className="sport-detail-loading">Cargando deporte...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sport-detail-container">
        <div className="sport-detail-error">
          <h2>Error</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/admin/sports')}>Volver a la lista</Button>
        </div>
      </div>
    );
  }

  if (!sport) {
    return (
      <div className="sport-detail-container">
        <div className="sport-detail-error">
          <h2>Deporte no encontrado</h2>
          <Button onClick={() => navigate('/admin/sports')}>Volver a la lista</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sport-detail-container">
      <div className="sport-detail-header">
        <h1>Detalles del Deporte</h1>
        <Button onClick={() => navigate('/admin/sports')}>Volver a la lista</Button>
      </div>

      {successMessage && (
        <div className="sport-detail-success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="sport-detail-error-message">
          {error}
        </div>
      )}

      <div className="sport-detail-card">
        <div className="sport-detail-section">
          <h2>Información Básica</h2>

          <div className="sport-detail-field">
            <label htmlFor="sport-id">ID:</label>
            <input
              id="sport-id"
              type="text"
              value={sport.id}
              disabled
              className="sport-detail-input"
            />
          </div>

          <div className="sport-detail-field">
            <label htmlFor="sport-name">Nombre:</label>
            <input
              id="sport-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sport-detail-input"
            />
          </div>

          <div className="sport-detail-field">
            <label htmlFor="sport-slug">Slug:</label>
            <input
              id="sport-slug"
              type="text"
              value={sport.slug}
              disabled
              className="sport-detail-input"
            />
            <p className="sport-detail-help-text">
              El slug se genera automáticamente a partir del nombre y se utiliza en las URLs.
            </p>
          </div>

          <div className="sport-detail-field">
            <label htmlFor="sport-created">Fecha de creación:</label>
            <input
              id="sport-created"
              type="text"
              value={formatDate(sport.createdAt)}
              disabled
              className="sport-detail-input"
            />
          </div>

          <div className="sport-detail-field">
            <label htmlFor="sport-updated">Última actualización:</label>
            <input
              id="sport-updated"
              type="text"
              value={formatDate(sport.updatedAt)}
              disabled
              className="sport-detail-input"
            />
          </div>
        </div>

        <div className="sport-detail-section">
          <h2>Estado y Acciones</h2>

          <div className="sport-detail-status">
            <p>Estado actual:
              <span className={`status-badge ${sport.active ? 'active' : 'inactive'}`}>
                {sport.active ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>

          <div className="sport-detail-actions">
            {sport.active ? (
              <Button
                variant="outline"
                onClick={handleDeactivateSport}
                disabled={saving}
                className="deactivate-button"
              >
                Desactivar Deporte
              </Button>
            ) : (
              <Button
                onClick={handleActivateSport}
                disabled={saving}
                className="activate-button"
              >
                Activar Deporte
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="sport-detail-footer">
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

export default SportDetail;
