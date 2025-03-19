/**
 * チップ機能の型定義
 */

export type TipAmount = 500 | 1000 | 2000 | 3000 | 'custom';

export interface TipData {
  bookingId: string;
  attenderId: string;
  amount: number;
  message?: string;
  anonymous: boolean;
}

export interface TipHistory {
  id: string;
  bookingId: string;
  attenderId: string;
  attenderName: string;
  amount: number;
  message?: string;
  anonymous: boolean;
  createdAt: string; // ISO日付文字列
}

// チップが送れる状態の定義
export type TipableState = 'before' | 'during' | 'after' | 'anytime';

// チップオプション設定
export interface TipOptions {
  enabled: boolean;
  suggestedAmounts: number[];
  minCustomAmount: number;
  maxCustomAmount: number;
  allowAnonymous: boolean;
  allowMessage: boolean;
  tipableState: TipableState;
}
