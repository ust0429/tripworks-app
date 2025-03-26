/**
 * クラス名を結合するためのユーティリティ関数
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
