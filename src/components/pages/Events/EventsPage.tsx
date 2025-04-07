import React from 'react';
import './EventsPage.css';
import Card, { CardBody } from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';

const EventsPage: React.FC = () => {
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
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="events-page">
      <div className="page-header">
        <h1>Upcoming Events</h1>
        <p className="page-description">
          Browse all upcoming events and place your bets.
        </p>
      </div>

      <div className="events-list">
        {events.map((event) => (
          <Card key={event.id} className="event-card">
            <CardBody>
              <div className="event-header">
                <div>
                  <Badge variant="secondary">{event.sport}</Badge>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-date">{formatDate(event.date)}</p>
                </div>
                <Badge variant="success" rounded>{event.status}</Badge>
              </div>

              <div className="event-odds">
                <div className="team">
                  <span className="team-name">{event.teams.home.name}</span>
                  <Badge variant="info" className="odds-badge">{event.teams.home.odds}</Badge>
                </div>

                {event.draw && (
                  <div className="draw">
                    <span className="draw-label">Draw</span>
                    <Badge variant="info" className="odds-badge">{event.draw}</Badge>
                  </div>
                )}

                <div className="team">
                  <span className="team-name">{event.teams.away.name}</span>
                  <Badge variant="info" className="odds-badge">{event.teams.away.odds}</Badge>
                </div>
              </div>

              <div className="event-actions">
                <Button>Place Bet</Button>
                <Button variant="outline">View Details</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
