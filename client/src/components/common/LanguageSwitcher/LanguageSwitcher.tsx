import { useLanguage } from '../../../contexts/LanguageContext';
import { Language } from '../../../locales';
import styles from './LanguageSwitcher.module.css';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.languageButton} ${language === 'es' ? styles.activeLanguage : ''}`}
        onClick={() => handleLanguageChange('es')}
        aria-label="Cambiar a Español"
      >
        <span className={styles.languageText}>ES</span>
      </button>
      <button
        className={`${styles.languageButton} ${language === 'en' ? styles.activeLanguage : ''}`}
        onClick={() => handleLanguageChange('en')}
        aria-label="Switch to English"
      >
        <span className={styles.languageText}>EN</span>
      </button>
    </div>
  );
};
