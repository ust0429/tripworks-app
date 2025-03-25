/**
 * 基本登録完了時のコンポーネント
 * 
 * アテンダー基本登録（必須情報のみ）が成功した際に表示する完了画面
 * 詳細情報入力への誘導を提供する
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { navigateToProfile } from '../../../utils/navigation';
import { CheckCircle, Home, User, Mail, ArrowRight, Calendar, FileText, AlertTriangle, Copy, Check, Award } from 'lucide-react';

interface QuickRegistrationSuccessProps {
  applicationId: string;
  onReturnHome?: () => void;
  onContinueSetup?: () => void;
}

const QuickRegistrationSuccess: React.FC<QuickRegistrationSuccessProps> = ({ 
  applicationId, 
  onReturnHome, 
  onContinueSetup 
}) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // 成功画面が表示されたことをログに記録
  useEffect(() => {
    console.info(`アテンダー基本登録が正常に完了しました。申請ID: ${applicationId}`);
    
    // カウントダウンタイマー
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [applicationId]);
  
  // 申請IDをクリップボードにコピー
  const copyToClipboard = () => {
    navigator.clipboard.writeText(applicationId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      });
  };
  
  // 審査完了予定日（3営業日後の日付）
  const getExpectedReviewDate = () => {
    const today = new Date();
    // 簡易的な営業日計算（より厳密には祝日も考慮する必要あり）
    let businessDays = 0;
    let daysToAdd = 0;
    
    while (businessDays < 3) {
      daysToAdd++;
      const date = new Date(today);
      date.setDate(today.getDate() + daysToAdd);
      // 土日を除外
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        businessDays++;
      }
    }
    
    const result = new Date(today);
    result.setDate(today.getDate() + daysToAdd);
    
    // 日本語形式で表示
    return result.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="mb-8 text-center">
        <div className="mx-auto w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-cyan-500" />
        </div>
        <h1 className="text-3xl font-bold mt-4 mb-2">基本登録を受け付けました</h1>
        <p className="text-lg text-gray-600">
          アテンダーの基本情報が正常に登録されました。続けて詳細情報を入力することで、アテンダーとしての活動範囲が広がります。
        </p>
        <div className="inline-block mt-2 rounded-full bg-cyan-100 text-cyan-800 px-3 py-1 text-sm font-medium">
          基本登録完了
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">申請ID</p>
          <button 
            onClick={copyToClipboard}
            className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
            title="IDをコピー"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'コピーしました' : 'コピー'}
          </button>
        </div>
        <p className="font-medium text-gray-800 text-xl break-all">{applicationId}</p>
        
        <div className="mt-6">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <p className="text-sm text-gray-500">審査完了予定日</p>
          </div>
          <p className="font-medium text-gray-800">{getExpectedReviewDate()}</p>
          <p className="text-xs text-gray-500 mt-1">※土日祝日を除く営業日です。状況により前後する場合があります。</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg mb-8 border border-cyan-100">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-cyan-800">
          <Award className="w-5 h-5 mr-2 text-cyan-600" />
          詳細情報を入力すると何が良いの？
        </h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <div className="bg-cyan-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">1</div>
            <div>
              <span className="font-medium">検索表示の優先度アップ</span>
              <p className="text-sm mt-1">詳細プロフィールを完成させると、ユーザーの検索結果で上位に表示されやすくなります。</p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-cyan-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">2</div>
            <div>
              <span className="font-medium">多様な体験機会</span>
              <p className="text-sm mt-1">専門分野や提供可能な体験サンプルを登録することで、より多くのユーザーとマッチングできます。</p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-cyan-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">3</div>
            <div>
              <span className="font-medium">信頼性の向上</span>
              <p className="text-sm mt-1">詳細な情報を公開することで、ユーザーからの信頼を得やすくなり、予約率が向上します。</p>
            </div>
          </li>
        </ul>
        <div className="mt-4 text-sm text-cyan-700">
          <p className="font-medium">完成したプロフィールは申請数・質ともに2倍の予約獲得につながっています！</p>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md mb-8 border-l-4 border-yellow-400">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800">基本登録での注意点</h3>
            <p className="text-sm mt-1 text-yellow-700">
              基本登録だけでもアテンダーとして活動できますが、詳細情報がないと表示優先度が下がる場合があります。できるだけ早めに詳細情報を追加することをおすすめします。
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <button
          onClick={onContinueSetup}
          className="px-6 py-3 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
        >
          詳細情報を入力する
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onReturnHome || (() => {})}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          ホームへ戻る {countdown > 0 ? `(${countdown})` : ''}
        </button>
        <Link
          to="/profile"
          className="px-6 py-3 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            navigateToProfile();
          }}
        >
          <User className="w-5 h-5" />
          マイページを表示
        </Link>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          詳細情報はいつでもマイページから追加できます。ご不明な点があれば
          <a href="mailto:support@echo.jp" className="text-blue-500 hover:underline inline-flex items-center gap-1">
            <Mail className="w-4 h-4" />
            support@echo.jp
          </a>
          までお問い合わせください。
        </p>
        <p className="text-xs text-gray-400 mt-2">
          申請ID: {applicationId} | 登録日時: {new Date().toLocaleString('ja-JP')}
        </p>
      </div>
    </div>
  );
};

export default QuickRegistrationSuccess;
