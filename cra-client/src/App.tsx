import React, { useState } from 'react';
import './App.css';
import MainLayout from './components/layout/MainLayout/MainLayout';
import Button from './components/common/Button/Button';
import Card, { CardHeader, CardBody, CardFooter, CardImage } from './components/common/Card/Card';
import Badge from './components/common/Badge/Badge';
import ImageDisplay from './components/common/ImageDisplay/ImageDisplay';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    alert('Login clicked');
    // In a real app, this would open a login modal or redirect to a login page
  };

  const handleSignup = () => {
    alert('Sign up clicked');
    // In a real app, this would open a signup modal or redirect to a signup page
  };

  const handleLogout = () => {
    alert('Logout clicked');
    // In a real app, this would handle the logout process
  };

  return (
    <MainLayout
      isAuthenticated={isAuthenticated}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onLogout={handleLogout}
    >
      <div className="container">
        {/* Component Showcase Section */}
        <section className="showcase-section mt-lg mb-lg">
          <h2 className="section-title">Component Showcase</h2>
          <p className="section-description mb-lg">Here are some of the components we've created:</p>

          {/* Buttons Showcase */}
          <div className="component-group mb-xl">
            <h3 className="component-title">Buttons</h3>
            <div className="button-showcase">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="text">Text</Button>
            </div>
          </div>

          {/* Badges Showcase */}
          <div className="component-group mb-xl">
            <h3 className="component-title">Badges</h3>
            <div className="badge-showcase">
              <Badge>Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge rounded>Rounded</Badge>
            </div>
          </div>

          {/* Cards Showcase */}
          <div className="component-group mb-xl">
            <h3 className="component-title">Cards</h3>
            <div className="card-showcase">
              <Card className="showcase-card">
                <CardHeader>Card Header</CardHeader>
                <CardBody>
                  <p>This is a basic card with header, body, and footer.</p>
                </CardBody>
                <CardFooter>Card Footer</CardFooter>
              </Card>

              <Card className="showcase-card" hoverable>
                <CardImage src="/images/football10.png" alt="Football" />
                <CardBody>
                  <h4>Card with Image</h4>
                  <p>This card has an image and is hoverable.</p>
                </CardBody>
              </Card>

              <Card className="showcase-card">
                <CardBody>
                  <h4>Simple Card</h4>
                  <p>A simple card with just a body.</p>
                  <Button variant="primary" size="sm" className="mt-sm">Learn More</Button>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Image Display Showcase */}
          <div className="component-group">
            <h3 className="component-title">Image Display</h3>
            <div className="image-showcase">
              <div className="image-item">
                <h4>Football</h4>
                <ImageDisplay src="/images/football10.png" alt="Football" />
              </div>

              <div className="image-item">
                <h4>Basketball</h4>
                <ImageDisplay src="/images/basketball3.png" alt="Basketball" />
              </div>

              <div className="image-item">
                <h4>Tennis</h4>
                <ImageDisplay src="/images/tennis5.png" alt="Tennis" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default App;
