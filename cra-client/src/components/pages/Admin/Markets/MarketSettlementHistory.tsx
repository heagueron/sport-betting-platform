import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService, { Market } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import './Markets.css';

const MarketSettlementHistory: React.FC = () => {
  const [settledMarkets, setSettledMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettledMarkets();
  }, [currentPage, itemsPerPage]);

  const fetchSettledMarkets = async () => {
    setLoading(true);
    try {
      const params = {
        status: 'SETTLED',
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm.trim() || undefined
      };

      const response = await adminService.getMarkets(params);
      setSettledMarkets(response.data);

      if (response.pagination) {
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
        setTotalItems(response.pagination.total);
        setItemsPerPage(response.pagination.limit);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching settled markets:', err);
      setError('Error al cargar los mercados liquidados. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSettledMarkets();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="markets-list-container">
      <div className="markets-list-header">
        <h1>Historial de Liquidaciones</h1>
        <Button onClick={() => navigate('/admin/markets')}>
          Volver a Gestión de Mercados
        </Button>
      </div>

      <div className="markets-filters">
        <div className="search-group">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Buscar mercados liquidados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>
              Buscar
            </button>
          </div>
        </div>
        <div className="filter-group">
          <label htmlFor="items-per-page">Mostrar:</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value="5">5 por página</option>
            <option value="10">10 por página</option>
            <option value="25">25 por página</option>
            <option value="50">50 por página</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando mercados liquidados...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : settledMarkets.length === 0 ? (
        <div className="no-markets">
          <p>No hay mercados liquidados disponibles.</p>
        </div>
      ) : (
        <div className="markets-table-container">
          <table className="markets-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Nombre</th>
                <th style={{ width: '15%' }}>Evento</th>
                <th style={{ width: '15%' }}>Fecha del Evento</th>
                <th style={{ width: '15%' }}>Selección Ganadora</th>
                <th style={{ width: '15%' }}>Liquidado</th>
                <th style={{ width: '10%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {settledMarkets.map((market) => (
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
                    <span className="winning-selection">
                      {market.winningSelection || 'N/A'}
                    </span>
                  </td>
                  <td>{market.settledAt ? formatDateTime(market.settledAt) : 'N/A'}</td>
                  <td className="actions-cell">
                    <Button
                      onClick={() => navigate(`/admin/markets/${market.id}`)}
                      size="sm"
                      aria-label="Ver detalles del mercado"
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && settledMarkets.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {settledMarkets.length} de {totalItems} mercados
          </div>
          <div className="pagination-controls">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
            >
              «
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              ‹
            </Button>
            <span className="pagination-current">
              Página {currentPage} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              ›
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(totalPages)}
            >
              »
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

export default MarketSettlementHistory;
