import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import adminService, { Market, OrderBook, OrderBookEntry } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import Spinner from '../../../common/Spinner/Spinner';
import './OrderBookPage.css';

const OrderBookPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { marketId } = useParams<{ marketId: string }>();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [betTypeFilter, setBetTypeFilter] = useState<'ALL' | 'BACK' | 'LAY'>('ALL');
  const [sortBy, setSortBy] = useState<'ODDS' | 'AMOUNT'>('ODDS');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [selectedSelection, setSelectedSelection] = useState<string | null>(null);

  // Cargar el mercado y el libro de órdenes
  useEffect(() => {
    const fetchData = async () => {
      if (!marketId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Obtener información del mercado
        const marketResponse = await adminService.getMarketById(marketId);
        setMarket(marketResponse.data);
        
        // Obtener el libro de órdenes
        const orderBookResponse = await adminService.getMarketOrderBook(marketId, selectedSelection || undefined);
        setOrderBook(orderBookResponse.data);
      } catch (err) {
        console.error('Error al cargar los datos:', err);
        setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [marketId, selectedSelection]);

  // Función para ordenar las entradas del libro de órdenes
  const sortOrderBookEntries = (entries: OrderBookEntry[]): OrderBookEntry[] => {
    return [...entries].sort((a, b) => {
      if (sortBy === 'ODDS') {
        return sortDirection === 'ASC' 
          ? a.odds - b.odds 
          : b.odds - a.odds;
      } else { // AMOUNT
        return sortDirection === 'ASC' 
          ? a.totalAmount - b.totalAmount 
          : b.totalAmount - a.totalAmount;
      }
    });
  };

  // Obtener las entradas filtradas y ordenadas
  const getFilteredAndSortedEntries = (): { backBets: OrderBookEntry[], layBets: OrderBookEntry[] } => {
    if (!orderBook) return { backBets: [], layBets: [] };
    
    let backBets = [...orderBook.backBets];
    let layBets = [...orderBook.layBets];
    
    // Aplicar filtro por tipo de apuesta
    if (betTypeFilter === 'BACK') {
      layBets = [];
    } else if (betTypeFilter === 'LAY') {
      backBets = [];
    }
    
    // Aplicar ordenación
    backBets = sortOrderBookEntries(backBets);
    layBets = sortOrderBookEntries(layBets);
    
    return { backBets, layBets };
  };

  // Obtener las selecciones disponibles
  const getAvailableSelections = (): string[] => {
    if (!market || !market.event || !market.event.participants) return [];
    return market.event.participants.map(p => p.name);
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
  if (loading) {
    return (
      <div className="admin-container">
        <div className="center-content">
          <Spinner />
          <p>Cargando libro de órdenes...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error
  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/admin/markets')}>
            Volver a Mercados
          </Button>
        </div>
      </div>
    );
  }

  // Obtener las entradas filtradas y ordenadas
  const { backBets, layBets } = getFilteredAndSortedEntries();
  const availableSelections = getAvailableSelections();

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Libro de Órdenes</h1>
        {market && market.event && (
          <div className="market-info">
            <h2>{market.name}</h2>
            <p>Evento: {market.event.name}</p>
            <p>Fecha: {new Date(market.event.startTime).toLocaleString()}</p>
            <p>Estado del mercado: {market.status}</p>
          </div>
        )}
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label>Filtrar por tipo:</label>
          <div className="button-group">
            <Button 
              variant={betTypeFilter === 'ALL' ? 'primary' : 'outline'}
              onClick={() => setBetTypeFilter('ALL')}
            >
              Todos
            </Button>
            <Button 
              variant={betTypeFilter === 'BACK' ? 'primary' : 'outline'}
              onClick={() => setBetTypeFilter('BACK')}
            >
              Back
            </Button>
            <Button 
              variant={betTypeFilter === 'LAY' ? 'primary' : 'outline'}
              onClick={() => setBetTypeFilter('LAY')}
            >
              Lay
            </Button>
          </div>
        </div>

        <div className="filter-group">
          <label>Ordenar por:</label>
          <div className="button-group">
            <Button 
              variant={sortBy === 'ODDS' ? 'primary' : 'outline'}
              onClick={() => setSortBy('ODDS')}
            >
              Cuota
            </Button>
            <Button 
              variant={sortBy === 'AMOUNT' ? 'primary' : 'outline'}
              onClick={() => setSortBy('AMOUNT')}
            >
              Monto
            </Button>
          </div>
        </div>

        <div className="filter-group">
          <label>Dirección:</label>
          <div className="button-group">
            <Button 
              variant={sortDirection === 'ASC' ? 'primary' : 'outline'}
              onClick={() => setSortDirection('ASC')}
            >
              Ascendente
            </Button>
            <Button 
              variant={sortDirection === 'DESC' ? 'primary' : 'outline'}
              onClick={() => setSortDirection('DESC')}
            >
              Descendente
            </Button>
          </div>
        </div>

        {availableSelections.length > 0 && (
          <div className="filter-group">
            <label>Selección:</label>
            <select 
              value={selectedSelection || ''} 
              onChange={(e) => setSelectedSelection(e.target.value || null)}
              className="selection-dropdown"
            >
              <option value="">Todas las selecciones</option>
              {availableSelections.map(selection => (
                <option key={selection} value={selection}>{selection}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="order-book-container">
        {betTypeFilter !== 'LAY' && (
          <div className="order-book-section back-bets">
            <h3>Apuestas Back</h3>
            {backBets.length === 0 ? (
              <p className="no-bets-message">No hay apuestas back pendientes</p>
            ) : (
              <table className="order-book-table">
                <thead>
                  <tr>
                    <th>Selección</th>
                    <th>Cuota</th>
                    <th>Monto Disponible</th>
                    <th>Apuestas</th>
                  </tr>
                </thead>
                <tbody>
                  {backBets.map((entry) => (
                    <tr key={`back-${entry.odds}`}>
                      <td>{entry.bets[0]?.selection}</td>
                      <td>{entry.odds.toFixed(2)}</td>
                      <td>${entry.totalAmount.toFixed(2)}</td>
                      <td>{entry.bets.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {betTypeFilter !== 'BACK' && (
          <div className="order-book-section lay-bets">
            <h3>Apuestas Lay</h3>
            {layBets.length === 0 ? (
              <p className="no-bets-message">No hay apuestas lay pendientes</p>
            ) : (
              <table className="order-book-table">
                <thead>
                  <tr>
                    <th>Selección</th>
                    <th>Cuota</th>
                    <th>Monto Disponible</th>
                    <th>Apuestas</th>
                  </tr>
                </thead>
                <tbody>
                  {layBets.map((entry) => (
                    <tr key={`lay-${entry.odds}`}>
                      <td>{entry.bets[0]?.selection}</td>
                      <td>{entry.odds.toFixed(2)}</td>
                      <td>${entry.totalAmount.toFixed(2)}</td>
                      <td>{entry.bets.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="admin-footer">
        <Button onClick={() => navigate('/admin/bets')}>
          Volver a Gestión de Apuestas
        </Button>
        <Button onClick={() => navigate('/admin/markets')}>
          Volver a Mercados
        </Button>
        <Button onClick={() => navigate('/admin')}>
          Volver al Panel de Administración
        </Button>
      </div>
    </div>
  );
};

export default OrderBookPage;
