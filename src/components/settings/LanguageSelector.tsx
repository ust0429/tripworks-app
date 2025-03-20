import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import type { LocaleKey } from '../../locales';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { locale, setLocale, t } = useLocale();

  const languages = [
    { code: 'ja', name: '日本語' },
    { code: 'en', name: 'English' },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as LocaleKey);
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label htmlFor="language-selector" className="text-sm font-medium text-gray-700">
        {t('settings.language')}
      </label>
      <select
        id="language-selector"
        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={locale}
        onChange={handleLanguageChange}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
