/**
 * 申請成功時のコンポーネント
 * 
 * アテンダー申請が成功した際に表示する完了画面
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, User, Mail, ArrowLeft } from 'lucide-react';

interface SubmitSuccessProps {
  applicationId: string;
  onReturnHome?: () => void;
}

const SubmitSuccess: React.FC<SubmitSuccessProps> = ({ applicationId, onReturnHome }) => {
  // 成功画面が表示されたことをログに記録
  useEffect(() => {
    console.info(`アテンダー申請が正常に完了しました。申請ID: ${applicationId}`);
  }, [applicationId]);
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md text-center">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">申請を受け付けました</h1>
      <p className="text-gray-600 mb-4">
        あなたのアテンダー申請を受け付けました。現在、審査中です。
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-500 mb-1">申請ID</p>
        <p className="font-medium text-gray-800">{applicationId}</p>
      </div>
      
      <div className="text-left mb-6">
        <h2 className="text-lg font-semibold mb-3">次にすること</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>
            申請IDを控えておいてください。お問い合わせの際に必要になることがあります。
          </li>
          <li>
            登録したメールアドレス宛に、申請受付の確認メールが送信されます。メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </li>
          <li>
            審査には通常3〜5営業日かかります。審査状況についてはマイページでご確認いただけます。
          </li>
          <li>
            追加情報が必要な場合は、登録したメールアドレス宛にお知らせします。
          </li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onReturnHome || (() => {})}
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          ホームへ戻る
        </button>
        <Link
          to="/profile"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" />
          プロフィールへ
        </Link>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        ご不明な点がございましたら、
        <a href="mailto:support@echo.jp" className="text-blue-500 hover:underline flex items-center gap-1 inline-flex">
          <Mail className="w-3 h-3" />
          support@echo.jp
        </a>
        までお問い合わせください。
      </p>
    </div>
  );
};

export default SubmitSuccess;
