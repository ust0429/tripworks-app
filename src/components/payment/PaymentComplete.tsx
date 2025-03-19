import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, Calendar, ArrowLeft, Share2, Clock, MapPin, AlertTriangle, Download } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';
import { getPaymentMethodName } from '../../utils/paymentUtils';
import { PaymentMethodType } from '../../types/payment';
import Confetti from '../effects/Confetti';

// 決済ステータス用のコンポーネント
const PaymentStatus: React.FC<{
  success: boolean;
  paymentMethod?: PaymentMethodType;
  isLoading?: boolean;
}> = ({ success, paymentMethod, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-3 bg-blue-50 rounded-md">
        <div className="animate-pulse flex space-x-2 items-center">
          <div className="h-4 w-4 bg-blue-200 rounded-full"></div>
          <div className="h-4 w-32 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="flex items-center justify-between p-3 bg-red-50 rounded-md">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 font-medium">決済が完了していません</span>
        </div>
      </div>
    );
  }

  // 決済方法に応じたステータス表示
  const getStatusText = () => {
    switch (paymentMethod) {
      case 'credit_card':
        return '決済完了';
      case 'convenience':
        return '払込票発行済み';
      case 'bank_transfer':
        return '振込先発行済み';
      case 'qr_code':
        return 'QRコード発行済み';
      default:
        return '処理完了';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
        <span className="text-green-700 font-medium">{getStatusText()}</span>
      </div>
    </div>
  );
};

interface PaymentCompleteProps {
  success: boolean;
  error?: string;
  bookingId?: string;
  paymentMethod?: PaymentMethodType;
  experience: {
    title: string;
    date: string;
    time: string;
    location: string;
  };
  attender: {
    name: string;
    type: string;
  };
  amount: number;
  onClose: () => void;
  onRetry: () => void;
}

