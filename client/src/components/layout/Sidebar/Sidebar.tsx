import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getSports } from '../../../services/sport.service';
import styles from './Sidebar.module.css';

interface Sport {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

interface BetslipItem {
  id: string;
  event: string;
  selection: string;
  odds: number;
}

export const Sidebar = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [betslip, setBetslip] = useState<BetslipItem[]>([]);
  const [betAmount, setBetAmount] = useState<string>('');
  const { isAuthenticated } = useAuthContext();
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const fetchSports = async () => {
      setIsLoading(true);
      try {
        const response = await getSports({ active: true });
        if (response.success && response.data) {
          setSports(response.data);
        }
      } catch (error) {
        console.error('Error fetching sports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSports();
  }, []);

  // This would normally be handled with a context or state management
  // For demo purposes, we're using localStorage
  useEffect(() => {
    const storedBetslip = localStorage.getItem('betslip');
    if (storedBetslip) {
      try {
        setBetslip(JSON.parse(storedBetslip));
      } catch (error) {
        console.error('Error parsing betslip:', error);
        localStorage.removeItem('betslip');
      }
    }
  }, []);

  const removeBet = (id: string) => {
    const updatedBetslip = betslip.filter(bet => bet.id !== id);
    setBetslip(updatedBetslip);
    localStorage.setItem('betslip', JSON.stringify(updatedBetslip));
  };

  const clearBetslip = () => {
    setBetslip([]);
    localStorage.removeItem('betslip');
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setBetAmount(value);
  };

  const calculateTotalOdds = () => {
    if (betslip.length === 0) return 0;
    return betslip.reduce((total, bet) => total * bet.odds, 1);
  };

  const calculatePotentialWinnings = () => {
    const amount = parseFloat(betAmount) || 0;
    const totalOdds = calculateTotalOdds();
    return (amount * totalOdds).toFixed(2);
  };

  const handlePlaceBet = () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    // This would normally call the API to place the bet
    alert('Bet placed successfully!');
    clearBetslip();
    setBetAmount('');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h2 className={styles.sidebarTitle}>{t('nav.sports')}</h2>
        {isLoading ? (
          <p>{t('home.loadingSports')}</p>
        ) : (
          <ul className={styles.sportsList}>
            {sports.map(sport => (
              <li key={sport.id} className={styles.sportItem}>
                <Link
                  to={`/sports/${sport.slug}`}
                  className={`${styles.sportLink} ${location.pathname === `/sports/${sport.slug}` ? styles.activeSportLink : ''}`}
                >
                  <span className={styles.sportName}>{sport.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`${styles.sidebarSection} ${styles.betslipSection}`}>
        <div className={styles.betslipTitle}>
          <h2>{t('betslip.title')}</h2>
          {betslip.length > 0 && (
            <span className={styles.betslipCount}>{betslip.length}</span>
          )}
        </div>

        {betslip.length === 0 ? (
          <div className={styles.emptyBetslip}>
            <p>{t('betslip.empty')}</p>
            <p>{t('betslip.selectOdds')}</p>
          </div>
        ) : (
          <>
            {betslip.map(bet => (
              <div key={bet.id} className={styles.betItem}>
                <div className={styles.betItemHeader}>
                  <div className={styles.betItemEvent}>{bet.event}</div>
                  <button
                    className={styles.removeButton}
                    onClick={() => removeBet(bet.id)}
                    aria-label="Remove bet"
                  >
                    ×
                  </button>
                </div>
                <div className={styles.betItemSelection}>
                  {bet.selection} <span className={styles.betItemOdds}>{bet.odds.toFixed(2)}</span>
                </div>
              </div>
            ))}

            <div className={styles.betslipFooter}>
              <div className={styles.betslipTotal}>
                <span>{t('betslip.totalOdds')}</span>
                <span>{calculateTotalOdds().toFixed(2)}</span>
              </div>

              <div className={styles.betslipInput}>
                <input
                  type="text"
                  placeholder={t('betslip.enterStake')}
                  value={betAmount}
                  onChange={handleBetAmountChange}
                />
              </div>

              {betAmount && (
                <div className={styles.potentialWinnings}>
                  {t('betslip.potentialWinnings')} ${calculatePotentialWinnings()}
                </div>
              )}

              <button
                className={styles.placeBetButton}
                onClick={handlePlaceBet}
                disabled={betslip.length === 0 || !betAmount}
              >
                {t('betslip.placeBet')}
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
