import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './EventDetailPage.css';

// Define a type for the t function
type TFunction = (key: string, options?: any) => string;

// Define event type
interface Team {
  name: string;
  odds: number;
  logo?: string;
}

interface Event {
  id: number;
  title: string;
  sport: string;
  sportId: number;
  date: string;
  status: string;
  teams: {
    home: Team;
    away: Team;
  };
  draw?: number;
  description?: string;
  venue?: string;
}

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { t } = useTranslation() as { t: TFunction };

  // Mock data for events - in a real app, this would come from an API
  const events: Event[] = [
    {
      id: 1,
      title: 'Manchester United vs Liverpool',
      sport: 'Football',
      sportId: 1,
      date: '2025-04-15T15:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'Manchester United', odds: 2.5, logo: '/images/football10.png' },
        away: { name: 'Liverpool', odds: 1.8, logo: '/images/football10.png' },
      },
      draw: 3.2,
      description: 'Una de las mayores rivalidades del fútbol inglés. El Manchester United recibe al Liverpool en Old Trafford en lo que promete ser un emocionante enfrentamiento de la Premier League.',
      venue: 'Old Trafford, Manchester'
    },
    {
      id: 2,
      title: 'LA Lakers vs Chicago Bulls',
      sport: 'Basketball',
      sportId: 2,
      date: '2025-04-12T19:30:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'LA Lakers', odds: 1.6, logo: '/images/basketball3.png' },
        away: { name: 'Chicago Bulls', odds: 2.3, logo: '/images/basketball3.png' },
      },
      description: 'Partido de temporada regular de la NBA entre Los Angeles Lakers y Chicago Bulls.',
      venue: 'Staples Center, Los Angeles'
    },
    {
      id: 3,
      title: 'Nadal vs Djokovic',
      sport: 'Tennis',
      sportId: 3,
      date: '2025-04-18T13:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'Rafael Nadal', odds: 2.1, logo: '/images/tennis5.png' },
        away: { name: 'Novak Djokovic', odds: 1.9, logo: '/images/tennis5.png' },
      },
      description: 'Partido final de Grand Slam entre dos leyendas del tenis, Rafael Nadal y Novak Djokovic.',
      venue: 'Roland Garros, Paris'
    },
    {
      id: 4,
      title: 'New York Yankees vs Boston Red Sox',
      sport: 'Baseball',
      sportId: 4,
      date: '2025-04-20T18:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'New York Yankees', odds: 1.7, logo: '/images/baseball1.png' },
        away: { name: 'Boston Red Sox', odds: 2.2, logo: '/images/baseball1.png' },
      },
      description: 'Partido de temporada regular de la MLB entre los históricos rivales New York Yankees y Boston Red Sox.',
      venue: 'Yankee Stadium, New York'
    },
  ];

  // Find the event with the matching ID
  const event = events.find(e => e.id === Number(eventId));

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!event) {
    return (
      <div className="event-detail-page">
        <div className="page-container">
          <div className="event-not-found">
            <h2>{t('events.notFound')}</h2>
            <p>{t('events.notFoundDescription')}</p>
            <Link to="/events" className="back-button">{t('events.backToEvents')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <div className="event-detail-header">
        <div className="page-container">
          <h1>{event.title}</h1>
          <div className="event-meta">
            <span className="event-date">{formatDate(event.date)}</span>
            <span className="event-venue">{event.venue}</span>
            <span className="event-status">{t('events.status')}</span>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="event-detail-content">
          <div className="event-description">
            <h2>{t('events.description')}</h2>
            <p>{event.description}</p>
          </div>

          <div className="event-teams">
            <div className="team home-team">
              {event.teams.home.logo && (
                <div className="team-logo">
                  <img src={event.teams.home.logo} alt={event.teams.home.name} />
                </div>
              )}
              <h3>{event.teams.home.name}</h3>
              <div className="team-odds">
                <span className="odds-label">{t('events.odds')}</span>
                <span className="odds-value">{event.teams.home.odds}</span>
              </div>
              <button className="bet-button">{t('events.placeBet')}</button>
            </div>

            {event.draw !== undefined && (
              <div className="draw-option">
                <h3>{t('events.draw')}</h3>
                <div className="draw-odds">
                  <span className="odds-label">{t('events.odds')}</span>
                  <span className="odds-value">{event.draw}</span>
                </div>
                <button className="bet-button">{t('events.placeBet')}</button>
              </div>
            )}

            <div className="team away-team">
              {event.teams.away.logo && (
                <div className="team-logo">
                  <img src={event.teams.away.logo} alt={event.teams.away.name} />
                </div>
              )}
              <h3>{event.teams.away.name}</h3>
              <div className="team-odds">
                <span className="odds-label">{t('events.odds')}</span>
                <span className="odds-value">{event.teams.away.odds}</span>
              </div>
              <button className="bet-button">{t('events.placeBet')}</button>
            </div>
          </div>

          <div className="related-events">
            <h2>{t('events.relatedEvents')}</h2>
            <div className="related-events-list">
              {events
                .filter(e => e.sport === event.sport && e.id !== event.id)
                .slice(0, 3)
                .map(relatedEvent => (
                  <div key={relatedEvent.id} className="related-event-card">
                    <h4>{relatedEvent.title}</h4>
                    <p>{formatDate(relatedEvent.date)}</p>
                    <Link to={`/events/${relatedEvent.id}`} className="view-button">
                      {t('events.viewDetails')}
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
