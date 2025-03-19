import React from 'react';
import { CheckCircle2, XCircle, Copy, Calendar, Clock, MapPin, User } from 'lucide-react';
import { PaymentMethodType } from './PaymentForm';

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
  onRetry?: () => void;
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
  // 支払い方法の表示名
  const getPaymentMethodName = (method?: PaymentMethodType): string => {
    switch (method) {
      case 'credit_card': return 'クレジットカード';
      case 'convenience': return 'コンビニ決済';
      case 'bank_transfer': return '銀行振込';
      case 'qr_code': return 'QRコード決済';
      default: return '不明';
    }
  };

  // 次のステップのガイダンス
  const renderNextSteps = () => {
    if (!success) return null;

    switch (paymentMethod) {
      case 'convenience':
        return (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">次のステップ</h3>
            <p className="text-blue-700 text-sm">
              コンビニ決済に必要な情報を登録メールアドレスにお送りしました。メール内の手順に従って、3日以内にお支払いを完了してください。
            </p>
          </div>
        );
        
      case 'bank_transfer':
        return (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">次のステップ</h3>
            <p className="text-blue-700 text-sm">
              銀行振込の詳細を登録メールアドレスにお送りしました。3日以内にお振込みをお願いします。
            </p>
          </div>
        );
      
      case 'qr_code':
        return (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">次のステップ</h3>
            <p className="text-blue-700 text-sm">
              QRコード決済を完了するには、決済アプリを開いて表示されるQRコードをスキャンしてください。
            </p>
          </div>
        );
        
      default:
        return (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">次のステップ</h3>
            <p className="text-blue-700 text-sm">
              予約詳細は「旅程」タブからいつでも確認できます。当日の集合場所や時間をご確認ください。
            </p>
          </div>
        );
    }
  };

  // 予約コードをクリップボードにコピー
  const copyBookingId = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId)
        .then(() => {
          alert('予約番号をコピーしました');
        })
        .catch((err) => {
          console.error('コピーに失敗しました:', err);
        });
    }
  };

  return (
    <div className="bg-white rounded-lg max-w-lg mx-auto p-6">
      {success ? (
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">予約が完了しました</h2>
          <p className="text-gray-600 mt-1">
            {paymentMethod === 'credit_card' 
              ? '決済が完了しました' 
              : 'お支払い手続きを進めてください'}
          </p>
        </div>
      ) : (
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <XCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">決済エラー</h2>
          <p className="text-gray-600 mt-1">{error || '決済処理中にエラーが発生しました'}</p>
        </div>
      )}

      {success && bookingId && (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">予約番号</p>
            <p className="font-bold">{bookingId}</p>
          </div>
          <button 
            onClick={copyBookingId}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="予約番号をコピー"
          >
            <Copy size={18} className="text-gray-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="space-y-5">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-3">予約内容</h3>
            <p className="font-bold text-lg">{experience.title}</p>
            
            <div className="mt-3 space-y-2">
              <div className="flex">
                <Calendar size={18} className="text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-gray-800">{experience.date}</p>
                </div>
              </div>
              
              <div className="flex">
                <Clock size={18} className="text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-gray-800">{experience.time}</p>
                </div>
              </div>
              
              <div className="flex">
                <MapPin size={18} className="text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-gray-800">{experience.location}</p>
                </div>
              </div>
              
              <div className="flex">
                <User size={18} className="text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-gray-800">{attender.name} ({attender.type})</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-medium mb-3">支払い情報</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">支払い方法</span>
              <span className="font-medium">{getPaymentMethodName(paymentMethod)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">支払い金額</span>
              <span className="font-bold">¥{amount.toLocaleString()}</span>
            </div>
          </div>
          
          {renderNextSteps()}
        </div>
      )}
      
      <div className="mt-6 flex space-x-3">
        {!success && onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
          >
            もう一度試す
          </button>
        )}
        <button
          onClick={onClose}
          className={`flex-1 py-3 ${success ? 'bg-black text-white' : 'bg-gray-700 text-white'} rounded-lg font-medium`}
        >
          {success ? '旅程を見る' : '戻る'}
        </button>
      </div>
    </div>
  );
};

export default PaymentComplete;