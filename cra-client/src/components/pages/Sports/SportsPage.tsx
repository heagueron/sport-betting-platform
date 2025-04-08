import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SportsPage.css';

// Define a type for the t function
type TFunction = (key: string, options?: any) => string;

const SportsPage: React.FC = () => {
  const { t } = useTranslation() as { t: TFunction };
  // Mock data for sports
  const sports = [
    { id: 1, name: 'Football', image: '/images/football10.png', eventCount: 24 },
    { id: 2, name: 'Basketball', image: '/images/basketball3.png', eventCount: 18 },
    { id: 3, name: 'Tennis', image: '/images/tennis5.png', eventCount: 12 },
    { id: 4, name: 'Baseball', image: '/images/baseball1.png', eventCount: 8 },
    { id: 5, name: 'Boxing', image: '/images/boxing1.png', eventCount: 5 },
    { id: 6, name: 'Horse Racing', image: '/images/horse_racing.png', eventCount: 7 },
  ];

  return (
    <div className="sports-page">
      <div className="sports-title-container">
        <h1>{t('sportsList.title')}</h1>
      </div>

      <div className="page-container">
        <div className="sports-grid">
          {sports.map((sport) => (
            <div key={sport.id} className="sport-card">
              <div className="card-image">
                <img src={sport.image} alt={sport.name} />
              </div>
              <div className="card-content">
                <div className="sport-header">
                  <h3>{sport.name}</h3>
                  <span className="event-count">{sport.eventCount} {t('sportsList.events')}</span>
                </div>
                <p>{t('sportsList.sportDescription', { sport: sport.name })}</p>
                <Link to={`/sports/${sport.id}`} className="view-button">
                  {t('sportsList.viewEvents')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SportsPage;
