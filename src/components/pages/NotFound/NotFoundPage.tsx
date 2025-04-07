import React from 'react';
import './NotFoundPage.css';
import Button from '../../common/Button/Button';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button size="lg">Go to Homepage</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
