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

  const getSportImage = (sportName: string) => {
    const lowerCaseName = sportName.toLowerCase();

    if (lowerCaseName.includes('football') || lowerCaseName.includes('soccer')) {
      return 'images/football10.png';
    } else if (lowerCaseName.includes('basketball')) {
      return 'images/basketball1.png';
    } else if (lowerCaseName.includes('tennis')) {
      return 'images/tennis5.png';
    } else if (lowerCaseName.includes('baseball')) {
      return 'images/baseball1.png';
    } else if (lowerCaseName.includes('boxing')) {
      return 'images/boxing1.png';
    } else if (lowerCaseName.includes('athletics')) {
      return 'images/Athletics1.png';
    } else if (lowerCaseName.includes('padel')) {
      return 'images/padel1.png';
    } else if (lowerCaseName.includes('horse')) {
      return 'images/horse_racing.png';
    }

    // Default image
    return 'images/watching_sports_at_home.png';
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
              <img
                src={getSportImage(sport.name)}
                alt={sport.name}
                className={styles.sportImage}
              />
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
