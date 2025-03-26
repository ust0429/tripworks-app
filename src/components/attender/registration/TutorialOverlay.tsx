import React, { useState } from 'react';
import { FormStatusType } from '../../../types/attender/index';
import { ArrowRight, X, Smartphone, Monitor } from 'lucide-react';

interface TutorialOverlayProps {
  formStatus?: FormStatusType;
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkipAll?: () => void;
}

/**
 * アテンダー登録プロセスのチュートリアルオーバーレイ
 * 
 * 段階的な登録プロセスのガイダンスを提供する
 */
const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  formStatus = 'required',
  isVisible,
  onClose,
  onComplete,
  onSkipAll = () => {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // フォーム状態に応じたステップ数
  const totalSteps = formStatus === 'required' ? 3 : 5;
  
  // 次のステップへ進む
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  // 前のステップへ戻る
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // デバイスタイプに応じたアイコンを取得
  const getDeviceIcon = () => {
    return isMobile ? (
      <Smartphone className="w-5 h-5 mr-2" />
    ) : (
      <Monitor className="w-5 h-5 mr-2" />
    );
  };
  
  // 基本登録モード用のチュートリアルコンテンツ
  const getBasicRegistrationTutorial = () => {
    switch (currentStep) {
      case 1:
        // 非表示の場合は何も描画しない
  if (!isVisible) return null;
  
  // 非表示の場合は何も描画しない
  if (!isVisible) return null;
  
  return (
          <div>
            <h3 className="flex items-center text-lg font-bold mb-3">
              {getDeviceIcon()}
              基本登録: 最初の一歩
            </h3>
            <p className="mb-3">
              基本登録では、最低限必要な情報だけを入力して、アテンダーになるための第一歩を踏み出せます。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
              <h4 className="font-bold">基本登録で必要な情報</h4>
              <ul className="list-disc list-inside text-sm mt-1">
                <li>基本プロフィール（名前・連絡先など）</li>
                <li>身分証明書の情報</li>
                <li>各種同意事項</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              基本登録後でも、いつでも詳細情報を追加できます。
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="flex items-center text-lg font-bold mb-3">
              自動保存機能
            </h3>
            <p className="mb-3">
              入力中のデータは自動的に保存されます。途中で中断しても、次回ログイン時に続きから再開できます。
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-3">
              <h4 className="font-bold">注意ポイント</h4>
              <p className="text-sm mt-1">
                自動保存はデフォルトで1分ごとに行われますが、「今すぐ保存」ボタンでいつでも手動保存できます。
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="flex items-center text-lg font-bold mb-3">
              基本登録完了後について
            </h3>
            <p className="mb-3">
              基本登録が完了すると、アテンダー申請が送信されます。審査中であっても、詳細情報の登録を進めることができます。
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                <h4 className="font-bold">詳細情報を登録するメリット:</h4>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>より多くの体験リクエストを受けられる</li>
                  <li>審査の優先度が上がる可能性がある</li>
                  <li>専門分野が明確になり、マッチング精度が向上</li>
                </ul>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded p-2 text-sm">
                <h4 className="font-bold">詳細情報の項目:</h4>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>専門分野と得意なカテゴリー</li>
                  <li>提供可能な体験サンプル</li>
                  <li>対応可能時間と地域</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              すべての準備が整ったら、詳細登録を完了して、echoアテンダーとしての活動を開始しましょう！
            </p>
          </div>
        );
      default:
        return null;
    }
  };
  
  // 詳細登録モード用のチュートリアルコンテンツ
  const getFullRegistrationTutorial = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="flex items-center text-lg font-bold mb-3">
              {getDeviceIcon()}
              詳細登録: あなたの強みをアピール
            </h3>
            <p className="mb-3">
              詳細登録では、あなたの専門性や提供できる体験を詳しく登録できます。旅行者とのマッチング精度が向上します。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                <h4 className="font-bold">基本ステップ（必須）:</h4>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>基本プロフィール</li>
                  <li>身分証明書の情報</li>
                  <li>各種同意事項</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                <h4 className="font-bold">詳細ステップ（任意）:</h4>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>専門分野と言語スキル</li>
                  <li>体験サンプル</li>
                  <li>利用可能時間</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              時間がない場合は、基本ステップだけでも登録を完了できます。詳細ステップは後から追加可能です。
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="flex items-center text-lg font-bold mb-3">
              専門分野の設定
            </h3>
            <p className="mb-3">
              あなたの専門知識や得意分野を登録することで、関連する体験を求める旅行者とマッチングしやすくなります。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
              <h4 className="font-bold">効果的な専門分野の設定方法</h4>
              <ul className="list-disc list-inside text-sm mt-1">
                <li>具体的かつニッチな専門分野を選ぶと差別化できます</li>
                <li>実際に案内できる内容に絞りましょう</li>
                <li>経験年数や資格があれば積極的に記載すると信頼性が高まります</li>
              </ul>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="flex items-center text-lg font-bold mb-3">
              体験サンプルの作成
            </h3>
            <p className="mb-3">
              体験サンプルは、あなたが実際に提供できる体験内容を具体的に示すものです。これが旅行者にとって最も重要な判断材料になります。
            </p>
            <div className="mb-3">
              <div className="bg-green-50 border border-green-200 rounded-t p-3">
                <h4 className="font-bold">良い体験サンプルの特徴:</h4>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>具体的なタイトルと詳細な説明</li>
                  <li>ユニークな視点や特別な体験</li>
                  <li>明確な所要時間と料金設定</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-b p-3">
                <h4 className="font-bold">避けるべき点:</h4>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>ガイドブックに載っているような一般的な内容だけ</li>
                  <li>曖昧な説明や抽象的な表現</li>
                  <li>実現できない内容の提案</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-600 italic">
              写真は体験の魅力を伝える重要な要素です。実際の体験場所や雰囲気が伝わる画像を選びましょう。
            </p>
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="flex items-center text-lg font-bold mb-3">
              利用可能時間の設定
            </h3>
            <p className="mb-3">
              いつ体験を提供できるかを明確にすることで、旅行者のスケジュールとのマッチング精度が高まります。
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-3">
              <h4 className="font-bold">時間設定のポイント</h4>
              <p className="text-sm mt-1">
                自分のスケジュールを考慮し、無理なく対応できる時間帯を設定しましょう。なるべく柔軟に設定すると、マッチング率が上がります。
              </p>
            </div>
            <p className="text-sm text-gray-600">
              特定の季節や期間のみ対応可能な場合は、備考欄に明記しておくと良いでしょう。
            </p>
          </div>
        );
      case 5:
        return (
          <div>
            <h3 className="flex items-center text-lg font-bold mb-3">
              登録完了とその後のステップ
            </h3>
            <p className="mb-3">
              全ての登録項目が完了したら、申請を送信しましょう。申請は審査され、承認されるとアテンダーとして活動開始できます。
            </p>
            <div className="grid grid-cols-1 gap-3 mb-3">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <h4 className="font-bold">申請後の流れ:</h4>
                <ol className="list-decimal list-inside mt-1">
                  <li className="mb-1">事務局による申請内容の確認（通常1-3営業日）</li>
                  <li className="mb-1">必要に応じて追加情報の提供を依頼</li>
                  <li className="mb-1">審査完了後、承認またはフィードバックのご連絡</li>
                  <li>アテンダーダッシュボードへのアクセス権付与</li>
                </ol>
              </div>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-3">
              <p className="text-sm italic">
                詳細な情報を入力するほど、審査がスムーズに進み、承認される可能性が高まります。echoの一員となって、旅行者に素晴らしい体験を提供しましょう！
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  // 現在のフォーム状態とステップに応じたコンテンツを取得
  const getTutorialContent = () => {
    if (formStatus === 'required') {
      return getBasicRegistrationTutorial();
    } else {
      return getFullRegistrationTutorial();
    }
  };
  
  // 非表示の場合は何も描画しない
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {formStatus === 'required' ? '基本登録' : '詳細登録'}ガイド
          </h2>
          <div className="flex items-center space-x-2">
            {/* 表示モード切替 */}
            <button
              onClick={() => setIsMobile(!isMobile)}
              className="text-gray-500 hover:text-gray-700 p-2"
              title={isMobile ? 'デスクトップ表示' : 'モバイル表示'}
            >
              {isMobile ? <Monitor size={20} /> : <Smartphone size={20} />}
            </button>
            
            {/* 閉じるボタン */}
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {/* コンテンツ */}
        <div className="p-6">
          {getTutorialContent()}
        </div>
        
        {/* フッター */}
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
          {/* プログレスインジケーター */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            {/* ステップ表示 */}
            <div className="text-sm text-gray-500">
              ステップ {currentStep}/{totalSteps}
            </div>
            
            <div className="flex space-x-3">
              {/* スキップボタン */}
              <button
                onClick={onSkipAll}
                className="text-sm text-gray-500 underline"
              >
                今後表示しない
              </button>
              
              {/* ナビゲーションボタン */}
              <div className="flex space-x-2">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    戻る
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  {currentStep < totalSteps ? (
                    <>次へ <ArrowRight className="w-4 h-4 ml-1" /></>
                  ) : (
                    '始める'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;