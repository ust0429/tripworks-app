/**
 * 申請成功時のコンポーネント
 * 
 * アテンダー申請が成功した際に表示する完了画面
 * ユーザーエクスペリエンスとフィードバックを向上
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { navigateToProfile, navigateTo } from '../../../utils/navigation';
import { CheckCircle, Home, User, Mail, ArrowLeft, Calendar, FileText, AlertTriangle, Copy, Check } from 'lucide-react';

interface SubmitSuccessProps {
  applicationId: string;
  onReturnHome?: () => void;
}

const SubmitSuccess: React.FC<SubmitSuccessProps> = ({ applicationId, onReturnHome }) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // 成功画面が表示されたことをログに記録
  useEffect(() => {
    console.info(`アテンダー申請が正常に完了しました。申請ID: ${applicationId}`);
    
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
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mt-4 mb-2">申請を受け付けました</h1>
        <p className="text-lg text-gray-600">
          あなたのアテンダー申請は正常に受け付けられました。審査完了までしばらくお待ちください。
        </p>
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
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-500" />
          次のステップ
        </h2>
        <ol className="list-decimal pl-8 space-y-3 text-gray-600">
          <li>
            申請IDを控えておいてください。お問い合わせの際に必要です。
          </li>
          <li>
            登録したメールアドレス宛に、申請受付の確認メールが送信されます。
            <div className="text-sm bg-blue-50 p-2 rounded mt-1 border-l-4 border-blue-500">
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </div>
          </li>
          <li>
            審査には通常3〜5営業日かかります。審査状況はマイページでご確認いただけます。
          </li>
          <li>
            追加情報が必要な場合は、登録したメールアドレス宛にお知らせします。
          </li>
          <li>
            審査が完了すると、結果をメールでお知らせします。承認されると、すぐにアテンダーとして活動を開始できます。
          </li>
        </ol>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md mb-8 border-l-4 border-yellow-400">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800">審査中のお願い</h3>
            <p className="text-sm mt-1 text-yellow-700">
              審査中にプロフィール情報やメールアドレスを変更すると、審査に影響する場合があります。審査完了までできるだけ変更を控えていただくようお願いいたします。
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <button
          onClick={onReturnHome || (() => {})}
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          ホームへ戻る {countdown > 0 ? `(${countdown})` : ''}
        </button>
        <Link
          to="/profile"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            navigateToProfile();
          }}
        >
          <User className="w-5 h-5" />
          マイページを表示
        </Link>
        <Link
          to="/attender/status"
          className="px-6 py-3 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/attender/status');
          }}
        >
          <FileText className="w-5 h-5" />
          申請状況を確認
        </Link>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          ご不明な点がございましたら、
          <a href="mailto:support@echo.jp" className="text-blue-500 hover:underline inline-flex items-center gap-1">
            <Mail className="w-4 h-4" />
            support@echo.jp
          </a>
          までお問い合わせください。
        </p>
        <p className="text-xs text-gray-400 mt-2">
          申請ID: {applicationId} | 申請日時: {new Date().toLocaleString('ja-JP')}
        </p>
      </div>
    </div>
  );
};

export default SubmitSuccess;
