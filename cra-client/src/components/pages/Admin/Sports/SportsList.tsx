import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import adminService, { Sport } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import './SportsList.css';

const SportsList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newSportName, setNewSportName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSports();
      console.log('Deportes obtenidos:', response);
      setSports(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar los deportes');
      console.error('Error fetching sports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSportName.trim()) {
      setFormError('El nombre del deporte es obligatorio');
      return;
    }

    try {
      setFormError(null);
      setFormSuccess(null);

      await adminService.createSport({
        name: newSportName,
        active: true
      });

      setNewSportName('');
      setShowCreateForm(false);
      setFormSuccess('Deporte creado correctamente');

      // Recargar la lista de deportes
      fetchSports();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Error al crear el deporte');
      console.error('Error creating sport:', err);
    }
  };

  const handleActivateSport = async (sportId: string) => {
    try {
      await adminService.activateSport(sportId);

      // Actualizar la lista de deportes
      setSports(sports.map(sport =>
        sport.id === sportId ? { ...sport, active: true } : sport
      ));

      setFormSuccess('Deporte activado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al activar el deporte');
      console.error('Error activating sport:', err);
    }
  };

  const handleDeactivateSport = async (sportId: string) => {
    try {
      await adminService.deactivateSport(sportId);

      // Actualizar la lista de deportes
      setSports(sports.map(sport =>
        sport.id === sportId ? { ...sport, active: false } : sport
      ));

      setFormSuccess('Deporte desactivado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al desactivar el deporte');
      console.error('Error deactivating sport:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="sports-list-container">
        <div className="sports-list-loading">Cargando deportes...</div>
      </div>
    );
  }

  return (
    <div className="sports-list-container">
      <div className="sports-list-header">
        <h1>Gestión de Deportes</h1>
        <Button onClick={() => navigate('/admin')}>Volver al Panel</Button>
      </div>

      {error && (
        <div className="sports-list-error">
          <p>Error: {error}</p>
        </div>
      )}

      {formSuccess && (
        <div className="sports-list-success">
          <p>{formSuccess}</p>
        </div>
      )}

      <div className="sports-list-actions">
        {!showCreateForm ? (
          <Button onClick={() => setShowCreateForm(true)}>Crear Nuevo Deporte</Button>
        ) : (
          <div className="sports-list-create-form">
            <h2>Crear Nuevo Deporte</h2>
            {formError && <p className="form-error">{formError}</p>}
            <form onSubmit={handleCreateSport}>
              <div className="form-group">
                <label htmlFor="sport-name">Nombre:</label>
                <input
                  id="sport-name"
                  type="text"
                  value={newSportName}
                  onChange={(e) => setNewSportName(e.target.value)}
                  placeholder="Ej: Fútbol, Baloncesto, Tenis..."
                  required
                />
              </div>
              <div className="form-actions">
                <Button type="submit">Guardar</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewSportName('');
                    setFormError(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="sports-list-stats">
        <p>Total de deportes: {sports.length}</p>
        <p>Deportes activos: {sports.filter(sport => sport.active).length}</p>
        <p>Deportes inactivos: {sports.filter(sport => !sport.active).length}</p>
      </div>

      <div className="sports-list">
        <div className="sports-list-table">
          <div className="sports-list-header-row">
            <div className="sports-list-cell">Nombre</div>
            <div className="sports-list-cell">Slug</div>
            <div className="sports-list-cell">Estado</div>
            <div className="sports-list-cell">Fecha de creación</div>
            <div className="sports-list-cell">Acciones</div>
          </div>

          {sports.length === 0 ? (
            <div className="sports-list-empty">
              <p>No hay deportes disponibles</p>
            </div>
          ) : (
            sports.map(sport => (
              <div key={sport.id} className="sports-list-row">
                <div className="sports-list-cell">{sport.name}</div>
                <div className="sports-list-cell">{sport.slug}</div>
                <div className="sports-list-cell">
                  <span className={`status-badge ${sport.active ? 'active' : 'inactive'}`}>
                    {sport.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="sports-list-cell">{formatDate(sport.createdAt)}</div>
                <div className="sports-list-cell sports-list-actions-cell">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/admin/sports/${sport.id}`)}
                  >
                    Ver detalles
                  </Button>

                  {sport.active ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeactivateSport(sport.id)}
                    >
                      Desactivar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleActivateSport(sport.id)}
                    >
                      Activar
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SportsList;
