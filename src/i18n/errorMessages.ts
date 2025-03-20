/**
 * エラーメッセージの多言語対応
 * 
 * アプリケーション全体で使用するエラーメッセージを一元管理し、
 * 多言語対応を可能にします。
 */

// 現在サポートする言語
export type SupportedLanguage = 'ja' | 'en';

// エラーコードの型定義
export type ErrorCode = 
  // 一般的なエラー
  | 'generic_error'
  | 'network_error'
  | 'timeout_error'
  | 'server_error'
  | 'unauthorized'
  | 'not_found'
  | 'validation_error'
  
  // 認証関連のエラー
  | 'auth_failed'
  | 'invalid_credentials'
  | 'token_expired'
  | 'account_locked'
  
  // 入力検証エラー
  | 'required_field'
  | 'invalid_format'
  | 'invalid_email'
  | 'invalid_phone'
  | 'password_too_weak'
  | 'passwords_not_match'
  
  // ファイルアップロード関連のエラー
  | 'upload_failed'
  | 'file_too_large'
  | 'file_type_not_supported'
  | 'too_many_files'
  | 'image_resolution_too_low'
  
  // アテンダー申請関連のエラー
  | 'identification_expired'
  | 'identification_missing'
  | 'insufficient_experience_samples'
  | 'missing_experience_description'
  | 'agreement_required';

// エラーメッセージの型定義
type ErrorMessages = Record<ErrorCode, string>;

// 各言語のエラーメッセージ
const errorMessages: Record<SupportedLanguage, ErrorMessages> = {
  // 日本語のエラーメッセージ
  ja: {
    // 一般的なエラー
    generic_error: 'エラーが発生しました。もう一度お試しください。',
    network_error: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
    timeout_error: 'リクエストがタイムアウトしました。後ほど再度お試しください。',
    server_error: 'サーバーエラーが発生しました。しばらく経ってからもう一度お試しください。',
    unauthorized: '認証に失敗しました。再度ログインしてください。',
    not_found: '要求されたリソースが見つかりませんでした。',
    validation_error: '入力内容に誤りがあります。',
    
    // 認証関連のエラー
    auth_failed: '認証に失敗しました。',
    invalid_credentials: 'メールアドレスまたはパスワードが間違っています。',
    token_expired: 'セッションの有効期限が切れました。再度ログインしてください。',
    account_locked: 'アカウントがロックされています。サポートにお問い合わせください。',
    
    // 入力検証エラー
    required_field: 'この項目は必須です。',
    invalid_format: '入力形式が正しくありません。',
    invalid_email: '有効なメールアドレスを入力してください。',
    invalid_phone: '有効な電話番号を入力してください。',
    password_too_weak: 'パスワードが弱すぎます。英数字と記号を含む8文字以上のパスワードを設定してください。',
    passwords_not_match: 'パスワードが一致しません。',
    
    // ファイルアップロード関連のエラー
    upload_failed: 'ファイルのアップロードに失敗しました。',
    file_too_large: 'ファイルサイズが大きすぎます。',
    file_type_not_supported: '対応していないファイル形式です。',
    too_many_files: 'アップロードできるファイル数の上限に達しました。',
    image_resolution_too_low: '画像の解像度が低すぎます。',
    
    // アテンダー申請関連のエラー
    identification_expired: '身分証明書の有効期限が切れています。',
    identification_missing: '身分証明書の情報が不足しています。',
    insufficient_experience_samples: '体験サンプルが不足しています。少なくとも1つの体験サンプルを追加してください。',
    missing_experience_description: '体験の説明が不足しています。',
    agreement_required: '利用規約への同意が必要です。'
  },
  
  // 英語のエラーメッセージ
  en: {
    // 一般的なエラー
    generic_error: 'An error occurred. Please try again.',
    network_error: 'A network error occurred. Please check your internet connection.',
    timeout_error: 'The request timed out. Please try again later.',
    server_error: 'A server error occurred. Please try again later.',
    unauthorized: 'Authentication failed. Please log in again.',
    not_found: 'The requested resource was not found.',
    validation_error: 'There are errors in your input.',
    
    // 認証関連のエラー
    auth_failed: 'Authentication failed.',
    invalid_credentials: 'Email or password is incorrect.',
    token_expired: 'Your session has expired. Please log in again.',
    account_locked: 'Your account is locked. Please contact support.',
    
    // 入力検証エラー
    required_field: 'This field is required.',
    invalid_format: 'Invalid format.',
    invalid_email: 'Please enter a valid email address.',
    invalid_phone: 'Please enter a valid phone number.',
    password_too_weak: 'Password is too weak. Use at least 8 characters including letters, numbers, and symbols.',
    passwords_not_match: 'Passwords do not match.',
    
    // ファイルアップロード関連のエラー
    upload_failed: 'File upload failed.',
    file_too_large: 'File is too large.',
    file_type_not_supported: 'File type is not supported.',
    too_many_files: 'Maximum number of files reached.',
    image_resolution_too_low: 'Image resolution is too low.',
    
    // アテンダー申請関連のエラー
    identification_expired: 'Identification document has expired.',
    identification_missing: 'Identification document information is missing.',
    insufficient_experience_samples: 'Insufficient experience samples. Please add at least one experience sample.',
    missing_experience_description: 'Experience description is missing.',
    agreement_required: 'You must agree to the terms and conditions.'
  }
};

/**
 * 指定した言語とエラーコードに対応するエラーメッセージを取得する
 * 
 * @param code エラーコード 
 * @param lang 言語コード（デフォルト: 'ja'）
 * @returns エラーメッセージ
 */
export function getErrorMessage(code: ErrorCode, lang: SupportedLanguage = 'ja'): string {
  // 対応する言語が存在しない場合は日本語をフォールバックとして使用
  const language = errorMessages[lang] ? lang : 'ja';
  
  // 対応するエラーコードが存在しない場合は一般的なエラーメッセージを返す
  return errorMessages[language][code] || errorMessages[language].generic_error;
}

/**
 * プレースホルダーを含むエラーメッセージを生成する
 * 例: formatErrorMessage('file_too_large', { size: '5MB' }, 'ja')
 * 
 * @param code エラーコード
 * @param params パラメータオブジェクト 
 * @param lang 言語コード（デフォルト: 'ja'）
 * @returns フォーマットされたエラーメッセージ
 */
export function formatErrorMessage(
  code: ErrorCode, 
  params: Record<string, string | number> = {}, 
  lang: SupportedLanguage = 'ja'
): string {
  let message = getErrorMessage(code, lang);
  
  // パラメータを置換
  Object.entries(params).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
  });
  
  return message;
}

export default {
  getErrorMessage,
  formatErrorMessage
};
