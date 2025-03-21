/**
 * react-i18nextのモック
 * 実際のライブラリなしでビルドするためのモック
 */

// useTranslationのモック
export const useTranslation = (namespace?: string | string[]) => {
  return {
    t: (key: string, options?: any) => {
      // キーをそのまま返すシンプルな実装
      if (options && typeof options === 'object') {
        let result = key;
        // 簡易的な変数置換
        Object.keys(options).forEach(optionKey => {
          result = result.replace(`{{${optionKey}}}`, options[optionKey]);
        });
        return result;
      }
      return key;
    },
    i18n: {
      language: 'ja',
      changeLanguage: (lng: string) => Promise.resolve(),
    },
    ready: true
  };
};

// 他のi18n関連機能も必要に応じて追加
