import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

// Define a type for the t function
type TFunction = (key: string, options?: any) => string;

const Footer: React.FC = () => {
  const { t } = useTranslation() as { t: TFunction };
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">AGANAR</h3>
            <p className="footer-description">
              {t('footer.description')}
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.quickLinks')}</h4>
            <ul className="footer-links">
              <li><Link to="/">{t('header.home')}</Link></li>
              <li><Link to="/sports">{t('sports.title')}</Link></li>
              <li><Link to="/events">{t('events.title')}</Link></li>
              <li><Link to="/about">{t('header.aboutUs')}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.legal')}</h4>
            <ul className="footer-links">
              <li><a href="/terms">{t('footer.termsOfService')}</a></li>
              <li><a href="/privacy">{t('footer.privacyPolicy')}</a></li>
              <li><a href="/responsible-gambling">{t('footer.responsibleGambling')}</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.contact')}</h4>
            <ul className="footer-links">
              <li><a href="mailto:support@sbp.com">support@sbp.com</a></li>
              <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            {t('footer.copyright', { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
