import React from 'react';
import { 
  calculateProfileCompletionScore, 
  getProfileCompletionLevel,
  getProfileCompletionColorClass,
  getProfileCompletionBgClass,
  getProfileCompletionMessage,
  getSuggestionForImprovement
} from '../../../services/attender/ProfileCompletionService';
import { AttenderProfile } from '../../../types/attender/profile';
// コンテキストのインポートを削除（プロップスのみで動作するように変更）

// プロフィール完成度のレベルアイコン
const LevelIcon: React.FC<{ level: number }> = ({ level }) => {
  return (
    <span className="flex">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg 
          key={index} 
          className={`w-4 h-4 ${index < level ? 'text-mono-black' : 'text-mono-light'}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
};

interface ProfileCompletionScoreProps {
  profile?: AttenderProfile | null;
  compact?: boolean;
  showSuggestion?: boolean;
  className?: string;
}

/**
 * プロフィール完成度スコアを表示するコンポーネント
 */
const ProfileCompletionScore: React.FC<ProfileCompletionScoreProps> = ({ 
  profile: propProfile, 
  compact = false,
  showSuggestion = false,
  className = ''
}) => {
  // プロファイルが提供されていない場合はエラーを避けるために空のプロファイルを使用
  const profile = propProfile || null;
  
  // プロファイルがnullの場合は早期リターン
  if (!profile) {
    return (
      <div className={`bg-mono-white rounded-lg shadow p-4 ${className}`}>
        <p className="text-mono-gray-medium text-center">プロフィールが読み込めません</p>
      </div>
    );
  }
  
  // スコアと関連情報を計算
  const score = calculateProfileCompletionScore(profile);
  const level = getProfileCompletionLevel(score);
  const colorClass = getProfileCompletionColorClass(score);
  const bgClass = getProfileCompletionBgClass(score);
  const message = getProfileCompletionMessage(score);
  const suggestion = showSuggestion ? getSuggestionForImprovement(profile) : null;
  
  // コンパクトモードではシンプルな表示
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="text-lg font-bold text-mono-black">{score}%</div>
        <LevelIcon level={level} />
      </div>
    );
  }

  // 通常モードでは詳細な表示
  return (
    <div className={`bg-mono-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-mono-black">プロフィール完成度</h3>
        <span className="px-2 py-1 rounded-full text-xs bg-mono-lighter text-mono-dark">
          レベル {level}
        </span>
      </div>
      
      <div className="flex items-center mb-2">
        <span className="text-2xl font-bold mr-2 text-mono-black">{score}%</span>
        <LevelIcon level={level} />
      </div>
      
      {/* プログレスバー */}
      <div className="w-full h-2 bg-mono-light rounded-full mb-2">
        <div
          className="h-2 rounded-full bg-mono-black"
          style={{ width: `${score}%` }}
        ></div>
      </div>
      
      <p className="text-sm text-mono-gray-medium mb-2">{message}</p>
      
      {suggestion && (
        <div className="mt-2 p-2 bg-mono-lighter text-mono-dark text-sm rounded">
          <span className="font-semibold">次のステップ:</span> {suggestion}
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionScore;
