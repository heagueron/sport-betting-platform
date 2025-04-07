import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation() as { t: (key: string) => string };
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-image-container">
          <img src="/images/404_Athlet_no_bg.png" alt="404 Athlete" className="not-found-image" />
        </div>
        <div className="not-found-content">
          <p className="not-found-message">{t('notFound.description')}</p>
          <Link to="/" className="home-button">
            {t('notFound.goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
