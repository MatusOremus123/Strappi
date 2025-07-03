import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' }
  ];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher">
      <div className="language-dropdown">
        <button 
          className="language-current"
          onClick={() => setIsOpen(!isOpen)}
        >
          {languages.find(lang => lang.code === i18n.language)?.name || 'English'}
        </button>
        {isOpen && (
          <div className="language-options">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSwitcher;