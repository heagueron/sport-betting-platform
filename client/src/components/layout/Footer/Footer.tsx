import { Link } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './Footer.module.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>{t('footer.aboutUs')}</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/about">{t('footer.aboutBetMaster')}</Link></li>
              <li><Link to="/terms">{t('footer.termsConditions')}</Link></li>
              <li><Link to="/privacy">{t('footer.privacyPolicy')}</Link></li>
              <li><Link to="/responsible-gambling">{t('footer.responsibleGambling')}</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>{t('footer.sports')}</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/sports/football">{t('footer.football')}</Link></li>
              <li><Link to="/sports/basketball">{t('footer.basketball')}</Link></li>
              <li><Link to="/sports/tennis">{t('footer.tennis')}</Link></li>
              <li><Link to="/sports/baseball">{t('footer.baseball')}</Link></li>
              <li><Link to="/sports/hockey">{t('footer.hockey')}</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>{t('footer.helpSupport')}</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/faq">{t('footer.faq')}</Link></li>
              <li><Link to="/contact">{t('footer.contactUs')}</Link></li>
              <li><Link to="/help">{t('footer.helpCenter')}</Link></li>
              <li><Link to="/payment-methods">{t('footer.paymentMethods')}</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>{t('footer.followUs')}</h3>
            <div className={styles.socialLinks}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerLogo}>
            <img src="/logo.svg" alt="BetMaster Logo" className={styles.footerLogoImage} />
            <span className={styles.footerLogoText}>{t('app.name')}</span>
          </div>

          <div className={styles.copyright}>
            &copy; {currentYear} {t('app.name')}. {t('footer.allRightsReserved')}
          </div>
        </div>
      </div>
    </footer>
  );
};
