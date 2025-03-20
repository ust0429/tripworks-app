import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';

interface CurrencySelectorProps {
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ className = '' }) => {
  const { currency, setCurrency, t } = useLocale();

  const currencies = [
    { code: 'JPY', name: '日本円 (JPY)' },
    { code: 'USD', name: 'US Dollar (USD)' },
    { code: 'EUR', name: 'Euro (EUR)' },
    { code: 'GBP', name: 'British Pound (GBP)' },
  ];

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as any);
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label htmlFor="currency-selector" className="text-sm font-medium text-gray-700">
        {t('settings.currency')}
      </label>
      <select
        id="currency-selector"
        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={currency}
        onChange={handleCurrencyChange}
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
