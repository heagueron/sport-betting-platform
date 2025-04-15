import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import adminService, { Event } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import './EventsList.css';

const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Estado para controlar qué dropdowns están abiertos
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({});

  // Estado para los campos del formulario de creación
  const [newEventName, setNewEventName] = useState<string>('');
  const [selectedSportId, setSelectedSportId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [sports, setSports] = useState<any[]>([]);
  const [eventFormat, setEventFormat] = useState<'HEAD_TO_HEAD' | 'MULTI_PARTICIPANT'>('HEAD_TO_HEAD');

  // Estado para los participantes
  const [participants, setParticipants] = useState<{ name: string; odds: string }[]>([]);
  const [participantName, setParticipantName] = useState<string>('');
  const [participantOdds, setParticipantOdds] = useState<string>('');

  useEffect(() => {
    fetchEvents();
    fetchSports();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await adminService.getEvents();
      setEvents(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar los eventos');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await adminService.getSports();
      setSports(response.data);
    } catch (err: any) {
      console.error('Error fetching sports:', err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEventName.trim() || !selectedSportId || !startTime) {
      setFormError('Todos los campos marcados con * son obligatorios');
      return;
    }

    // Validar el número de participantes según el formato del evento
    if (eventFormat === 'HEAD_TO_HEAD' && participants.length !== 2) {
      setFormError('Los eventos uno contra uno deben tener exactamente 2 participantes');
      return;
    } else if (eventFormat === 'MULTI_PARTICIPANT' && participants.length < 3) {
      setFormError('Los eventos de múltiples participantes deben tener al menos 3 participantes');
      return;
    }

    try {
      setFormError(null);
      setFormSuccess(null);

      // Convertir las odds de string a number
      const formattedParticipants = participants.map(p => ({
        name: p.name,
        odds: parseFloat(p.odds)
      }));

      await adminService.createEvent({
        name: newEventName,
        sportId: selectedSportId,
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        status: 'SCHEDULED',
        format: eventFormat,
        participants: formattedParticipants
      });

      // Limpiar el formulario
      setNewEventName('');
      setSelectedSportId('');
      setStartTime('');
      setEndTime('');
      setParticipants([]);
      setShowCreateForm(false);
      setFormSuccess('Evento creado correctamente');

      // Recargar la lista de eventos
      fetchEvents();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Error al crear el evento');
      console.error('Error creating event:', err);
    }
  };

  const handleAddParticipant = () => {
    if (!participantName.trim() || !participantOdds.trim()) {
      setFormError('El nombre y las cuotas del participante son obligatorios');
      return;
    }

    // Validar que las cuotas sean un número válido
    const odds = parseFloat(participantOdds);
    if (isNaN(odds) || odds <= 1) {
      setFormError('Las cuotas deben ser un número mayor que 1');
      return;
    }

    // Validar el número de participantes según el formato del evento
    if (eventFormat === 'HEAD_TO_HEAD' && participants.length >= 2) {
      setFormError('Los eventos uno contra uno solo pueden tener 2 participantes');
      return;
    }

    setParticipants([
      ...participants,
      { name: participantName, odds: participantOdds }
    ]);

    // Limpiar los campos
    setParticipantName('');
    setParticipantOdds('');
    setFormError(null);
  };

  const handleRemoveParticipant = (index: number) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programado';
      case 'LIVE':
        return 'En vivo';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'status-scheduled';
      case 'LIVE':
        return 'status-live';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // Función para manejar la apertura y cierre de los dropdowns
  const toggleDropdown = (eventId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  if (loading) {
    return (
      <div className="events-list-container">
        <div className="events-list-loading">Cargando eventos...</div>
      </div>
    );
  }

  return (
    <div className="events-list-container">
      <div className="events-list-header">
        <h1>Gestión de Eventos</h1>
      </div>

      {error && (
        <div className="events-list-error">
          <p>Error: {error}</p>
        </div>
      )}

      {formSuccess && (
        <div className="events-list-success">
          <p>{formSuccess}</p>
        </div>
      )}

      <div className="events-list-actions">
        {!showCreateForm ? (
          <Button onClick={() => setShowCreateForm(true)}>Crear Nuevo Evento</Button>
        ) : (
          <div className="events-list-create-form">
            <h2>Crear Nuevo Evento</h2>
            {formError && <p className="form-error">{formError}</p>}
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label htmlFor="event-name">Nombre: *</label>
                <input
                  id="event-name"
                  type="text"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="Ej: Final de Copa del Mundo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-sport">Deporte: *</label>
                <select
                  id="event-sport"
                  value={selectedSportId}
                  onChange={(e) => setSelectedSportId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar deporte</option>
                  {sports.map(sport => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="event-format">Formato del evento: *</label>
                <select
                  id="event-format"
                  value={eventFormat}
                  onChange={(e) => setEventFormat(e.target.value as 'HEAD_TO_HEAD' | 'MULTI_PARTICIPANT')}
                  required
                >
                  <option value="HEAD_TO_HEAD">Uno contra uno (2 participantes)</option>
                  <option value="MULTI_PARTICIPANT">Múltiples participantes (3 o más)</option>
                </select>
                <p className="form-help-text">
                  {eventFormat === 'HEAD_TO_HEAD'
                    ? 'Para deportes como fútbol, tenis, boxeo, etc.'
                    : 'Para carreras, torneos y competencias con múltiples participantes.'}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="event-start-time">Fecha y hora de inicio: *</label>
                <input
                  id="event-start-time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-end-time">Fecha y hora de finalización:</label>
                <input
                  id="event-end-time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
                <p className="form-help-text">Opcional. Si no se especifica, se calculará automáticamente.</p>
              </div>

              <div className="form-group">
                <h3>Participantes</h3>
                <p className="form-help-text">Debe agregar al menos 2 participantes.</p>

                <div className="participants-list">
                  {participants.map((participant, index) => (
                    <div key={index} className="participant-item">
                      <span>{participant.name} - Cuota: {participant.odds}</span>
                      <button
                        type="button"
                        className="remove-participant-btn"
                        onClick={() => handleRemoveParticipant(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="add-participant-form">
                  <div className="participant-inputs">
                    <input
                      type="text"
                      placeholder="Nombre del participante"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      placeholder="Cuota (ej: 1.5)"
                      value={participantOdds}
                      onChange={(e) => setParticipantOdds(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="add-participant-btn"
                    onClick={handleAddParticipant}
                  >
                    Agregar Participante
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <Button type="submit">Guardar</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewEventName('');
                    setSelectedSportId('');
                    setStartTime('');
                    setEndTime('');
                    setParticipants([]);
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

      <div className="events-list-stats">
        <p>Total de eventos: {events.length}</p>
        <p>Programados: {events.filter(event => event.status === 'SCHEDULED').length}</p>
        <p>En vivo: {events.filter(event => event.status === 'LIVE').length}</p>
        <p>Completados: {events.filter(event => event.status === 'COMPLETED').length}</p>
        <p>Cancelados: {events.filter(event => event.status === 'CANCELLED').length}</p>
      </div>

      <div className="events-list">
        <div className="events-list-table">
          <div className="events-list-header-row">
            <div className="events-list-cell">Nombre</div>
            <div className="events-list-cell">Deporte</div>
            <div className="events-list-cell">Fecha de inicio</div>
            <div className="events-list-cell">Estado</div>
            <div className="events-list-cell">Acciones</div>
          </div>

          {events.length === 0 ? (
            <div className="events-list-empty">
              <p>No hay eventos disponibles</p>
            </div>
          ) : (
            events.map(event => (
              <React.Fragment key={event.id}>
                <div className="events-list-row">
                  <div className="events-list-cell">{event.name}</div>
                  <div className="events-list-cell">{event.sport?.name || 'N/A'}</div>
                  <div className="events-list-cell">{formatDate(event.startTime)}</div>
                  <div className="events-list-cell">
                    <span className={`status-badge ${getStatusClass(event.status)}`}>
                      {getStatusLabel(event.status)}
                    </span>
                  </div>
                  <div className="events-list-cell events-list-actions-cell">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/admin/events/${event.id}`)}
                    >
                      Ver detalles
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleDropdown(event.id)}
                    >
                      {openDropdowns[event.id] ? 'Ocultar participantes' : 'Ver participantes'}
                    </Button>
                  </div>
                </div>
                {openDropdowns[event.id] && event.participants && event.participants.length > 0 && (
                  <div className="events-list-participants-dropdown">
                    <h4>Participantes:</h4>
                    <div className="participants-list">
                      {event.participants.map((participant, index) => (
                        <div key={index} className="participant-item-row">
                          <span className="participant-name">{participant.name}</span>
                          <span className="participant-odds">Cuota: {participant.odds}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      <div className="events-list-footer">
        <Button onClick={() => navigate('/admin')}>
          Volver al Panel
        </Button>
      </div>
    </div>
  );
};

export default EventsList;
