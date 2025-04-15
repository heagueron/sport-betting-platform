import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService, { Market } from '../../../../services/admin.service';
import Button from '../../../common/Button/Button';
import './Markets.css';

interface MarketDetailParams {
  marketId: string;
}

const MarketDetail: React.FC = () => {
  const { marketId } = useParams<keyof MarketDetailParams>() as MarketDetailParams;
  const [market, setMarket] = useState<Market | null>(null);
  const [selections, setSelections] = useState<string[]>([]);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketDetails();
  }, [marketId]);

  const fetchMarketDetails = async () => {
    setLoading(true);
    try {
      const response = await adminService.getMarketById(marketId);
      setMarket(response.data);

      // Obtener las selecciones disponibles
      // Nota: Esto es un ejemplo, deberías adaptar esto según cómo estén estructuradas las selecciones en tu API
      if (response.data.event && response.data.event.participants) {
        setSelections(response.data.event.participants.map((p: any) => p.name));
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching market details:', err);
      setError('Error al cargar los detalles del mercado. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (action: string) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;
      switch (action) {
        case 'suspend':
          response = await adminService.suspendMarket(marketId);
          setSuccessMessage('Mercado suspendido correctamente');
          break;
        case 'reopen':
          response = await adminService.reopenMarket(marketId);
          setSuccessMessage('Mercado reactivado correctamente');
          break;
        case 'close':
          response = await adminService.closeMarket(marketId);
          setSuccessMessage('Mercado cerrado correctamente');
          break;
        case 'cancel':
          if (window.confirm('¿Estás seguro de que deseas cancelar este mercado? Esta acción devolverá todos los fondos a los usuarios.')) {
            response = await adminService.cancelMarket(marketId);
            setSuccessMessage('Mercado cancelado correctamente');
          }
          break;
        default:
          return;
      }

      if (response) {
        setMarket(response.data);
      }
    } catch (err) {
      console.error(`Error ${action} market:`, err);
      setError(`Error al ${getActionText(action)} el mercado. Por favor, inténtalo de nuevo.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSettleMarket = async () => {
    if (!selectedWinner) {
      setError('Debes seleccionar una opción ganadora');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas liquidar este mercado con "${selectedWinner}" como ganador? Esta acción es irreversible.`)) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await adminService.settleMarket(marketId, selectedWinner);
      setMarket(response.data);
      setSuccessMessage('Mercado liquidado correctamente');
    } catch (err) {
      console.error('Error settling market:', err);
      setError('Error al liquidar el mercado. Por favor, inténtalo de nuevo.');
    } finally {
      setActionLoading(false);
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

  if (loading) {
    return <div className="loading">Cargando detalles del mercado...</div>;
  }

  if (!market) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>No se pudo cargar el mercado. Por favor, inténtalo de nuevo.</p>
        <Button onClick={() => navigate('/admin/markets')}>
          Volver a la lista de mercados
        </Button>
      </div>
    );
  }

  return (
    <div className="market-detail-container">
      <div className="market-detail-header">
        <h1>{market.name}</h1>
        <span className={getStatusBadgeClass(market.status)}>
          {getStatusText(market.status)}
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="market-info">
        <div className="info-group">
          <h3>Información del Mercado</h3>
          <div className="info-row">
            <span className="info-label">ID:</span>
            <span className="info-value">{market.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Evento:</span>
            <span className="info-value">{market.event?.name || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Creado:</span>
            <span className="info-value">{new Date(market.createdAt).toLocaleString()}</span>
          </div>
          {market.settledAt && (
            <div className="info-row">
              <span className="info-label">Liquidado:</span>
              <span className="info-value">{new Date(market.settledAt).toLocaleString()}</span>
            </div>
          )}
          {market.winningSelection && (
            <div className="info-row">
              <span className="info-label">Selección ganadora:</span>
              <span className="info-value winning-selection">{market.winningSelection}</span>
            </div>
          )}
        </div>

        <div className="market-actions">
          <h3>Acciones</h3>

          {market.status === 'OPEN' && (
            <>
              <Button
                variant="warning"
                onClick={() => handleStatusChange('suspend')}
                disabled={actionLoading}
              >
                Suspender Mercado
              </Button>
              <Button
                variant="danger"
                onClick={() => handleStatusChange('close')}
                disabled={actionLoading}
              >
                Cerrar Mercado
              </Button>
            </>
          )}

          {market.status === 'SUSPENDED' && (
            <Button
              variant="success"
              onClick={() => handleStatusChange('reopen')}
              disabled={actionLoading}
            >
              Reactivar Mercado
            </Button>
          )}

          {(market.status === 'OPEN' || market.status === 'SUSPENDED') && (
            <Button
              variant="danger"
              onClick={() => handleStatusChange('cancel')}
              disabled={actionLoading}
            >
              Cancelar Mercado
            </Button>
          )}

          {(market.status === 'CLOSED') && (
            <div className="settle-market-section">
              <h3>Liquidar Mercado</h3>
              <div className="settle-form">
                <div className="form-group">
                  <label htmlFor="winner-select">Seleccionar Ganador:</label>
                  <select
                    id="winner-select"
                    value={selectedWinner}
                    onChange={(e) => setSelectedWinner(e.target.value)}
                    disabled={actionLoading || market.status !== 'CLOSED'}
                  >
                    <option value="">Selecciona una opción</option>
                    {selections.map((selection, index) => (
                      <option key={index} value={selection}>
                        {selection}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleSettleMarket}
                  disabled={actionLoading || !selectedWinner || market.status !== 'CLOSED'}
                >
                  Confirmar Liquidación
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="market-detail-footer">
        <Button variant="outline" onClick={() => navigate('/admin/markets')}>
          Volver a la lista de mercados
        </Button>
      </div>
    </div>
  );
};

export default MarketDetail;
