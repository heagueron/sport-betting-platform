import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSports } from '../../../../services/sport.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Sport } from '../../../../types';
import styles from './SportsList.module.css';

// Map of sport names to emoji icons
const sportIcons: Record<string, string> = {
  football: '🏈',
  soccer: '⚽',
  basketball: '🏀',
  baseball: '⚾',
  hockey: '🏒',
  tennis: '🎾',
  golf: '⛳',
  boxing: '🥊',
  mma: '🥋',
  cricket: '🏏',
  default: '🎮',
};

export const SportsList = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

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

  const getSportIcon = (sportName: string) => {
    const lowerCaseName = sportName.toLowerCase();

    for (const [key, icon] of Object.entries(sportIcons)) {
      if (lowerCaseName.includes(key)) {
        return icon;
      }
    }

    return sportIcons.default;
  };

  if (isLoading) {
    return <div>{t('home.loadingSports')}</div>;
  }

  if (sports.length === 0) {
    return <div>{t('home.noSportsAvailable')}</div>;
  }

  return (
    <section className={styles.sportsList}>
      <h2 className={styles.title}>{t('home.browseSportsTitle')}</h2>
      <div className={styles.sportsGrid}>
        {sports.map(sport => (
          <Link
            key={sport.id}
            to={`/sports/${sport.slug}`}
            className={styles.sportCard}
          >
            <div className={styles.sportIcon}>
              {getSportIcon(sport.name)}
            </div>
            <div className={styles.sportName}>
              {sport.name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
