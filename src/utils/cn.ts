import { clsx, type ClassValue } from 'clsx';

/**
 * tailwind-mergeが利用できないため、簡易的な実装を提供
 * 実際のプロジェクトでは「npm install tailwind-merge」でインストールし、
 * 「import { twMerge } from 'tailwind-merge';」を使用してください
 */
const twMerge = (input: string): string => input;

/**
 * クラス名を結合するユーティリティ関数
 * clsxで複数のクラス名を結合し、(あれば)tailwind-mergeでTailwindのクラス名を最適化
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
