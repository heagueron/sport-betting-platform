import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService, { Market } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import './Markets.css';

const MarketsList: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEventId, setFilterEventId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarkets();
  }, [filterEventId, filterStatus, currentPage, itemsPerPage]);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const params: {
        eventId?: string;
        status?: string;
        page?: number;
        limit?: number;
        search?: string;
      } = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (filterEventId) params.eventId = filterEventId;
      if (filterStatus) params.status = filterStatus;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await adminService.getMarkets(params);
      setMarkets(response.data);

      if (response.pagination) {
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
        setTotalItems(response.pagination.total);
        setItemsPerPage(response.pagination.limit);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError('Error al cargar los mercados. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (marketId: string, action: string) => {
    try {
      let response: { data: Market } | undefined;
      switch (action) {
        case 'suspend':
          response = await adminService.suspendMarket(marketId);
          break;
        case 'reopen':
          response = await adminService.reopenMarket(marketId);
          break;
        case 'close':
          response = await adminService.closeMarket(marketId);
          break;
        case 'cancel':
          if (window.confirm('¿Estás seguro de que deseas cancelar este mercado? Esta acción devolverá todos los fondos a los usuarios.')) {
            response = await adminService.cancelMarket(marketId);
          }
          break;
        default:
          return;
      }

      if (response) {
        // Actualizar el mercado en la lista
        setMarkets(markets.map(market =>
          market.id === marketId ? response!.data : market
        ));
      }
    } catch (err) {
      console.error(`Error ${action} market:`, err);
      setError(`Error al ${getActionText(action)} el mercado. Por favor, inténtalo de nuevo.`);
    }
  };

  const getActionText = (action: string): string => {
    switch (action) {
      case 'suspend': return 'suspender';
      case 'reopen': return 'reactivar';
      case 'close': return 'cerrar';
      case 'cancel': return 'cancelar';
      default: return '';
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'OPEN': return 'status-badge status-open';
      case 'SUSPENDED': return 'status-badge status-suspended';
      case 'CLOSED': return 'status-badge status-closed';
      case 'SETTLED': return 'status-badge status-settled';
      case 'CANCELLED': return 'status-badge status-cancelled';
      default: return 'status-badge';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN': return 'Abierto';
      case 'SUSPENDED': return 'Suspendido';
      case 'CLOSED': return 'Cerrado';
      case 'SETTLED': return 'Liquidado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="markets-list-container">
      <div className="markets-list-header">
        <h1>Gestión de Mercados</h1>
        <Button onClick={() => navigate('/admin/markets/create')}>
          Crear Nuevo Mercado
        </Button>
      </div>

      <div className="markets-filters">
        <div className="search-group">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Buscar mercados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchMarkets()}
            />
            <button className="search-button" onClick={fetchMarkets}>
              Buscar
            </button>
          </div>
        </div>
        <div className="filter-group">
          <label htmlFor="status-filter">Filtrar por estado:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="OPEN">Abierto</option>
            <option value="SUSPENDED">Suspendido</option>
            <option value="CLOSED">Cerrado</option>
            <option value="SETTLED">Liquidado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="items-per-page">Mostrar:</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
          >
            <option value="5">5 por página</option>
            <option value="10">10 por página</option>
            <option value="25">25 por página</option>
            <option value="50">50 por página</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando mercados...</div>
      ) : markets.length === 0 ? (
        <div className="no-markets">
          <p>No hay mercados disponibles.</p>
        </div>
      ) : (
        <div className="markets-table-container">
          <table className="markets-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Nombre</th>
                <th style={{ width: '15%' }}>Evento</th>
                <th style={{ width: '12%' }}>Fecha y Hora</th>
                <th style={{ width: '15%' }}>Participantes</th>
                <th style={{ width: '8%' }}>Estado</th>
                <th style={{ width: '15%' }}>Creado</th>
                <th style={{ width: '20%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market) => (
                <tr key={market.id}>
                  <td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/admin/markets/${market.id}`);
                      }}
                    >
                      {market.name}
                    </a>
                  </td>
                  <td>{market.event?.name || 'N/A'}</td>
                  <td>
                    {market.event?.startTime ? (
                      <span className="event-datetime">
                        {new Date(market.event.startTime).toLocaleDateString()}
                        <br />
                        {new Date(market.event.startTime).toLocaleTimeString()}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {market.event?.participants && market.event.participants.length > 0 ? (
                      <div className="participants-list">
                        {market.event.participants.map((participant, index) => (
                          <div key={index} className="participant-item">
                            {participant.name}
                            {index < market.event!.participants!.length - 1 && ' vs '}
                          </div>
                        ))}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(market.status)} title={getStatusText(market.status)}>
                      {getStatusText(market.status).substring(0, 3)}
                    </span>
                  </td>
                  <td>{new Date(market.createdAt).toLocaleString()}</td>
                  <td className="actions-cell">
                    <Button
                      onClick={() => navigate(`/admin/markets/${market.id}`)}
                      size="sm"
                      aria-label="Ver detalles del mercado"
                    >
                      Ver
                    </Button>

                    {market.status === 'OPEN' && (
                      <>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleStatusChange(market.id, 'suspend')}
                          aria-label="Suspender mercado"
                        >
                          Susp
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusChange(market.id, 'close')}
                          aria-label="Cerrar mercado"
                        >
                          Cerr
                        </Button>
                      </>
                    )}

                    {market.status === 'SUSPENDED' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusChange(market.id, 'reopen')}
                        aria-label="Reactivar mercado"
                      >
                        React
                      </Button>
                    )}

                    {(market.status === 'OPEN' || market.status === 'SUSPENDED') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusChange(market.id, 'cancel')}
                        aria-label="Cancelar mercado"
                      >
                        Canc
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && markets.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {markets.length} de {totalItems} mercados
          </div>
          <div className="pagination-controls">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lsaquo;
            </Button>

            <span className="pagination-current">Página {currentPage} de {totalPages}</span>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &rsaquo;
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              &raquo;
            </Button>
          </div>
        </div>
      )}

      <div className="markets-list-footer">
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Volver al Panel de Administración
        </Button>
      </div>
    </div>
  );
};

export default MarketsList;
