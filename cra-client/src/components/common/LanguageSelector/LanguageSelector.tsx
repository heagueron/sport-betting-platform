import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

// Define a type for the t function
type TFunction = (key: string, options?: any) => string;

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation() as { i18n: any, t: TFunction };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-selector">
      <button
        className={`language-btn ${i18n.language === 'es' ? 'active' : ''}`}
        onClick={() => changeLanguage('es')}
      >
        ES
      </button>
      <span className="language-divider">|</span>
      <button
        className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;
