import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Button } from '../../../common/Button/Button';
import { AnimatedBackground } from '../../../common/AnimatedBackground/AnimatedBackground';
import { ImageCarousel } from '../../../common/ImageCarousel/ImageCarousel';
import styles from './Hero.module.css';

export const Hero = () => {
  const { isAuthenticated } = useAuthContext();
  const { t } = useLanguage();

  const carouselSlides = [
    {
      image: 'images/football10.png',
      title: t('home.carousel.football.title'),
      description: t('home.carousel.football.description'),
      buttonText: t('home.carousel.viewEvents'),
      buttonLink: '/sports/football'
    },
    {
      image: 'images/basketball3.png',
      title: t('home.carousel.basketball.title'),
      description: t('home.carousel.basketball.description'),
      buttonText: t('home.carousel.viewEvents'),
      buttonLink: '/sports/basketball'
    },
    {
      image: 'images/tennis5.png',
      title: t('home.carousel.tennis.title'),
      description: t('home.carousel.tennis.description'),
      buttonText: t('home.carousel.viewEvents'),
      buttonLink: '/sports/tennis'
    },
    {
      image: 'images/baseball1.png',
      title: t('home.carousel.baseball.title'),
      description: t('home.carousel.baseball.description'),
      buttonText: t('home.carousel.viewEvents'),
      buttonLink: '/sports/baseball'
    }
  ];

  console.log('Rendering Hero with carousel slides:', carouselSlides);

  return (
    <section className={styles.hero}>
      <AnimatedBackground />
      <div className={styles.heroBackground}>
        <ImageCarousel slides={carouselSlides} />
      </div>
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

    </section>
  );
};
