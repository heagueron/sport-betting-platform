import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import adminService, { Event } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import './EventDetail.css';

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sports, setSports] = useState<any[]>([]);

  // Estado para los campos editables
  const [name, setName] = useState<string>('');
  const [sportId, setSportId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [status, setStatus] = useState<string>('SCHEDULED');
  const [result, setResult] = useState<string>('');

  // Estado para controlar si el dropdown de participantes está abierto
  const [showParticipants, setShowParticipants] = useState<boolean>(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const response = await adminService.getEventById(eventId);
        setEvent(response.data);

        // Inicializar los campos editables
        setName(response.data.name);
        setSportId(response.data.sportId);

        // Formatear fechas para input datetime-local
        const startDate = new Date(response.data.startTime);
        setStartTime(formatDateForInput(startDate));

        if (response.data.endTime) {
          const endDate = new Date(response.data.endTime);
          setEndTime(formatDateForInput(endDate));
        }

        setStatus(response.data.status);
        setResult(response.data.result || '');

        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar el evento');
        console.error('Error fetching event:', err);
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

    fetchEvent();
    fetchSports();
  }, [eventId]);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const handleSave = async () => {
    if (!eventId || !event) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      // Preparar datos para actualizar
      const eventData = {
        name,
        sportId,
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        status,
        result: result || undefined
      };

      const response = await adminService.updateEvent(eventId, eventData);

      setEvent(response.data);
      setSuccessMessage('Evento actualizado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar el evento');
      console.error('Error updating event:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!eventId || !event) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      // Include result when changing status to COMPLETED
      const updateData: any = { status: newStatus };
      if (newStatus === 'COMPLETED' && result) {
        updateData.result = result;
      }

      const response = await adminService.updateEvent(eventId, updateData);

      setEvent(response.data);
      setStatus(response.data.status);
      setSuccessMessage(`Estado actualizado a ${getStatusLabel(newStatus)}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cambiar el estado');
      console.error('Error changing status:', err);
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

  const getStatusLabel = (statusValue: string) => {
    switch (statusValue) {
      case 'SCHEDULED':
        return 'Programado';
      case 'LIVE':
        return 'En vivo';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return statusValue;
    }
  };

  if (loading) {
    return (
      <div className="event-detail-container">
        <div className="event-detail-loading">Cargando evento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-detail-container">
        <div className="event-detail-error">
          <h2>Error</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/admin/events')}>Volver a la lista</Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-container">
        <div className="event-detail-error">
          <h2>Evento no encontrado</h2>
          <Button onClick={() => navigate('/admin/events')}>Volver a la lista</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <h1>Detalles del Evento</h1>
        <Button onClick={() => navigate('/admin/events')}>Volver a la lista</Button>
      </div>

      {successMessage && (
        <div className="event-detail-success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="event-detail-error-message">
          {error}
        </div>
      )}

      <div className="event-detail-card">
        <div className="event-detail-section">
          <h2>Información Básica</h2>

          <div className="event-detail-participants">
            <div className="participants-header">
              <h3>Participantes</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowParticipants(!showParticipants)}
              >
                {showParticipants ? 'Ocultar participantes' : 'Ver participantes'}
              </Button>
            </div>

            {showParticipants && event.participants && event.participants.length > 0 && (
              <div className="event-detail-participants-dropdown">
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
          </div>

          <div className="event-detail-field">
            <label htmlFor="event-id">ID:</label>
            <input
              id="event-id"
              type="text"
              value={event.id}
              disabled
              className="event-detail-input"
            />
          </div>

          <div className="event-detail-field">
            <label htmlFor="event-name">Nombre:</label>
            <input
              id="event-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="event-detail-input"
            />
          </div>

          <div className="event-detail-field">
            <label htmlFor="event-sport">Deporte:</label>
            <select
              id="event-sport"
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
              className="event-detail-select"
            >
              {sports.map(sport => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>

          <div className="event-detail-field">
            <label htmlFor="event-created">Fecha de creación:</label>
            <input
              id="event-created"
              type="text"
              value={formatDate(event.createdAt)}
              disabled
              className="event-detail-input"
            />
          </div>

          <div className="event-detail-field">
            <label htmlFor="event-updated">Última actualización:</label>
            <input
              id="event-updated"
              type="text"
              value={formatDate(event.updatedAt)}
              disabled
              className="event-detail-input"
            />
          </div>
        </div>

        <div className="event-detail-section">
          <h2>Programación y Estado</h2>

          <div className="event-detail-field">
            <label htmlFor="event-start-time">Fecha y hora de inicio:</label>
            <input
              id="event-start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="event-detail-input"
            />
          </div>

          <div className="event-detail-field">
            <label htmlFor="event-end-time">Fecha y hora de finalización:</label>
            <input
              id="event-end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="event-detail-input"
            />
          </div>

          <div className="event-detail-field">
            <label htmlFor="event-status">Estado:</label>
            <select
              id="event-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="event-detail-select"
            >
              <option value="SCHEDULED">Programado</option>
              <option value="LIVE">En vivo</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div className="event-detail-field">
            <label htmlFor="event-result">Resultado:</label>
            <input
              id="event-result"
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Ej: 2-1, Equipo A ganador, etc."
              className="event-detail-input"
            />
            <p className="event-detail-help-text">
              Solo aplicable para eventos completados.
            </p>
          </div>

          <div className="event-detail-status">
            <p>Estado actual: <span className={`status-badge status-${status.toLowerCase()}`}>{getStatusLabel(status)}</span></p>
          </div>

          <div className="event-detail-actions">
            {status !== 'LIVE' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('LIVE')}
                disabled={saving}
                className="status-button"
              >
                Marcar como En Vivo
              </Button>
            )}

            {status !== 'COMPLETED' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={saving}
                className="status-button"
              >
                Marcar como Completado
              </Button>
            )}

            {status !== 'CANCELLED' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={saving}
                className="status-button"
              >
                Cancelar Evento
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="event-detail-footer">
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

export default EventDetail;
