import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { PaymentResult as PaymentResultType } from '../../types/payment';

interface PaymentResultProps {
  result: PaymentResultType;
  onClose?: () => void;
}

const PaymentResult: React.FC<PaymentResultProps> = ({ result, onClose }) => {
  const navigate = useNavigate();
  
  // リダイレクト処理
  const handleRedirect = () => {
    if (result.redirectUrl) {
      navigate(result.redirectUrl);
    } else if (result.bookingId) {
      navigate(`/bookings/${result.bookingId}`);
    } else {
      onClose && onClose();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* 成功時のUI */}
      {result.success ? (
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-green-800 mb-2">
            決済が完了しました
          </h3>
          
          <p className="text-gray-600 mb-6">
            {result.message || 'お支払いが正常に処理されました。予約詳細ページに移動して詳細をご確認ください。'}
          </p>
          
          <div className="flex justify-center space-x-3">
            {/* 詳細ページへ移動 */}
            <button
              onClick={handleRedirect}
              className="py-3 px-6 bg-black text-white rounded-lg font-medium flex items-center"
            >
              <span>予約詳細を見る</span>
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
          
          {/* トランザクションID（任意表示） */}
          {result.transactionId && (
            <p className="mt-6 text-xs text-gray-500">
              取引ID: {result.transactionId}
            </p>
          )}
        </div>
      ) : (
        // 失敗時のUI
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle size={32} className="text-red-600" />
          </div>
          
          <h3 className="text-xl font-bold text-red-800 mb-2">
            決済に失敗しました
          </h3>
          
          <p className="text-gray-600 mb-6">
            {result.message || 'お支払い処理中にエラーが発生しました。もう一度お試しいただくか、別の支払い方法をお選びください。'}
          </p>
          
          <div className="flex justify-center space-x-3">
            {/* 再試行ボタン */}
            <button
              onClick={onClose}
              className="py-3 px-6 border border-gray-300 rounded-lg font-medium"
            >
              戻る
            </button>
            
            {/* ホームへ戻るボタン */}
            <button
              onClick={() => navigate('/')}
              className="py-3 px-6 bg-black text-white rounded-lg font-medium"
            >
              ホームへ戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentResult;
