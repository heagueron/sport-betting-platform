import React from 'react';
import './SportsPage.css';
import Card, { CardBody, CardImage } from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';

const SportsPage: React.FC = () => {
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
      <div className="page-header">
        <h1>Sports</h1>
        <p className="page-description">
          Browse all available sports and find events to bet on.
        </p>
      </div>

      <div className="sports-grid">
        {sports.map((sport) => (
          <Card key={sport.id} className="sport-card" hoverable>
            <CardImage src={sport.image} alt={sport.name} />
            <CardBody>
              <div className="sport-header">
                <h3>{sport.name}</h3>
                <Badge variant="primary" rounded>{sport.eventCount} Events</Badge>
              </div>
              <p>Check out the latest {sport.name.toLowerCase()} events and place your bets.</p>
              <Button className="mt-sm">View Events</Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SportsPage;
