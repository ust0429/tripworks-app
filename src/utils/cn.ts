import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * クラス名を結合するユーティリティ関数
 * clsxとtailwind-mergeを組み合わせて、Tailwindのクラス名を効率的に結合します
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
