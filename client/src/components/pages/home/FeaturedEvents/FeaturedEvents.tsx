import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../../../../services/event.service';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { ImageCollage } from '../../../common/ImageCollage/ImageCollage';
import styles from './FeaturedEvents.module.css';

interface Event {
  id: string;
  name: string;
  startTime: string;
  status: string;
  sport?: {
    name: string;
    slug: string;
  };
  participants: {
    id: string;
    name: string;
    odds: number;
  }[];
}

export const FeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  const collageItems = [
    {
      image: 'images/football10.png',
      title: t('home.featuredEvents.football'),
      description: t('home.featuredEvents.footballDesc'),
      link: '/sports/football'
    },
    {
      image: 'images/basketball2.png',
      title: t('home.featuredEvents.basketball'),
      description: t('home.featuredEvents.basketballDesc'),
      link: '/sports/basketball'
    },
    {
      image: 'images/tennis6.png',
      title: t('home.featuredEvents.tennis'),
      description: t('home.featuredEvents.tennisDesc'),
      link: '/sports/tennis'
    },
    {
      image: 'images/baseball2.png',
      title: t('home.featuredEvents.baseball'),
      description: t('home.featuredEvents.baseballDesc'),
      link: '/sports/baseball'
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await getEvents({ limit: 6 });
        if (response.success && response.data) {
          setEvents(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const addToBetslip = (event: Event, participant: any) => {
    // This would normally be handled with a context or state management
    // For demo purposes, we're using localStorage
    const betslipItem = {
      id: `${event.id}-${participant.id}`,
      event: event.name,
      selection: participant.name,
      odds: participant.odds,
    };

    const storedBetslip = localStorage.getItem('betslip');
    let betslip = [];

    if (storedBetslip) {
      try {
        betslip = JSON.parse(storedBetslip);
        // Check if this selection is already in the betslip
        const existingIndex = betslip.findIndex((item: any) => item.id === betslipItem.id);
        if (existingIndex !== -1) {
          // Remove it if it exists
          betslip.splice(existingIndex, 1);
        } else {
          // Add it if it doesn't
          betslip.push(betslipItem);
        }
      } catch (error) {
        console.error('Error parsing betslip:', error);
        betslip = [betslipItem];
      }
    } else {
      betslip = [betslipItem];
    }

    localStorage.setItem('betslip', JSON.stringify(betslip));

    // Force a re-render of the sidebar
    window.dispatchEvent(new Event('storage'));
  };

  if (isLoading) {
    return <div>{t('home.loadingFeaturedEvents')}</div>;
  }

  if (events.length === 0) {
    return <div>{t('home.noFeaturedEvents')}</div>;
  }

  return (
    <section className={styles.featuredEvents}>
      <h2 className={styles.title}>{t('home.featuredEvents')}</h2>

      <ImageCollage items={collageItems} />

      <div className={styles.eventsGrid}>
        {events.map(event => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.eventHeader}>
              <h3 className={styles.eventTitle}>{event.name}</h3>
              <span className={`${styles.eventStatus} ${styles[event.status.toLowerCase()]}`}>
                {event.status}
              </span>
            </div>
            <div className={styles.eventBody}>
              <div className={styles.eventInfo}>
                <div className={styles.eventTime}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {formatDate(event.startTime)}
                </div>
                <div className={styles.eventSport}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    <path d="M2 12h20"/>
                  </svg>
                  <Link to={`/sports/${event.sport?.slug}`}>
                    {event.sport?.name}
                  </Link>
                </div>
              </div>

              <div className={styles.participants}>
                {event.participants.map(participant => (
                  <div key={participant.id} className={styles.participant}>
                    <span className={styles.participantName}>{participant.name}</span>
                    <button
                      className={styles.oddsButton}
                      onClick={() => addToBetslip(event, participant)}
                    >
                      {participant.odds.toFixed(2)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
