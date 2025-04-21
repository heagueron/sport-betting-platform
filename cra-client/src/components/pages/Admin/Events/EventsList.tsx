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

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [eventsPerPage] = useState<number>(10);

  // Estado para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSportId, setFilterSportId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

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
  const [participants, setParticipants] = useState<{ name: string }[]>([]);
  const [participantName, setParticipantName] = useState<string>('');

  useEffect(() => {
    fetchEvents(currentPage);
    fetchSports();
  }, [currentPage, searchTerm, filterSportId, filterStatus]);

  const fetchEvents = async (page: number = 1) => {
    try {
      setLoading(true);

      // Preparar los parámetros de filtro
      const params: any = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (filterSportId) {
        params.sportId = filterSportId;
      }

      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await adminService.getEvents(page, eventsPerPage, params);
      setEvents(response.data);
      setTotalPages(response.pagination?.pages || 1);
      setTotalEvents(response.pagination?.total || 0);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar los eventos');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página cuando se busca
  };

  const handleSportFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterSportId(e.target.value);
    setCurrentPage(1); // Resetear a la primera página cuando se filtra
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Resetear a la primera página cuando se filtra
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSportId('');
    setFilterStatus('');
    setCurrentPage(1);
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

    // Validar que la fecha de finalización no sea anterior a la fecha de inicio
    if (endTime && new Date(endTime) < new Date(startTime)) {
      setFormError('La fecha de finalización no puede ser anterior a la fecha de inicio');
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

      // Formatear los participantes
      const formattedParticipants = participants.map(p => ({
        name: p.name
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
      fetchEvents(1);
      setCurrentPage(1);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Error al crear el evento');
      console.error('Error creating event:', err);
    }
  };

  const handleAddParticipant = () => {
    if (!participantName.trim()) {
      setFormError('El nombre del participante es obligatorio');
      return;
    }

    // Validar el número de participantes según el formato del evento
    if (eventFormat === 'HEAD_TO_HEAD' && participants.length >= 2) {
      setFormError('Los eventos uno contra uno solo pueden tener 2 participantes');
      return;
    }

    // Añadir el nuevo participante a la lista
    const newParticipants = [...participants, { name: participantName }];
    setParticipants(newParticipants);
    console.log('Participantes actualizados:', newParticipants);

    // Limpiar los campos
    setParticipantName('');
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
        <div className="events-list-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="search-icon">
              <i className="fas fa-search"></i>
            </button>
          </div>

          <div className="filter-group">
            <select
              value={filterSportId}
              onChange={handleSportFilterChange}
              className="filter-select"
            >
              <option value="">Todos los deportes</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={handleStatusFilterChange}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="SCHEDULED">Programados</option>
              <option value="LIVE">En vivo</option>
              <option value="COMPLETED">Completados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>

            {(searchTerm || filterSportId || filterStatus) && (
              <button
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
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
                  {participants.length === 0 ? (
                    <p className="no-participants">No hay participantes añadidos</p>
                  ) : (
                    participants.map((participant, index) => (
                      <div key={index} className="participant-item">
                        <span>{participant.name}</span>
                        <button
                          type="button"
                          className="remove-participant-btn"
                          onClick={() => handleRemoveParticipant(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="add-participant-form">
                  <div className="participant-inputs">
                    <input
                      type="text"
                      placeholder="Nombre del participante"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddParticipant();
                        }
                      }}
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
        <p>Mostrando {events.length} de {totalEvents} eventos</p>
        {(searchTerm || filterSportId || filterStatus) && (
          <p className="filter-info">
            Filtros activos:
            {searchTerm && <span className="filter-tag">Búsqueda: "{searchTerm}"</span>}
            {filterSportId && <span className="filter-tag">Deporte: {sports.find(s => s.id === filterSportId)?.name}</span>}
            {filterStatus && (
              <span className="filter-tag">
                Estado: {getStatusLabel(filterStatus)}
              </span>
            )}
          </p>
        )}
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

      {totalPages > 1 && (
        <div className="events-list-pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lsaquo;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-button ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &rsaquo;
          </button>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </div>
      )}

      <div className="events-list-footer">
        <Button onClick={() => navigate('/admin')}>
          Volver al Panel
        </Button>
      </div>
    </div>
  );
};

export default EventsList;
