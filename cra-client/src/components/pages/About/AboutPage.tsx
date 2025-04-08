import React from 'react';
import { useTranslation } from 'react-i18next';
import './AboutPage.css';

// Define a type for the t function
type TFunction = (key: string, options?: any) => string;

const AboutPage: React.FC = () => {
  const { t } = useTranslation() as { t: TFunction };
  return (
    <div className="about-page">
      <div className="page-container">
        <h1 className="about-main-title">{t('about.title')}</h1>
        <section className="about-section">
          <h2>{t('about.ourStory.title')}</h2>
          <p>
            {t('about.ourStory.paragraph1')}
          </p>
          <p>
            {t('about.ourStory.paragraph2')}
          </p>
        </section>

        <section className="about-section">
          <h2>{t('about.ourValues.title')}</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>{t('about.ourValues.transparency.title')}</h3>
              <p>
                {t('about.ourValues.transparency.description')}
              </p>
            </div>

            <div className="value-card">
              <h3>{t('about.ourValues.fairness.title')}</h3>
              <p>
                {t('about.ourValues.fairness.description')}
              </p>
            </div>

            <div className="value-card">
              <h3>{t('about.ourValues.responsibility.title')}</h3>
              <p>
                {t('about.ourValues.responsibility.description')}
              </p>
            </div>

            <div className="value-card">
              <h3>{t('about.ourValues.innovation.title')}</h3>
              <p>
                {t('about.ourValues.innovation.description')}
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>{t('about.contactUs.title')}</h2>
          <p>
            {t('about.contactUs.description')}
          </p>
          <div className="contact-info">
            <p><strong>{t('about.contactUs.email')}:</strong> support@sbp.com</p>
            <p><strong>{t('about.contactUs.phone')}:</strong> +1 (234) 567-890</p>
            <p><strong>{t('about.contactUs.address')}:</strong> 123 Main Street, Anytown, USA</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
