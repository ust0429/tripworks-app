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
import { updateUserProfile } from '../../../services/UserService';
import { useAuth } from '../../../contexts/AuthContext';

interface QuickRegistrationSuccessProps {
  applicationId: string;
  onReturnHome?: () => void;
}

const QuickRegistrationSuccess: React.FC<QuickRegistrationSuccessProps> = ({ 
  applicationId, 
  onReturnHome
}) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { user, updateAuthUser } = useAuth();
  
  // 成功画面が表示されたことをログに記録
  useEffect(() => {
    console.info(`アテンダー基本登録が正常に完了しました。申請ID: ${applicationId}`);
    
    // ユーザープロフィールのisAttenderフラグを更新
    const updateUserAttenderStatus = async () => {
      try {
        if (user) {
          // ユーザープロフィールを更新してisAttenderをtrueに設定
          await updateUserProfile({ isAttender: true });
          
          // 認証情報も更新（ローカルストレージなどのキャッシュも更新されるように）
          if (updateAuthUser) {
            updateAuthUser({ ...user, isAttender: true });
          }
          
          console.info('ユーザープロフィールのisAttenderフラグを更新しました');
        }
      } catch (error) {
        console.error('ユーザープロフィールの更新に失敗しました:', error);
      }
    };
    
    // プロフィール更新を実行
    updateUserAttenderStatus();
    
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
  }, [applicationId, user, updateAuthUser]);
  
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

  return (
    <div className="max-w-4xl mx-auto p-8 bg-mono-white rounded-lg shadow-md">
      <div className="mb-8 text-center">
        <div className="mx-auto w-20 h-20 bg-mono-lighter rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-mono-black" />
        </div>
        <h1 className="text-3xl font-bold mt-4 mb-2 text-mono-black">基本登録を受け付けました</h1>
        <p className="text-lg text-mono-gray-medium">
          アテンダーの基本情報が正常に登録されました。マイページから当面不要な詳細情報を入力できます。
        </p>
        <div className="inline-block mt-2 rounded-full bg-mono-lighter text-mono-dark px-3 py-1 text-sm font-medium">
          基本登録完了
        </div>
      </div>
      
      <div className="bg-mono-lighter p-6 rounded-lg mb-8 border border-mono-light">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-mono-gray-medium">申請ID</p>
          <button 
            onClick={copyToClipboard}
            className="text-mono-black hover:text-mono-gray-dark flex items-center text-sm"
            title="IDをコピー"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'コピーしました' : 'コピー'}
          </button>
        </div>
        <p className="font-medium text-mono-black text-xl break-all">{applicationId}</p>
      </div>
      
      <div className="bg-mono-lighter p-6 rounded-lg mb-8 border border-mono-light">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-mono-black">
          <Award className="w-5 h-5 mr-2 text-mono-black" />
          詳細情報を入力すると何が良いの？
        </h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <div className="bg-mono-black text-mono-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">1</div>
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
        <div className="mt-4 text-sm text-mono-gray-dark">
          <p className="font-medium">完成したプロフィールは申請数・質ともに2倍の予約獲得につながっています！</p>
        </div>
      </div>
      
      <div className="bg-mono-lighter p-4 rounded-md mb-8 border-l-4 border-mono-light">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-mono-gray-dark mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-mono-black">基本登録での注意点</h3>
            <p className="text-sm mt-1 text-mono-gray-dark">
              基本登録だけでもアテンダーとして活動できますが、詳細情報がないと表示優先度が下がる場合があります。できるだけ早めに詳細情報を追加することをおすすめします。
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <button
        onClick={onReturnHome || (() => {})}
        className="px-6 py-3 bg-mono-black text-mono-white rounded-md hover:bg-mono-dark transition-colors flex items-center justify-center gap-2"
        >
        <Home className="w-5 h-5" />
        ホームへ戻る {countdown > 0 ? `(${countdown})` : ''}
        </button>
        <Link
        to="/profile"
        className="px-6 py-3 bg-mono-light text-mono-black rounded-md hover:bg-mono-gray-light transition-colors flex items-center justify-center gap-2"
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
        <p className="text-sm text-mono-gray-medium">
          詳細情報はいつでもマイページから追加できます。ご不明な点があれば
          <a href="mailto:support@echo.jp" className="text-mono-black hover:underline inline-flex items-center gap-1">
            <Mail className="w-4 h-4" />
            support@echo.jp
          </a>
          までお問い合わせください。
        </p>
        <p className="text-xs text-mono-gray-light mt-2">
          申請ID: {applicationId} | 登録日時: {new Date().toLocaleString('ja-JP')}
        </p>
      </div>
    </div>
  );
};

export default QuickRegistrationSuccess;