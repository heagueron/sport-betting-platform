import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import adminService, { Bet, Market } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import Spinner from '../../../common/Spinner/Spinner';
import './BetsListPage.css';

const BetsListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [betTypeFilter, setBetTypeFilter] = useState<string>('');
  const [betStatusFilter, setBetStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Cargar mercados y apuestas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obtener mercados
        const marketsResponse = await adminService.getMarkets();
        setMarkets(marketsResponse.data);

        // Obtener apuestas con filtros
        await fetchBets();
      } catch (err) {
        console.error('Error al cargar los datos:', err);
        setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para obtener apuestas con filtros
  const fetchBets = async () => {
    setLoading(true);

    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (selectedMarket) params.marketId = selectedMarket;
      if (betTypeFilter) params.type = betTypeFilter;
      if (betStatusFilter) params.status = betStatusFilter;

      const response = await adminService.getBets(params);
      setBets(response.data);

      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error al cargar las apuestas:', err);
      setError('Error al cargar las apuestas. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };

  // Aplicar filtros
  const applyFilters = () => {
    setPagination({
      ...pagination,
      page: 1
    });
    fetchBets();
  };

  // Resetear filtros
  const resetFilters = () => {
    setSelectedMarket('');
    setBetTypeFilter('');
    setBetStatusFilter('');
    setPagination({
      ...pagination,
      page: 1
    });
  };

  // Verificar si el usuario es administrador
  if (user?.role !== 'ADMIN') {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder a esta página.</p>
          <Button onClick={() => navigate('/')}>
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  // Mostrar spinner mientras carga
  if (loading && bets.length === 0) {
    return (
      <div className="admin-container">
        <div className="center-content">
          <Spinner />
          <p>Cargando apuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Gestión de Apuestas</h1>
        <p>Administra las apuestas de la plataforma</p>
      </div>

      <div className="filter-section">
        <h2>Filtros</h2>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="market-filter">Mercado:</label>
            <select
              id="market-filter"
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los mercados</option>
              {markets.map(market => (
                <option key={market.id} value={market.id}>
                  {market.name} - {market.event?.name || 'Evento desconocido'}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="type-filter">Tipo de apuesta:</label>
            <select
              id="type-filter"
              value={betTypeFilter}
              onChange={(e) => setBetTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los tipos</option>
              <option value="BACK">Back</option>
              <option value="LAY">Lay</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Estado:</label>
            <select
              id="status-filter"
              value={betStatusFilter}
              onChange={(e) => setBetStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="UNMATCHED">Sin emparejar</option>
              <option value="PARTIALLY_MATCHED">Parcialmente emparejada</option>
              <option value="FULLY_MATCHED">Completamente emparejada</option>
              <option value="SETTLED">Liquidada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>

          <div className="filter-buttons">
            <Button onClick={applyFilters}>
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Resetear Filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <Button
          variant="primary"
          onClick={() => {
            if (selectedMarket) {
              navigate(`/admin/bets/orderbook/${selectedMarket}`);
            } else {
              alert('Por favor, selecciona un mercado para ver su libro de órdenes');
            }
          }}
          disabled={!selectedMarket}
        >
          Ver Libro de Órdenes
        </Button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="bets-table-container">
        <h2>Lista de Apuestas</h2>
        {bets.length === 0 ? (
          <p className="no-data-message">No se encontraron apuestas con los filtros seleccionados.</p>
        ) : (
          <>
            <table className="bets-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Evento</th>
                  <th>Mercado</th>
                  <th>Selección</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Cuota</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {bets.map(bet => (
                  <tr key={bet.id}>
                    <td>{bet.id.substring(0, 8)}...</td>
                    <td>{bet.user?.name || 'Desconocido'}</td>
                    <td>{bet.event?.name || 'Desconocido'}</td>
                    <td>{bet.market?.name || 'Desconocido'}</td>
                    <td>{bet.selection}</td>
                    <td className={bet.type === 'BACK' ? 'back-type' : 'lay-type'}>
                      {bet.type}
                    </td>
                    <td>${bet.amount.toFixed(2)}</td>
                    <td>{bet.odds.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${bet.status.toLowerCase()}`}>
                        {bet.status}
                      </span>
                    </td>
                    <td>{new Date(bet.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <span className="page-info">
                Página {pagination.page} de {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Siguiente
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="admin-footer">
        <Button onClick={() => navigate('/admin')}>
          Volver al Panel de Administración
        </Button>
      </div>
    </div>
  );
};

export default BetsListPage;
