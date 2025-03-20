/**
 * セキュリティ関連のユーティリティ関数
 */

/**
 * 入力文字列をサニタイズする
 * XSS攻撃からの保護のためHTMLタグをエスケープします
 * 
 * @param input サニタイズする文字列
 * @returns サニタイズされた文字列
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * ファイル名を安全にサニタイズする
 * ファイル名に含まれる危険な文字や制御文字を削除します
 * 
 * @param filename サニタイズするファイル名
 * @returns サニタイズされたファイル名
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';
  
  // 危険な文字や制御文字を削除
  return filename
    .replace(/[/\\?%*:|"<>]/g, '_') // 禁止文字をアンダースコアに変換
    .replace(/\.\./g, '') // ディレクトリトラバーサル対策
    .replace(/^\.+|\.+$/g, '') // ドットファイルの防止
    .replace(/\s+/g, '_') // 空白をアンダースコアに変換
    .trim();
};

/**
 * ファイルのMIMEタイプが許可リストに含まれているかチェックする
 * 
 * @param mimeType チェックするMIMEタイプ
 * @param allowedTypes 許可されているMIMEタイプの配列
 * @returns 許可されていればtrue、そうでなければfalse
 */
export const isAllowedMimeType = (
  mimeType: string,
  allowedTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
): boolean => {
  return allowedTypes.includes(mimeType.toLowerCase());
};

/**
 * CSRFトークンを生成する
 * 
 * @returns CSRFトークン
 */
export const generateCsrfToken = (): string => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
};

/**
 * 長文の文字列を切り詰める
 * 
 * @param text 切り詰める文字列
 * @param maxLength 最大文字数
 * @param suffix 切り詰めた場合に末尾に追加する文字列
 * @returns 切り詰められた文字列
 */
export const truncateText = (
  text: string,
  maxLength: number = 100,
  suffix: string = '...'
): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export default {
  sanitizeInput,
  sanitizeFilename,
  isAllowedMimeType,
  generateCsrfToken,
  truncateText
};
