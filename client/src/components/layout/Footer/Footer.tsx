import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>About Us</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/about">About BetMaster</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/responsible-gambling">Responsible Gambling</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Sports</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/sports/football">Football</Link></li>
              <li><Link to="/sports/basketball">Basketball</Link></li>
              <li><Link to="/sports/tennis">Tennis</Link></li>
              <li><Link to="/sports/baseball">Baseball</Link></li>
              <li><Link to="/sports/hockey">Hockey</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Help & Support</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/payment-methods">Payment Methods</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Follow Us</h3>
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
            <span className={styles.footerLogoText}>BetMaster</span>
          </div>
          
          <div className={styles.copyright}>
            &copy; {currentYear} BetMaster. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
