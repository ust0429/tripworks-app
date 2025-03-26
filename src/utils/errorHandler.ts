/**
 * エラーハンドリングユーティリティ
 * 
 * アプリケーション全体でのエラー処理を一元化するためのユーティリティ関数群
 */

// エラー情報の型定義
export interface ErrorInfo {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, any>;
  timestamp?: Date;
  isNetworkError?: boolean;
  isValidationError?: boolean;
  isAuthError?: boolean;
}

// API エラーレスポンスの型定義
export interface ApiErrorResponse {
  status?: number;
  message?: string;
  errors?: Array<{
    code?: string;
    field?: string;
    message: string;
  }>;
  error?: string;
}

/**
 * エラーを標準化された形式に変換する
 * 
 * @param error 処理するエラー (Error, string, ApiErrorResponse など)
 * @param defaultMessage エラーメッセージが取得できない場合のデフォルトメッセージ
 * @returns 標準化されたエラー情報
 */
export const handleError = (
  error: unknown,
  defaultMessage = '予期せぬエラーが発生しました'
): ErrorInfo => {
  // 現在のタイムスタンプ
  const timestamp = new Date();
  
  // 既にErrorInfoの場合はそのまま返す（タイムスタンプを更新）
  if (typeof error === 'object' && error !== null && 'message' in error && 'isNetworkError' in error) {
    return { ...(error as ErrorInfo), timestamp };
  }
  
  // Error オブジェクトの場合
  if (error instanceof Error) {
    // ネットワークエラーかどうかを判定
    const isNetworkError = error.name === 'NetworkError' || 
                           error.message.includes('network') || 
                           error.message.includes('Network') ||
                           error.message.includes('Failed to fetch') ||
                           error.message.includes('OFFLINE');
    
    // 認証エラーかどうかを判定
    const isAuthError = error.message.includes('401') || 
                        error.message.includes('unauthorized') || 
                        error.message.includes('Unauthorized') ||
                        error.message.includes('Authentication failed') ||
                        error.message.includes('token');
    
    // バリデーションエラーかどうかを判定
    const isValidationError = error.message.includes('validation') || 
                             error.message.includes('Validation') ||
                             error.message.includes('invalid') ||
                             error.message.includes('Invalid') ||
                             error.message.includes('required');
    
    return {
      message: error.message,
      code: (error as any).code,
      details: (error as any).details,
      timestamp,
      isNetworkError,
      isAuthError,
      isValidationError
    };
  }
  
  // 文字列の場合
  if (typeof error === 'string') {
    return {
      message: error,
      timestamp
    };
  }
  
  // API エラーレスポンスの場合
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiErrorResponse;
    
    // フィールドエラーの場合
    if (apiError.errors && apiError.errors.length > 0) {
      const firstError = apiError.errors[0];
      return {
        message: firstError.message || apiError.message || defaultMessage,
        code: firstError.code,
        field: firstError.field,
        details: { 
          status: apiError.status,
          errors: apiError.errors 
        },
        timestamp,
        isValidationError: true
      };
    }
    
    // 単一エラーメッセージの場合
    if (apiError.message || apiError.error) {
      return {
        message: apiError.message || apiError.error || defaultMessage,
        details: { status: apiError.status },
        timestamp,
        isAuthError: apiError.status === 401 || apiError.status === 403
      };
    }
  }
  
  // その他の場合はデフォルトエラー
  return {
    message: defaultMessage,
    timestamp,
    details: { originalError: error }
  };
};

/**
 * エラーをコンソールにログ出力（開発用）
 */
export const logError = (error: unknown, context?: string): ErrorInfo => {
  const processedError = handleError(error);
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      `%c[ERROR]${context ? ` [${context}]` : ''}`,
      'color: red; font-weight: bold',
      processedError.message,
      processedError
    );
  } else {
    // 本番環境では最小限のログのみ
    console.error(`Error${context ? ` in ${context}` : ''}: ${processedError.message}`);
  }
  
  return processedError;
};

