import React from 'react';
import LanguageSelector from './LanguageSelector';
import CurrencySelector from './CurrencySelector';
import { useLocale } from '../../contexts/LocaleContext';

const SettingsScreen: React.FC = () => {
  const { t } = useLocale();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('settings.account')}</h2>
        {/* アカウント設定項目 */}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('settings.notifications')}</h2>
        {/* 通知設定項目 */}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('settings.privacy')}</h2>
        {/* プライバシー設定項目 */}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('settings.language')}</h2>
        <div className="space-y-4">
          <LanguageSelector />
          <CurrencySelector className="mt-4" />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('settings.payment')}</h2>
        {/* 支払い方法設定項目 */}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('settings.help')}</h2>
        <button className="text-indigo-600 hover:text-indigo-800">
          {t('support.faq')}
        </button>
        <button className="text-indigo-600 hover:text-indigo-800 block mt-2">
          {t('support.contact')}
        </button>
        <button className="text-indigo-600 hover:text-indigo-800 block mt-2">
          {t('support.chat')}
        </button>
      </div>
      
      <button className="w-full py-3 px-4 mt-6 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md shadow-sm">
        {t('settings.logout')}
      </button>
    </div>
  );
};

export default SettingsScreen;
