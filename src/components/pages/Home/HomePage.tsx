import React from 'react';
import './HomePage.css';
import ImageDisplay from '../../common/ImageDisplay/ImageDisplay';
import Card, { CardBody, CardImage } from '../../common/Card/Card';
import Button from '../../common/Button/Button';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Sports Betting Platform</h1>
          <p className="hero-description">
            Your premier destination for sports betting. Enjoy a wide range of sports events and betting options.
          </p>
          <div className="hero-actions">
            <Button size="lg">Explore Events</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>
        <div className="hero-image">
          <ImageDisplay src="/images/football10.png" alt="Sports" />
        </div>
      </section>

      <section className="featured-section">
        <h2 className="section-title">Featured Sports</h2>
        <div className="featured-grid">
          <Card className="featured-card" hoverable>
            <CardImage src="/images/football10.png" alt="Football" />
            <CardBody>
              <h3>Football</h3>
              <p>Explore the latest football matches and betting options.</p>
              <Button variant="text" className="mt-sm">View Events</Button>
            </CardBody>
          </Card>

          <Card className="featured-card" hoverable>
            <CardImage src="/images/basketball3.png" alt="Basketball" />
            <CardBody>
              <h3>Basketball</h3>
              <p>Check out the hottest basketball games and place your bets.</p>
              <Button variant="text" className="mt-sm">View Events</Button>
            </CardBody>
          </Card>

          <Card className="featured-card" hoverable>
            <CardImage src="/images/tennis5.png" alt="Tennis" />
            <CardBody>
              <h3>Tennis</h3>
              <p>Stay updated with tennis tournaments and betting opportunities.</p>
              <Button variant="text" className="mt-sm">View Events</Button>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
