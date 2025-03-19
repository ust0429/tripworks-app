import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Info, CreditCard, AlertCircle } from 'lucide-react';
import { AttenderType } from '../types';

interface BookingConfirmationScreenProps {
  attenderId: number;
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
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'convenience' | 'bank_transfer'>('credit_card');
  
  // アテンダー情報を取得
  const attender = attendersData.find(a => a.id === attenderId);
  
  if (!attender) {
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
  
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center mb-2">
          <button onClick={onBack} className="mr-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">予約確認</h1>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* 体験概要 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold mb-2">体験概要</h2>
          <p className="text-gray-800">
            {experienceId ? `${attender.type}の体験` : `${attender.type}との自由なプラン`}
          </p>
          <p className="text-gray-600 text-sm mt-1">{attender.description}</p>
        </div>
        
        {/* 日時と場所 */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex items-start">
            <Calendar size={20} className="text-gray-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">日付</h3>
              <p className="text-gray-600">{formattedDate}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock size={20} className="text-gray-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">時間</h3>
              <p className="text-gray-600">{time}（{duration}）</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin size={20} className="text-gray-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">場所</h3>
              <p className="text-gray-600">{location}</p>
              <button className="text-black text-sm underline mt-1">地図で見る</button>
            </div>
          </div>
        </div>
        
        {/* アテンダー情報 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold mb-3">アテンダー</h2>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              {attender.icon}
            </div>
            <div>
              <h3 className="font-medium">{attender.name}</h3>
              <p className="text-gray-600 text-sm">{attender.type}</p>
            </div>
          </div>
        </div>
        
        {/* 料金詳細 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold mb-3">料金詳細</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">体験料金</span>
              <span>¥{price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">サービス料</span>
              <span>¥{serviceCharge.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>合計</span>
              <span>¥{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* キャンセルポリシー */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <button 
            onClick={() => setShowCancellationPolicy(!showCancellationPolicy)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center">
              <Info size={20} className="text-gray-500 mr-2" />
              <span className="font-medium">キャンセルポリシー</span>
            </div>
            <svg 
              className={`w-5 h-5 transition-transform ${showCancellationPolicy ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showCancellationPolicy && (
            <div className="mt-3 text-sm text-gray-600 space-y-2">
              <p>・体験開始72時間前までのキャンセル: 全額返金</p>
              <p>・体験開始24時間前までのキャンセル: 50%返金</p>
              <p>・体験開始24時間以内のキャンセル: 返金不可</p>
              <p className="text-gray-500 mt-2">
                予期せぬ事態によりアテンダーがキャンセルした場合は全額返金いたします。
              </p>
            </div>
          )}
        </div>
        
        {/* 支払い方法 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold mb-3">お支払い方法</h2>
          
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={() => setPaymentMethod('credit_card')}
                className="mr-3"
              />
              <CreditCard size={20} className="text-gray-600 mr-2" />
              <span>クレジットカード</span>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="convenience"
                checked={paymentMethod === 'convenience'}
                onChange={() => setPaymentMethod('convenience')}
                className="mr-3"
              />
              <span>コンビニ決済</span>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={() => setPaymentMethod('bank_transfer')}
                className="mr-3"
              />
              <span>銀行振込</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* 確定ボタン */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
          >
            ¥{totalPrice.toLocaleString()}を支払う
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationScreen;