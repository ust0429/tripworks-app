import React, { memo } from 'react';

interface MemoizedFormSectionProps {
  children: React.ReactNode;
  dependencies?: any[];
  sectionName?: string;
}

/**
 * フォームセクションをメモ化するコンポーネント
 * 特定の依存値が変更された時のみ再レンダリングを行い、パフォーマンスを最適化
 */
const MemoizedFormSection: React.FC<MemoizedFormSectionProps> = memo(
  ({ children, sectionName }) => {
    // パフォーマンス測定用（開発環境のみ）
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        console.info(`[MemoizedFormSection] ${sectionName || 'unnamed'} がレンダリングされました`);
      }
    });
    
    return <>{children}</>;
  },
  (prevProps, nextProps) => {
    if (!prevProps.dependencies || !nextProps.dependencies) {
      // 依存配列がない場合は常に再レンダリング
      return false;
    }
    
    if (prevProps.dependencies.length !== nextProps.dependencies.length) {
      // 依存配列の長さが異なる場合は再レンダリング
      return false;
    }
    
    // 依存配列の各要素を浅い比較
    for (let i = 0; i < prevProps.dependencies.length; i++) {
      if (prevProps.dependencies[i] !== nextProps.dependencies[i]) {
        return false;
      }
    }
    
    // 全ての依存が同じなら再レンダリングしない
    return true;
  }
);

// 開発時のデバッグを容易にするための表示名
MemoizedFormSection.displayName = 'MemoizedFormSection';

export default MemoizedFormSection;