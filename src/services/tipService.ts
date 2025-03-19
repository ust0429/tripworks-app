import { TipData, TipHistory, TipOptions, TipableState } from '../types/tip';

/**
 * チップデータを送信する
 * @param tipData チップデータ
 * @returns 成功時はtrue、失敗時はfalse
 */
export const sendTip = async (tipData: TipData): Promise<boolean> => {
  try {
    // モック実装（実際の実装ではAPIリクエストを行う）
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 送信データをコンソールに出力
    console.log('チップデータを送信:', tipData);
    
    // 成功を返す
    return true;
  } catch (error) {
    console.error('チップ送信エラー:', error);
    return false;
  }
};

/**
 * 特定の予約におけるチップ設定オプションを取得する
 * @param bookingId 予約ID
 * @returns チップオプション設定
 */
export const getTipOptions = async (bookingId: string): Promise<TipOptions> => {
  try {
    // モック実装（実際の実装ではAPIリクエストを行う）
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ダミーのオプションを返す
    return {
      enabled: true,
      suggestedAmounts: [500, 1000, 2000, 5000],
      minCustomAmount: 100,
      maxCustomAmount: 10000,
      allowAnonymous: true,
      allowMessage: true,
      tipableState: 'anytime' as TipableState
    };
  } catch (error) {
    console.error('チップオプション取得エラー:', error);
    
    // エラー時はデフォルト設定を返す
    return {
      enabled: true,
      suggestedAmounts: [500, 1000, 2000, 3000],
      minCustomAmount: 100,
      maxCustomAmount: 5000,
      allowAnonymous: true,
      allowMessage: true,
      tipableState: 'after' as TipableState
    };
  }
};

/**
 * ユーザーのチップ履歴を取得する
 * @param userId ユーザーID
 * @returns チップ履歴の配列
 */
export const getUserTipHistory = async (userId: string): Promise<TipHistory[]> => {
  try {
    // モック実装（実際の実装ではAPIリクエストを行う）
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // ダミーのチップ履歴を返す
    return [
      {
        id: 'tip-001',
        bookingId: 'booking-001',
        attenderId: 'attender-001',
        attenderName: '山田 太郎',
        amount: 1000,
        message: 'とても素晴らしい体験をありがとうございました！',
        anonymous: false,
        createdAt: '2025-02-15T09:30:00Z'
      },
      {
        id: 'tip-002',
        bookingId: 'booking-002',
        attenderId: 'attender-002',
        attenderName: '佐藤 花子',
        amount: 2000,
        anonymous: true,
        createdAt: '2025-01-20T14:15:00Z'
      }
    ];
  } catch (error) {
    console.error('チップ履歴取得エラー:', error);
    return [];
  }
};

/**
 * アテンダーが特定の予約でチップを受け取れるかどうかを確認する
 * @param attenderId アテンダーID
 * @param bookingId 予約ID
 * @returns チップ受け取り可能な場合はtrue、不可能な場合はfalse
 */
export const canReceiveTip = async (attenderId: string, bookingId: string): Promise<boolean> => {
  try {
    // モック実装（実際の実装ではAPIリクエストを行う）
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // ダミーデータとして常にtrueを返す
    return true;
  } catch (error) {
    console.error('チップ受け取り確認エラー:', error);
    return false;
  }
};
