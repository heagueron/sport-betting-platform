import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Button } from '../../../common/Button/Button';
import styles from './Hero.module.css';

export const Hero = () => {
  const { isAuthenticated } = useAuthContext();
  const { t } = useLanguage();

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{t('home.welcome')}</h1>
        <p className={styles.heroSubtitle}>
          {t('home.subtitle')}
        </p>
        <div className={styles.heroCta}>
          {isAuthenticated ? (
            <>
              <Button to="/sports" size="large">
                {t('home.browseSports')}
              </Button>
              <Button to="/live" variant="outline" size="large">
                {t('home.liveEvents')}
              </Button>
            </>
          ) : (
            <>
              <Button to="/register" size="large">
                {t('home.signUpNow')}
              </Button>
              <Button to="/login" variant="outline" size="large">
                {t('auth.login')}
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={styles.heroBackground}></div>
    </section>
  );
};
