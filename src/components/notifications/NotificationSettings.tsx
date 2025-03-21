import React, { useState, useEffect } from 'react';
import { NotificationType, NotificationSettings as NotificationSettingsType } from '../../types/notification';
import notificationService from '../../services/notificationService';
import pushNotificationService from '../../services/push/pushNotificationService';
import emailNotificationService from '../../services/email/emailNotificationService';

interface NotificationSettingsProps {
  userId: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
  const [settings, setSettings] = useState<NotificationSettingsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showPushPermission, setShowPushPermission] = useState<boolean>(false);
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [pushPermission, setPushPermission] = useState<string>('default');

  useEffect(() => {
    fetchSettings();
    checkPushNotificationSupport();
  }, [userId]);

  // プッシュ通知のサポート状況をチェック
  const checkPushNotificationSupport = () => {
    const isSupported = 'Notification' in window;
    setIsPushSupported(isSupported);
    
    if (isSupported) {
      setPushPermission(Notification.permission);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotificationSettings(userId);
      setSettings(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notification settings');
      console.error('Error fetching notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      
      // 通知設定の保存
      await notificationService.updateNotificationSettings(userId, settings);
      
      // メール配信設定の更新
      if (settings.enableEmail) {
        // カテゴリーごとのメール設定を取得
        const emailPreferences: Partial<Record<NotificationType, boolean>> = {};
        
        Object.entries(settings.categories).forEach(([type, options]) => {
          emailPreferences[type as NotificationType] = options.email;
        });
        
        await emailNotificationService.updateEmailPreferences(userId, emailPreferences);
      }
      
      // プッシュ通知が有効になっている場合
      if (settings.enablePush && isPushSupported) {
        // Notification APIの許可状態をチェック
        if (Notification.permission === 'default') {
          setShowPushPermission(true);
        } else if (Notification.permission === 'granted') {
          // サービスワーカーの登録（プッシュ通知用）
          await pushNotificationService.registerServiceWorker();
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError('設定の保存に失敗しました');
      console.error('Error saving notification settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMasterSwitch = (key: 'enablePush' | 'enableEmail' | 'enableInApp' | 'muteAll') => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleToggleCategoryOption = (
    type: NotificationType,
    option: 'push' | 'email' | 'inApp'
  ) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [type]: {
          ...settings.categories[type],
          [option]: !settings.categories[type][option],
        },
      },
    });
  };

  // 通知分析ダッシュボードへ移動
  const navigateToAnalytics = () => {
    window.location.href = '/admin/notifications/analytics';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-pulse w-8 h-8 rounded-full bg-indigo-400 opacity-75"></div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-500">
        <p>{error}</p>
        <button 
          onClick={fetchSettings}
          className="mt-4 px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">通知設定</h3>
        <p className="mt-1 text-sm text-gray-500">
          echoからの通知の受け取り方法をカスタマイズできます
        </p>
      </div>
      
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-base font-medium text-gray-900">すべての通知をミュート</h4>
            <p className="text-sm text-gray-500">
              一時的にすべての通知をミュートします
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              name="muteAll"
              id="muteAll"
              checked={settings.muteAll}
              onChange={() => handleToggleMasterSwitch('muteAll')}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="muteAll"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                settings.muteAll ? 'bg-indigo-500' : 'bg-gray-300'
              }`}
            ></label>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-base font-medium text-gray-900">通知チャネル</h4>
          
          {/* 管理者向け分析ダッシュボード */}
          {userId === 'admin' && (
            <button
              onClick={navigateToAnalytics}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              通知分析
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">プッシュ通知</p>
              <p className="text-xs text-gray-500">
                デバイスで通知を受け取る
              </p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input
                type="checkbox"
                name="enablePush"
                id="enablePush"
                checked={settings.enablePush}
                onChange={() => handleToggleMasterSwitch('enablePush')}
                disabled={settings.muteAll}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer disabled:opacity-50"
              />
              <label
                htmlFor="enablePush"
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                  settings.enablePush && !settings.muteAll ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
              ></label>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">メール通知</p>
              <p className="text-xs text-gray-500">
                メールで通知を受け取る
              </p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input
                type="checkbox"
                name="enableEmail"
                id="enableEmail"
                checked={settings.enableEmail}
                onChange={() => handleToggleMasterSwitch('enableEmail')}
                disabled={settings.muteAll}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer disabled:opacity-50"
              />
              <label
                htmlFor="enableEmail"
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                  settings.enableEmail && !settings.muteAll ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
              ></label>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">アプリ内通知</p>
              <p className="text-xs text-gray-500">
                アプリ内で通知を受け取る
              </p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input
                type="checkbox"
                name="enableInApp"
                id="enableInApp"
                checked={settings.enableInApp}
                onChange={() => handleToggleMasterSwitch('enableInApp')}
                disabled={settings.muteAll}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer disabled:opacity-50"
              />
              <label
                htmlFor="enableInApp"
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                  settings.enableInApp && !settings.muteAll ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
              ></label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 border-b border-gray-200">
        <h4 className="text-base font-medium text-gray-900 mb-4">通知カテゴリー</h4>
        
        <div className="divide-y divide-gray-200">
          {Object.values(NotificationType).map((type) => (
            <div key={type} className="py-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700 capitalize">{type.toLowerCase()} Notifications</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 ml-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${type}-push`}
                    checked={settings.categories[type].push}
                    onChange={() => handleToggleCategoryOption(type, 'push')}
                    disabled={!settings.enablePush || settings.muteAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor={`${type}-push`} className="ml-2 text-xs text-gray-600">
                    Push
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${type}-email`}
                    checked={settings.categories[type].email}
                    onChange={() => handleToggleCategoryOption(type, 'email')}
                    disabled={!settings.enableEmail || settings.muteAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor={`${type}-email`} className="ml-2 text-xs text-gray-600">
                    Email
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${type}-inApp`}
                    checked={settings.categories[type].inApp}
                    onChange={() => handleToggleCategoryOption(type, 'inApp')}
                    disabled={!settings.enableInApp || settings.muteAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor={`${type}-inApp`} className="ml-2 text-xs text-gray-600">
                    In-App
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* プッシュ通知の許可リクエスト */}
      {showPushPermission && isPushSupported && (
        <div className="px-6 py-4 bg-blue-50 border-t border-b border-blue-100">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                このアプリからのプッシュ通知を受け取るには、通知を許可してください。
              </p>
              <div className="mt-3 flex md:mt-0 md:ml-6">
                <button
                  onClick={async () => {
                    const permission = await pushNotificationService.requestPermission();
                    if (permission) {
                      // サービスワーカーの登録
                      await pushNotificationService.registerServiceWorker();
                      // トークン登録などの処理
                      setPushPermission('granted');
                    } else {
                      setPushPermission('denied');
                    }
                    setShowPushPermission(false);
                  }}
                  className="text-sm font-medium text-blue-700 hover:text-blue-600"
                >
                  許可する
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowPushPermission(false)}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="px-6 py-4 flex items-center justify-between">
        {saveSuccess && (
          <div className="text-sm text-green-600">
            設定を保存しました！
          </div>
        )}
        {error && settings && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="flex-grow"></div>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              保存中...
            </>
          ) : (
            '設定を保存'
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
