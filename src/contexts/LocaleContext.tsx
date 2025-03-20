import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales, LocaleKey, LocaleStrings } from '../locales';

// 言語設定の型
type CurrencyCode = 'JPY' | 'USD' | 'EUR' | 'GBP';

interface LocaleContextType {
  locale: LocaleKey;
  setLocale: (locale: LocaleKey) => void;
  t: (key: string) => string;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
}

// デフォルト値
const defaultLocale: LocaleKey = 'ja';
const defaultCurrency: CurrencyCode = 'JPY';

// コンテキストの作成
export const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: () => '',
  currency: defaultCurrency,
  setCurrency: () => {},
  formatCurrency: () => '',
});

// Hook
export const useLocale = () => useContext(LocaleContext);

interface LocaleProviderProps {
  children: ReactNode;
}

// プロバイダーコンポーネント
export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  // ブラウザの言語設定を取得
  const getBrowserLocale = (): LocaleKey => {
    const browserLocale = navigator.language.split('-')[0];
    return (browserLocale in locales ? browserLocale : defaultLocale) as LocaleKey;
  };

  // 言語と通貨の状態
  const [locale, setLocale] = useState<LocaleKey>(() => {
    const savedLocale = localStorage.getItem('locale');
    return (savedLocale && savedLocale in locales) 
      ? savedLocale as LocaleKey 
      : getBrowserLocale();
  });

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const savedCurrency = localStorage.getItem('currency');
    return (savedCurrency as CurrencyCode) || defaultCurrency;
  });

  // 言語変更時にローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  // 通貨変更時にローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // 翻訳関数
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = locales[locale];

    for (const k of keys) {
      if (value && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return value;
  };

  // 通貨フォーマット関数
  const formatCurrency = (amount: number): string => {
    const currencySymbol = t(`currency.${currency}`);
    
    // 通貨によってフォーマットを変更
    switch (currency) {
      case 'JPY':
        return `${currencySymbol}${Math.round(amount).toLocaleString()}`;
      default:
        return `${currencySymbol}${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    }
  };

  const value = {
    locale,
    setLocale,
    t,
    currency,
    setCurrency,
    formatCurrency,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};
