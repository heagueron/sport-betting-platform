import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SportDetailPage.css';

// Define a type for the t function
type TFunction = (key: string, options?: any) => string;

// Define sport type
interface Sport {
  id: number;
  name: string;
  image: string;
  description: string;
  eventCount: number;
  popularLeagues: string[];
}

// Define event type
interface Event {
  id: number;
  title: string;
  sport: string;
  sportId: number;
  date: string;
  status: string;
  teams: {
    home: { name: string; odds: number };
    away: { name: string; odds: number };
  };
  draw?: number;
}

const SportDetailPage: React.FC = () => {
  const { sportId } = useParams<{ sportId: string }>();
  const { t } = useTranslation() as { t: TFunction };

  // Mock data for sports - in a real app, this would come from an API
  const sports: Sport[] = [
    {
      id: 1,
      name: 'Football',
      image: '/images/football10.png',
      eventCount: 24,
      description: 'Football, also known as soccer in some countries, is the world\'s most popular sport. It is played between two teams of 11 players each, with a spherical ball. The objective is to score by getting the ball into the opposing goal.',
      popularLeagues: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1']
    },
    {
      id: 2,
      name: 'Basketball',
      image: '/images/basketball3.png',
      eventCount: 18,
      description: 'Basketball is a team sport in which two teams of five players each try to score points by throwing a ball through a hoop (the basket) under organized rules. It is played on both indoor and outdoor courts.',
      popularLeagues: ['NBA', 'EuroLeague', 'NCAA', 'FIBA World Cup']
    },
    {
      id: 3,
      name: 'Tennis',
      image: '/images/tennis5.png',
      eventCount: 12,
      description: 'Tennis is a racket sport that can be played individually against a single opponent (singles) or between two teams of two players each (doubles). Each player uses a tennis racket that is strung with cord to strike a hollow rubber ball covered with felt over or around a net and into the opponent\'s court.',
      popularLeagues: ['Grand Slam Tournaments', 'ATP Tour', 'WTA Tour', 'Davis Cup']
    },
    {
      id: 4,
      name: 'Baseball',
      image: '/images/baseball1.png',
      eventCount: 8,
      description: 'Baseball is a bat-and-ball game played between two opposing teams, typically of nine players each, that take turns batting and fielding. The game proceeds when a player on the fielding team, called the pitcher, throws a ball which a player on the batting team tries to hit with a bat.',
      popularLeagues: ['MLB', 'NPB', 'KBO League', 'WBSC Premier12']
    },
    {
      id: 5,
      name: 'Boxing',
      image: '/images/boxing1.png',
      eventCount: 5,
      description: 'Boxing is a combat sport in which two people, usually wearing protective gloves, throw punches at each other for a predetermined amount of time in a boxing ring.',
      popularLeagues: ['WBC', 'WBA', 'IBF', 'WBO']
    },
    {
      id: 6,
      name: 'Horse Racing',
      image: '/images/horse_racing.png',
      eventCount: 7,
      description: 'Horse racing is an equestrian performance sport, typically involving two or more horses ridden by jockeys over a set distance for competition.',
      popularLeagues: ['Triple Crown', 'Breeders\' Cup', 'Royal Ascot', 'Dubai World Cup']
    },
  ];

  // Mock data for events
  const events: Event[] = [
    {
      id: 1,
      title: 'Manchester United vs Liverpool',
      sport: 'Football',
      sportId: 1,
      date: '2025-04-15T15:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'Manchester United', odds: 2.5 },
        away: { name: 'Liverpool', odds: 1.8 },
      },
      draw: 3.2,
    },
    {
      id: 5,
      title: 'Arsenal vs Chelsea',
      sport: 'Football',
      sportId: 1,
      date: '2025-04-22T17:30:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'Arsenal', odds: 2.1 },
        away: { name: 'Chelsea', odds: 2.0 },
      },
      draw: 3.0,
    },
    {
      id: 6,
      title: 'Barcelona vs Real Madrid',
      sport: 'Football',
      sportId: 1,
      date: '2025-04-25T20:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'Barcelona', odds: 1.9 },
        away: { name: 'Real Madrid', odds: 2.2 },
      },
      draw: 3.1,
    },
    {
      id: 2,
      title: 'LA Lakers vs Chicago Bulls',
      sport: 'Basketball',
      sportId: 2,
      date: '2025-04-12T19:30:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'LA Lakers', odds: 1.6 },
        away: { name: 'Chicago Bulls', odds: 2.3 },
      },
    },
    {
      id: 7,
      title: 'Boston Celtics vs Brooklyn Nets',
      sport: 'Basketball',
      sportId: 2,
      date: '2025-04-18T18:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'Boston Celtics', odds: 1.8 },
        away: { name: 'Brooklyn Nets', odds: 2.1 },
      },
    },
    {
      id: 3,
      title: 'Nadal vs Djokovic',
      sport: 'Tennis',
      sportId: 3,
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
      sportId: 4,
      date: '2025-04-20T18:00:00',
      status: 'Upcoming',
      teams: {
        home: { name: 'New York Yankees', odds: 1.7 },
        away: { name: 'Boston Red Sox', odds: 2.2 },
      },
    },
  ];

  // Find the sport with the matching ID
  const sport = sports.find(s => s.id === Number(sportId));

  // Filter events for this sport
  const sportEvents = events.filter(e => e.sportId === Number(sportId));

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

  if (!sport) {
    return (
      <div className="sport-detail-page">
        <div className="page-container">
          <div className="sport-not-found">
            <h2>{t('sportsList.notFound')}</h2>
            <p>{t('sportsList.notFoundDescription')}</p>
            <Link to="/sports" className="back-button">{t('sportsList.backToSports')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sport-detail-page">
      <div className="sport-detail-header">
        <div className="page-container">
          <div className="breadcrumbs">
            <Link to="/sports">{t('sportsList.title')}</Link> &gt; <span>{sport.name}</span>
          </div>
          <div className="sport-header-content">
            <div className="sport-image">
              <img src={sport.image} alt={sport.name} />
            </div>
            <div className="sport-info">
              <h1>{sport.name}</h1>
              <p className="event-count">{sport.eventCount} {t('sportsList.events')}</p>
              <p className="sport-description">{sport.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="sport-detail-content">
          <div className="popular-leagues">
            <h2>{t('sportsList.popularLeagues')}</h2>
            <div className="leagues-list">
              {sport.popularLeagues.map((league, index) => (
                <div key={index} className="league-item">
                  <span>{league}</span>
                  <Link to={`/sports/${sport.id}/leagues/${index + 1}`} className="view-button">
                    {t('sportsList.viewEvents')}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="upcoming-events">
            <h2>{t('sportsList.upcomingEvents')}</h2>
            {sportEvents.length > 0 ? (
              <div className="events-list">
                {sportEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <div>
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
            ) : (
              <div className="no-events">
                <p>{t('sportsList.noEvents')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportDetailPage;
