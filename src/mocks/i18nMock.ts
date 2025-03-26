/**
 * i18next のモックフック
 * 実際のプロジェクトでは react-i18next パッケージをインストールして使用してください
 */

interface TranslationOptions {
  ns?: string;
  defaultValue?: string;
  // countプロパティを許可
  count?: number;
  // dateプロパティを許可
  date?: string;
  // 任意の追加プロパティを許可
  [key: string]: any;
}

interface I18nHook {
  // 翻訳関数
  t: (key: string, options?: TranslationOptions) => string;
  // 言語切り替え関数
  i18n: {
    changeLanguage: (lang: string) => Promise<void>;
    language: string;
  };
}

/**
 * 翻訳キーに対応する簡易的な翻訳テーブル
 */
const translations: Record<string, Record<string, string>> = {
  attender: {
    'profile.basicInfo': '基本情報',
    'profile.displayName': '表示名',
    'profile.location': '場所',
    'profile.bio': '自己紹介',
    'profile.expertise': '専門分野',
    'profile.noExpertise': '専門分野が登録されていません',
    'profile.addExpertise': '専門分野を追加',
    'common.save': '保存',
    'common.add': '追加',
    'dashboard.upcomingBookings.people': '参加者数: {{count}}人',
    'dashboard.pastBookings.people': '参加者数: {{count}}人',
    'dashboard.requests.people': '参加者数: {{count}}人',
    'dashboard.metrics.totalReviews': '全{{count}}件のレビュー',
    'experience.detail.maxPeople': '最大{{count}}人まで',
    'experience.detail.lastUpdated': '最終更新日: {{date}}'
  },
  common: {
    'timeAgo.minutes': '{{count}}分前',
    'timeAgo.hours': '{{count}}時間前',
    'timeAgo.days': '{{count}}日前'
  }
};

/**
 * 翻訳用のモックフック
 */
export const useTranslation = (namespace: string | string[] = 'common'): I18nHook => {
  // 文字列配列の場合は最初の要素を使用
  const ns = Array.isArray(namespace) ? namespace[0] : namespace;
  
  const t = (key: string, options?: TranslationOptions): string => {
    // ネームスペースを指定していればそちらを使用
    const useNs = options?.ns || ns;
    
    // キーが存在するか確認
    let translation = '';
    
    // 複数のネームスペースを検索
    if (Array.isArray(useNs)) {
      // 最初に見つかった翻訳を使用
      for (const n of useNs) {
        if (translations[n]?.[key]) {
          translation = translations[n][key];
          break;
        }
      }
    } else {
      translation = translations[useNs]?.[key] || '';
    }
    
    // プレースホルダーの置換
    if (translation && options) {
      // {{key}}形式のプレースホルダーを値で置換
      Object.entries(options).forEach(([k, v]) => {
        if (k !== 'ns' && k !== 'defaultValue') {
          translation = translation.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }
      });
    }
    
    return translation || options?.defaultValue || key;
  };
  
  return {
    t,
    i18n: {
      changeLanguage: async () => {},
      language: 'ja'
    }
  };
};

export default {
  useTranslation
};