const PaymentComplete: React.FC<PaymentCompleteProps> = ({
  success,
  error,
  bookingId,
  paymentMethod,
  experience,
  attender,
  amount,
  onClose,
  onRetry
}) => {
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // トースト通知用の状態
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // コンフェティエフェクト用の状態
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // 成功時のみコンフェティを表示
  useEffect(() => {
    if (success && paymentMethod === 'credit_card') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, paymentMethod]);

  // 予約番号
  const reservationNumber = bookingId || 'UNKNOWN';

  // トースト通知を表示
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // クリップボードにコピー
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showToastNotification('予約番号をコピーしました');
        setCopySuccess('コピーしました');
        setTimeout(() => setCopySuccess(null), 2000);
      },
      () => {
        setCopySuccess('コピーできませんでした');
      }
    );
  };

  // 決済完了メール（仮想）を送信
  const sendConfirmationEmail = () => {
    showToastNotification('予約確認メールを再送しました');
  };

  // 予約の詳細ページを開く
  const viewBookingDetails = () => {
    navigate(`/bookings/${reservationNumber}`);
  };

  // 領収書をダウンロード（実際のダウンロード機能はAPIから実装）
  const downloadReceipt = () => {
    showToastNotification('領収書のダウンロードを開始しました');
    // 実際の実装ではAPIエンドポイントからPDFをダウンロード
  };

  // 決済方法に応じた追加情報を表示
  const renderPaymentMethodInfo = () => {
    if (!paymentMethod) return null;

    switch (paymentMethod) {
      case 'credit_card':
        return (
          <p className="text-gray-600">
            クレジットカードでのお支払いが完了しました。予約の詳細をご確認ください。
          </p>
        );
      
      case 'convenience':
        return (
          <div className="space-y-2">
            <p className="text-gray-600">
              コンビニ払いの受付が完了しました。お支払い番号と手順をメールでお送りしました。
            </p>
            <p className="font-medium">
              お支払い期限：
              {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        );
      
      case 'bank_transfer':
        return (
          <div className="space-y-2">
            <p className="text-gray-600">
              銀行振込の受付が完了しました。振込先口座情報をメールでお送りしました。
            </p>
            <p className="font-medium">
              お振込期限：
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        );
      
      case 'qr_code':
        return (
          <div className="space-y-2">
            <p className="text-gray-600">
              QRコード決済の受付が完了しました。決済用QRコードをメールでお送りしました。
            </p>
            <p className="font-medium">
              QRコード有効期限：
              {new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  // エラー表示
  if (!success) {
    return (
      <div className="max-w-lg mx-auto my-8 p-6 bg-white rounded-lg shadow-md border border-red-100">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600">決済エラー</h1>
        </div>
        
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-red-700">
            {error || '決済処理中にエラーが発生しました。時間をおいて再度お試しください。'}
          </p>
        </div>
        
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">考えられる原因:</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>入力されたカード情報に誤りがある可能性があります</li>
            <li>カード発行会社でトランザクションが拒否された可能性があります</li>
            <li>ネットワーク接続の問題が発生した可能性があります</li>
            <li>システムに一時的な障害が発生している可能性があります</li>
          </ul>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={onRetry}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <span>もう一度支払いを試す</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            予約をキャンセルして戻る
          </button>
          
          <button
            onClick={() => {
              // サポートに問い合わせる
              navigate('/support/contact');
            }}
            className="w-full py-2 text-blue-600 hover:underline focus:outline-none flex items-center justify-center"
          >
            サポートに問い合わせる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto my-8 p-6 bg-white rounded-lg shadow-md relative">
      {/* コンフェティエフェクト */}
      {showConfetti && <Confetti />}

      {/* 成功アイコンとタイトル */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800">
          {paymentMethod === 'credit_card'
            ? 'お支払いが完了しました'
            : 'お支払い手続きを受け付けました'}
        </h1>
      </div>

      {/* 決済ステータス */}
      <div className="mb-6">
        <PaymentStatus success={success} paymentMethod={paymentMethod} />
      </div>

      {/* 予約情報 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h2 className="font-semibold text-gray-700 mb-2">{experience.title}</h2>
        <div className="flex items-start mb-2">
          <Calendar className="w-4 h-4 mr-2 mt-1" />
          <span className="text-gray-600">
            {experience.date}
          </span>
        </div>
        <div className="flex items-start mb-2">
          <Clock className="w-4 h-4 mr-2 mt-1" />
          <span className="text-gray-600">
            {experience.time}
          </span>
        </div>
        <div className="flex items-start mb-2">
          <MapPin className="w-4 h-4 mr-2 mt-1" />
          <div>
            <p className="text-gray-600">{experience.location}</p>
          </div>
        </div>
        <p className="text-gray-600 mt-2">アテンダー: {attender.name}</p>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
          <span className="text-gray-700">お支払い金額</span>
          <span className="font-bold text-gray-900">
            {amount.toLocaleString()}円（税込）
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-700">お支払い方法</span>
          <span className="text-gray-900">
            {paymentMethod ? getPaymentMethodName(paymentMethod) : '未選択'}
          </span>
        </div>
      </div>

      {/* 決済方法ごとの追加情報 */}
      <div className="mb-6">
        {renderPaymentMethodInfo()}
      </div>

      {/* 予約番号とコピーボタン */}
      {bookingId && (
        <div className="mb-6">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
            <div>
              <p className="text-sm text-gray-600">予約番号</p>
              <p className="font-mono font-medium">{reservationNumber}</p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(reservationNumber)}
              className="p-2 bg-white text-blue-600 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="予約番号をコピー"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          {copySuccess && (
            <p className="text-sm text-green-600 mt-1 text-right">{copySuccess}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            ※ お問い合わせの際は、こちらの予約番号をお伝えください。
          </p>
        </div>
      )}

      {/* アクションボタン */}
      <div className="mb-6">
        <div className="font-medium text-gray-700 mb-2">次のステップ</div>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={viewBookingDetails}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            予約詳細を確認する
          </button>
          
          <button
            onClick={sendConfirmationEmail}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <span>確認メールを再送する</span>
          </button>
          
          {paymentMethod === 'credit_card' && (
            <button
              onClick={downloadReceipt}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>領収書をダウンロード</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="flex items-center justify-center py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            予約一覧へ
          </button>
          
          <button
            onClick={() => {
              // シェア機能（実際の実装では共有APIを使用）
              if (navigator.share) {
                navigator.share({
                  title: 'echo 予約確認',
                  text: `echo で${experience.title}を予約しました！`,
                  url: window.location.href
                }).catch((error) => console.log('シェアに失敗しました', error));
              } else {
                // フォールバック: URLをコピー
                copyToClipboard(window.location.href);
                showToastNotification('リンクをコピーしました');
              }
            }}
            className="flex items-center justify-center py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Share2 className="w-4 h-4 mr-1" />
            共有する
          </button>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="mt-8 text-sm text-gray-600 space-y-2">
        <p>※ 予約詳細とお支払い情報をメールでお送りしています。</p>
        <p>※ アプリ内の「予約一覧」からもご確認いただけます。</p>
        {paymentMethod !== 'credit_card' && (
          <p>※ お支払い期限までにお支払いが確認できない場合、予約は自動的にキャンセルとなります。</p>
        )}
      </div>
      
      {/* トースト通知 */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default PaymentComplete;
