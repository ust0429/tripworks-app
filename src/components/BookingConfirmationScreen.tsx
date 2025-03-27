import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Info, AlertCircle } from 'lucide-react';
import { AttenderType } from '../types';
import PaymentForm from './payment/PaymentForm';
import { PaymentData } from '../types/payment';
import PaymentComplete from './payment/PaymentComplete';
import { usePayment } from '../contexts/PaymentContext';
import { PaymentMethodType } from '../types/payment';

interface BookingConfirmationScreenProps {
  attenderId?: number;
  experienceId?: number;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: number;
  onBack: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  attendersData: AttenderType[];
}

enum BookingStage {
  CONFIRMATION,
  PAYMENT,
  COMPLETE
}

const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  attenderId,
  experienceId,
  date,
  time,
  duration,
  location,
  price,
  onBack,
  onConfirm,
  onCancel,
  attendersData
}) => {
  // 状態管理
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [bookingStage, setBookingStage] = useState<BookingStage>(BookingStage.CONFIRMATION);
  
  // 決済コンテキストを使用
  const { paymentState, processPayment, clearPaymentState } = usePayment();
  
  
  // アテンダー情報を取得
  const attender = attenderId ? attendersData.find(a => a.id === attenderId) : null;
  
  if (!attender && attenderId) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="mr-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">予約確認</h1>
        </div>
        <div className="text-center py-8">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">アテンダー情報が見つかりません。</p>
        </div>
      </div>
    );
  }
  
  // 日時の整形
  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  // 合計金額計算（オプションがあれば追加）
  const serviceCharge = Math.round(price * 0.05); // 5%のサービス料
  const totalPrice = price + serviceCharge;

  // 決済処理
  const handlePaymentSubmit = async (paymentData: PaymentData) => {
    try {
      // PaymentData にtotalAmount を設定
      const paymentDataWithAmount = {
        ...paymentData,
        amount: totalPrice
      };
      
      const success = await processPayment(paymentDataWithAmount);
      if (success) {
        setBookingStage(BookingStage.COMPLETE);
      }
    } catch (error) {
      console.error('決済エラー:', error);
    }
  };

  // 確認画面に戻る
  const handleBackToConfirmation = () => {
    setBookingStage(BookingStage.CONFIRMATION);
  };

  // 予約完了 & 旅程に移動
  const handleCompleteBooking = () => {
    clearPaymentState();
    onConfirm();
  };

  // 決済画面に進む
  const handleProceedToPayment = () => {
    setBookingStage(BookingStage.PAYMENT);
  };

  // 決済失敗時に再試行
  const handleRetryPayment = () => {
    clearPaymentState();
    setBookingStage(BookingStage.PAYMENT);
  };

  // 体験タイトルを生成
  const experienceTitle = experienceId 
    ? `体験ID ${experienceId}` 
    : attender ? `${attender.type}との自由なプラン` : '体験予約';

  // 各画面の描画
  const renderStage = () => {
    switch (bookingStage) {
      case BookingStage.CONFIRMATION:
        return (
          <div className="bg-mono-lighter min-h-screen pb-20">
            <div className="bg-mono-white p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <button onClick={onBack} className="mr-2 text-mono-black">
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-mono-black">予約確認</h1>
              </div>
            </div>
            
            <div className="p-4 space-y-6">
              {/* 体験概要 */}
              <div className="bg-mono-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-bold mb-2 text-mono-black">体験概要</h2>
                <p className="text-mono-black">{experienceTitle}</p>
                <p className="text-mono-gray-medium text-sm mt-1">{attender?.description || ''}</p>
              </div>
              
              {/* 日時と場所 */}
              <div className="bg-mono-white rounded-lg shadow-sm p-4 space-y-4">
                <div className="flex items-start">
                  <Calendar size={20} className="text-mono-gray-medium mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-mono-black">日付</h3>
                    <p className="text-mono-gray-medium">{formattedDate}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock size={20} className="text-mono-gray-medium mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-mono-black">時間</h3>
                    <p className="text-mono-gray-medium">{time}（{duration}）</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin size={20} className="text-mono-gray-medium mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-mono-black">場所</h3>
                    <p className="text-mono-gray-medium">{location}</p>
                    <button className="text-mono-black text-sm underline mt-1">地図で見る</button>
                  </div>
                </div>
              </div>
              
              {/* アテンダー情報 */}
              {attender && (
                <div className="bg-mono-white rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-bold mb-3 text-mono-black">アテンダー</h2>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-mono-lighter rounded-full flex items-center justify-center mr-3">
                      {attender.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-mono-black">{attender.name}</h3>
                      <p className="text-mono-gray-medium text-sm">{attender.type}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 料金詳細 */}
              <div className="bg-mono-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-bold mb-3 text-mono-black">料金詳細</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-mono-gray-medium">体験料金</span>
                    <span className="text-mono-black">¥{price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mono-gray-medium">サービス料</span>
                    <span className="text-mono-black">¥{serviceCharge.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-mono-light pt-2 mt-2 flex justify-between font-bold">
                    <span className="text-mono-black">合計</span>
                    <span className="text-mono-black">¥{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* キャンセルポリシー */}
              <div className="bg-mono-white rounded-lg shadow-sm p-4">
                <button 
                  onClick={() => setShowCancellationPolicy(!showCancellationPolicy)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center">
                    <Info size={20} className="text-mono-gray-medium mr-2" />
                    <span className="font-medium text-mono-black">キャンセルポリシー</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 transition-transform text-mono-black ${showCancellationPolicy ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCancellationPolicy && (
                  <div className="mt-3 text-sm text-mono-gray-medium space-y-2">
                    <p>・体験開始72時間前までのキャンセル: 全額返金</p>
                    <p>・体験開始24時間前までのキャンセル: 50%返金</p>
                    <p>・体験開始24時間以内のキャンセル: 返金不可</p>
                    <p className="text-mono-gray-light mt-2">
                      予期せぬ事態によりアテンダーがキャンセルした場合は全額返金いたします。
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 確定ボタン */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-mono-white border-t border-mono-light">
              <div className="flex space-x-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 border border-mono-light rounded-lg font-medium text-mono-dark hover:bg-mono-lighter transition-colors duration-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="flex-1 py-3 bg-mono-black text-mono-white rounded-lg font-medium hover:bg-mono-dark transition-colors duration-200"
                >
                  支払いに進む
                </button>
              </div>
            </div>
          </div>
        );
        
      case BookingStage.PAYMENT:
        return (
          <div className="bg-mono-lighter min-h-screen">
            <div className="bg-mono-white p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <button onClick={handleBackToConfirmation} className="mr-2 text-mono-black">
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-mono-black">お支払い</h1>
              </div>
            </div>
            
            <div className="p-4">
              <PaymentForm 
                totalAmount={totalPrice}
                onPaymentSubmit={handlePaymentSubmit}
                onCancel={handleBackToConfirmation}
              />
            </div>
          </div>
        );
        
      case BookingStage.COMPLETE:
        return (
          <div className="bg-mono-lighter min-h-screen p-4">
            <PaymentComplete 
              success={paymentState.isSuccess}
              error={paymentState.error || undefined}
              bookingId={paymentState.bookingId || undefined}
              paymentMethod={paymentState.paymentMethod || undefined}
              experience={{
                title: experienceTitle,
                date: formattedDate,
                time: `${time}（${duration}）`,
                location: location
              }}
              attender={attender ? {
                name: attender.name,
                type: attender.type
              } : undefined}
              amount={totalPrice}
              onClose={handleCompleteBooking}
              onRetry={handleRetryPayment}
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return renderStage();
};

export default BookingConfirmationScreen;