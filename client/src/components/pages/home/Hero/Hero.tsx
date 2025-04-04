import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { Button } from '../../../common/Button/Button';
import styles from './Hero.module.css';

export const Hero = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Welcome to BetMaster</h1>
        <p className={styles.heroSubtitle}>
          The ultimate sports betting platform. Place bets on your favorite sports and events.
        </p>
        <div className={styles.heroCta}>
          {isAuthenticated ? (
            <>
              <Button to="/sports" size="large">
                Browse Sports
              </Button>
              <Button to="/live" variant="outline" size="large">
                Live Events
              </Button>
            </>
          ) : (
            <>
              <Button to="/register" size="large">
                Sign Up Now
              </Button>
              <Button to="/login" variant="outline" size="large">
                Login
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={styles.heroBackground}></div>
    </section>
  );
};
