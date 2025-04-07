import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-selector">
      <button 
        className={`language-btn ${i18n.language === 'es' ? 'active' : ''}`} 
        onClick={() => changeLanguage('es')}
      >
        {t('common.spanish')}
      </button>
      <span className="language-divider">|</span>
      <button 
        className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`} 
        onClick={() => changeLanguage('en')}
      >
        {t('common.english')}
      </button>
    </div>
  );
};

export default LanguageSelector;
