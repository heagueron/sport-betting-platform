import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

// Define a type for the t function
type TFunction = (key: string, options?: any) => string;
// We'll use a direct URL for the background image

const HomePage: React.FC = () => {
  const { t } = useTranslation() as { t: TFunction };
  // Mock data for upcoming events
  const upcomingEvents = [
    { id: 1, name: 'Manchester United vs Liverpool', date: '2025-04-15', time: '15:00' },
    { id: 2, name: 'LA Lakers vs Chicago Bulls', date: '2025-04-12', time: '19:30' },
    { id: 3, name: 'Nadal vs Djokovic', date: '2025-04-18', time: '13:00' },
    { id: 4, name: 'New York Yankees vs Boston Red Sox', date: '2025-04-20', time: '18:00' },
  ];

  return (
    <div className="home-page">
      <div className="hero-section" style={{ backgroundImage: `url(/images/watching_sports_at_home.png)` }}>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="two-column-layout">
            <div className="column column-left">
              <div className="platform-purpose">
                <h1>{t('home.hero.title')}</h1>
                <p className="hero-description">
                  {t('home.hero.description')}
                </p>
                <Link to="/sports" className="cta-button">{t('home.hero.ctaButton')}</Link>
              </div>

              <div className="upcoming-events">
                <h3>{t('home.upcomingEvents.title')}</h3>
                <ul className="events-list">
                  {upcomingEvents.map(event => (
                    <li key={event.id} className="event-item">
                      <div className="event-details">
                        <span className="event-name">{event.name}</span>
                        <span className="event-time">{event.date} | {event.time}</span>
                      </div>
                      <Link to={`/events/${event.id}`} className="event-link">{t('home.upcomingEvents.viewButton')}</Link>
                    </li>
                  ))}
                  <li className="event-item more-events">
                    <Link to="/events" className="more-events-link">
                      {t('home.upcomingEvents.moreEvents')} →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="column column-right">
              <div className="sports-cards">
                <Link to="/sports/football" className="sport-card">
                  <div className="sport-card-image">
                    <img src="/images/football10.png" alt={t('home.sports.football')} />
                  </div>
                  <h3>{t('home.sports.football')}</h3>
                </Link>

                <Link to="/sports/basketball" className="sport-card">
                  <div className="sport-card-image">
                    <img src="/images/basketball3.png" alt={t('home.sports.basketball')} />
                  </div>
                  <h3>{t('home.sports.basketball')}</h3>
                </Link>

                <Link to="/sports/tennis" className="sport-card">
                  <div className="sport-card-image tennis-image">
                    <img src="/images/tennis5.png" alt={t('home.sports.tennis')} />
                  </div>
                  <h3>{t('home.sports.tennis')}</h3>
                </Link>

                <Link to="/sports/horse-racing" className="sport-card">
                  <div className="sport-card-image">
                    <img src="/images/horse_racing.png" alt={t('home.sports.horseRacing')} />
                  </div>
                  <h3>{t('home.sports.horseRacing')}</h3>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