/**
 * エラーの種類に応じたユーザーフレンドリーなメッセージを生成
 */
export const getUserFriendlyErrorMessage = (error: ErrorInfo): string => {
  // ネットワークエラー
  if (error.isNetworkError) {
    return 'ネットワーク接続に問題があります。インターネット接続を確認してください。';
  }
  
  // 認証エラー
  if (error.isAuthError) {
    return 'セッションが期限切れになりました。再度ログインしてください。';
  }
  
  // バリデーションエラー
  if (error.isValidationError) {
    if (error.field) {
      return `入力内容に問題があります：${error.field}`;
    }
    return '入力内容に問題があります。入力項目を確認してください。';
  }
  
  // デフォルトメッセージ
  return error.message || '予期せぬエラーが発生しました。しばらく経ってからもう一度お試しください。';
};

/**
 * 技術的なエラーをビジネスレベルのエラーメッセージに変換
 */
export const getBusinessErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'USER_NOT_FOUND': 'ユーザーが見つかりません。',
    'INVALID_CREDENTIALS': 'メールアドレスまたはパスワードが正しくありません。',
    'EMAIL_ALREADY_EXISTS': 'このメールアドレスは既に登録されています。',
    'INSUFFICIENT_PERMISSIONS': 'この操作を行う権限がありません。',
    'SERVICE_UNAVAILABLE': 'サービスが一時的に利用できません。しばらく経ってからもう一度お試しください。',
    'INVALID_REQUEST': 'リクエストが無効です。入力内容を確認してください。',
    'VALIDATION_ERROR': '入力内容に問題があります。入力項目を確認してください。',
    'PAYMENT_REQUIRED': 'お支払い情報を更新してください。',
    'RESOURCE_NOT_FOUND': 'リクエストされたリソースが見つかりません。',
    'TOO_MANY_REQUESTS': 'リクエスト回数が多すぎます。しばらく経ってからもう一度お試しください。',
    'INTERNAL_SERVER_ERROR': 'サーバーエラーが発生しました。しばらく経ってからもう一度お試しください。'
  };
  
  return errorMessages[errorCode] || '予期せぬエラーが発生しました。しばらく経ってからもう一度お試しください。';
};

/**
 * ValidationErrors オブジェクトからユーザーフレンドリーなメッセージのリストを取得
 */
export const getValidationErrorMessages = (errors: Record<string, string>, fieldNames?: Record<string, string>): string[] => {
  return Object.entries(errors).map(([field, message]) => {
    const friendlyFieldName = fieldNames ? (fieldNames[field] || field) : field;
    return `${friendlyFieldName}: ${message}`;
  });
};

/**
 * エラー監視サービスにエラーを報告（実際の実装は環境に依存）
 */
export const reportError = (error: unknown, context?: string): void => {
  const processedError = handleError(error);
  
  // 開発環境ではコンソールに出力のみ
  if (process.env.NODE_ENV !== 'production') {
    logError(processedError, context);
    return;
  }
  
  // 本番環境では実際のエラー監視サービスに送信
  // 例：Sentry, LogRocket などの実装をここに追加
  try {
    // エラー監視サービスの呼び出し例
    // if (window.errorReportingService) {
    //   window.errorReportingService.captureException(processedError, {
    //     tags: { context },
    //     extra: processedError.details
    //   });
    // }
    
    // 代わりにローカルストレージにエラーログを保存（デモ用）
    const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    errorLogs.push({
      ...processedError,
      timestamp: new Date().toISOString(),
      context
    });
    
    // 最大10件のエラーログを保持
    if (errorLogs.length > 10) {
      errorLogs.shift(); // 最も古いエラーを削除
    }
    
    localStorage.setItem('error_logs', JSON.stringify(errorLogs));
  } catch (reportingError) {
    // エラー報告自体が失敗した場合は、コンソールにのみ出力
    console.error('Failed to report error:', reportingError);
  }
};