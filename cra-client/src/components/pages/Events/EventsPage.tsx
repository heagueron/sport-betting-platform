import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './EventsPage.css';

// Define a type for the t function
type TFunction = (key: string, options?: any) => string;

const EventsPage: React.FC = () => {
  const { t } = useTranslation() as { t: TFunction };
  // Mock data for events
  const events = [
    {
      id: 1,
      title: 'Manchester United vs Liverpool',
      sport: 'Football',
      date: '2025-04-15T15:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'Manchester United', odds: 2.5 },
        away: { name: 'Liverpool', odds: 1.8 },
      },
      draw: 3.2,
    },
    {
      id: 2,
      title: 'LA Lakers vs Chicago Bulls',
      sport: 'Basketball',
      date: '2025-04-12T19:30:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'LA Lakers', odds: 1.6 },
        away: { name: 'Chicago Bulls', odds: 2.3 },
      },
    },
    {
      id: 3,
      title: 'Nadal vs Djokovic',
      sport: 'Tennis',
      date: '2025-04-18T13:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'Rafael Nadal', odds: 2.1 },
        away: { name: 'Novak Djokovic', odds: 1.9 },
      },
    },
    {
      id: 4,
      title: 'New York Yankees vs Boston Red Sox',
      sport: 'Baseball',
      date: '2025-04-20T18:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'New York Yankees', odds: 1.7 },
        away: { name: 'Boston Red Sox', odds: 2.2 },
      },
    },
  ];

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="events-page">
      <div className="events-title-container">
        <h1>{t('events.title')}</h1>
      </div>

      <div className="container">
        <div className="events-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div>
                  <span className="sport-badge">{t(`home.sports.${event.sport.toLowerCase()}`)}</span>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-date">{formatDate(event.date)}</p>
                </div>
                <span className="status-badge">{t('events.status')}</span>
              </div>

              <div className="event-odds">
                <div className="team">
                  <span className="team-name">{event.teams.home.name}</span>
                  <span className="odds-badge">{event.teams.home.odds}</span>
                </div>

                {event.draw && (
                  <div className="draw">
                    <span className="draw-label">{t('events.draw')}</span>
                    <span className="odds-badge">{event.draw}</span>
                  </div>
                )}

                <div className="team">
                  <span className="team-name">{event.teams.away.name}</span>
                  <span className="odds-badge">{event.teams.away.odds}</span>
                </div>
              </div>

              <div className="event-actions">
                <button className="bet-button">{t('events.placeBet')}</button>
                <Link to={`/events/${event.id}`} className="details-button">
                  {t('events.viewDetails')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
