import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService, { Event } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import './Markets.css';

interface Selection {
  name: string;
}

const MarketCreate: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [eventId, setEventId] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [selections, setSelections] = useState<Selection[]>([{ name: '' }]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await adminService.getEvents(1, 100, { status: 'SCHEDULED' });
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Error al cargar los eventos. Por favor, inténtalo de nuevo.');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleAddSelection = () => {
    setSelections([...selections, { name: '' }]);
  };

  const handleRemoveSelection = (index: number) => {
    const newSelections = [...selections];
    newSelections.splice(index, 1);
    setSelections(newSelections);
  };

  const handleSelectionChange = (index: number, value: string) => {
    const newSelections = [...selections];
    newSelections[index].name = value;
    setSelections(newSelections);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!name.trim()) {
      setError('El nombre del mercado es obligatorio');
      return;
    }

    if (!eventId) {
      setError('Debes seleccionar un evento');
      return;
    }

    // Validar que haya al menos dos selecciones y que todas tengan nombre
    if (selections.length < 2) {
      setError('Debes añadir al menos dos selecciones');
      return;
    }

    if (selections.some(selection => !selection.name.trim())) {
      setError('Todas las selecciones deben tener un nombre');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear el mercado
      const marketData = {
        name,
        eventId,
        selections: selections.map(s => s.name)
      };

      const response = await adminService.createMarket(marketData);

      // Redirigir a la página de detalle del mercado creado
      navigate(`/admin/markets/${response.data.id}`);
    } catch (err) {
      console.error('Error creating market:', err);
      setError('Error al crear el mercado. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="market-create-container">
      <h1>Crear Nuevo Mercado</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="market-form">
        <div className="form-group">
          <label htmlFor="name">Nombre del Mercado:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Ganador del partido"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="event">Evento:</label>
          {eventsLoading ? (
            <div className="loading">Cargando eventos...</div>
          ) : (
            <select
              id="event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
            >
              <option value="">Selecciona un evento</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({new Date(event.startTime).toLocaleString()})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label>Selecciones Disponibles:</label>
          <div className="selections-container">
            {selections.map((selection, index) => (
              <div key={index} className="selection-item">
                <input
                  type="text"
                  value={selection.name}
                  onChange={(e) => handleSelectionChange(index, e.target.value)}
                  placeholder={`Selección ${index + 1}`}
                  required
                />
                {selections.length > 2 && (
                  <button
                    type="button"
                    className="remove-selection-btn"
                    onClick={() => handleRemoveSelection(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-selection-btn"
              onClick={handleAddSelection}
            >
              + Añadir Selección
            </button>
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/markets')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Mercado'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MarketCreate;
