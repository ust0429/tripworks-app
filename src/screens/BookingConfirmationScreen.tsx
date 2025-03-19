import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, MapPin, DollarSign, CreditCard, ArrowRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { BookingData } from '../types/booking';
import { usePayment } from '../contexts/PaymentContext';
import PaymentForm from '../components/payment/PaymentForm';
import TipSection from '../components/tip/TipSection';

// モックデータ（実際の実装ではAPIから取得）
const mockBookingData: BookingData = {
  id: 'booking-123',
  status: 'confirmed',
  experienceTitle: '京都の裏路地アート巡り',
  date: '2025-04-15',
  startTime: '13:00',
  endTime: '16:00',
  duration: 180,
  attender: {
    id: 'attender-456',
    name: '鈴木 アート',
    profileImage: '',
    specialties: ['現代アート', '裏路地散策', '地元文化'],
    rating: 4.8,
    reviewCount: 24
  },
  location: {
    name: '京都市役所前',
    address: '京都府京都市中京区寺町通御池上る上本能寺前町488'
  },
  participants: 2,
  basePrice: 5000,
  optionPrice: 1000,
  taxAmount: 600,
  totalAmount: 6600,
  cancellationPolicy: '予約日の3日前まで全額返金、それ以降は返金不可',
  createdAt: '2025-03-15T10:30:00Z'
};

const BookingConfirmationScreen: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { setBookingData, bookingData: contextBookingData } = usePayment();
  
  const [bookingData, setLocalBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 実際の実装ではAPIからデータを取得
        // ここではモックデータを使用
        await new Promise(resolve => setTimeout(resolve, 500));
        setLocalBookingData(mockBookingData);
        
        // PaymentContextにも設定
        setBookingData(mockBookingData);
      } catch (err) {
        setError('予約情報の取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingData();
  }, [bookingId, setBookingData]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 font-medium">予約情報を読み込み中です...</p>
          <p className="text-gray-500 text-sm mt-2">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  // 決済完了時のハンドラー
  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      setIsLoading(true);
      // 実際の実装ではAPI呼び出しを行う
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPaymentComplete(true);
      
      // 成功通知
      // トースト通知または施策によって出し分ける
      if (paymentData.paymentMethod === 'credit_card') {
        // クレジットカード決済の場合、即時完了
        // 1秒後に予約履歴ページに遷移
        setTimeout(() => {
          navigate('/bookings/history');
        }, 2000);
      } else {
        // 他の決済方法の場合、完了メッセージを表示
        alert(`${getPaymentMethodDisplayName(paymentData.paymentMethod)}でのお支払い手続きを受け付けました。\n詳細はメールでご確認ください。`);
        // 予約履歴ページに遷移
        navigate('/bookings/history');
      }
    } catch (error) {
      console.error('Payment error:', error);
      // エラー内容に応じたメッセージ表示
      const errorMessage = determineErrorMessage(error);
      alert(`支払い処理中にエラーが発生しました。\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 決済方法の表示名を取得
  const getPaymentMethodDisplayName = (method: string): string => {
    switch (method) {
      case 'credit_card': return 'クレジットカード';
      case 'convenience': return 'コンビニ払い';
      case 'bank_transfer': return '銀行振込';
      case 'qr_code': return 'QRコード決済';
      default: return '選択された決済方法';
    }
  };

  // エラーメッセージを判定
  const determineErrorMessage = (error: any): string => {
    // エラーオブジェクトから適切なメッセージを抗出
    if (error?.response?.status === 400) {
      return '入力情報に誤りがあります。入力内容をご確認ください。';
    } else if (error?.response?.status === 402) {
      return '決済が拒否されました。別のお支払い方法をお試しください。';
    } else if (error?.response?.status === 500) {
      return 'サーバー側でエラーが発生しました。時間をおいて再度お試しください。';
    }
    // 通信エラー
    if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
      return 'ネットワークの接続が不安定です。接続をご確認の上再度お試しください。';
    }
    // デフォルトメッセージ
    return '予期せぬエラーが発生しました。時間をおいて再度お試しください。';
  };

  // 支払いキャンセル時のハンドラー
  const handlePaymentCancel = () => {
    // 確認ダイアログを表示
    if (window.confirm('支払い操作をキャンセルしますか？\n入力した情報は保存されません。')) {
      setShowPaymentForm(false);
      // 必要に応じてリセット処理を追加
      // 例: フォームの状態をリセットするなど
    }
    // キャンセルを選択しなかった場合は何もしない
  };

  if (error || !bookingData) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 p-6 rounded-md shadow-sm border border-red-200">
          <div className="flex items-start mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-red-700 mb-2">予約情報の読み込みに失敗しました</h2>
              <p className="text-red-700">{error || '予約情報が見つかりません。'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">以下の対応をお試しください：</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>ページを再読み込みしてください</li>
              <li>インターネット接続を確認してください</li>
              <li>時間をおいて再度お試しください</li>
            </ul>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                再読み込み
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                予約一覧に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">予約確認</h1>
      
      {/* 予約概要 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{bookingData.experienceTitle}</h2>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
            <div>
              <p className="text-gray-800">
                {new Date(bookingData.date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-gray-400 mt-1 mr-3" />
            <div>
              <p className="text-gray-800">
                {bookingData.startTime} 〜 {bookingData.endTime}（{bookingData.duration}分）
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Users className="w-5 h-5 text-gray-400 mt-1 mr-3" />
            <div>
              <p className="text-gray-800">{bookingData.participants}名</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
            <div>
              <p className="text-gray-800">{bookingData.location.name}</p>
              <p className="text-gray-600 text-sm">{bookingData.location.address}</p>
              <button 
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(bookingData.location.address)}`, '_blank')}
                className="text-blue-600 text-sm hover:underline mt-1 inline-flex items-center"
              >
                地図で確認する
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-800 mb-3">アテンダー</h3>
          <div className="flex items-center">
            {bookingData.attender.profileImage ? (
              <img
                src={bookingData.attender.profileImage}
                alt={bookingData.attender.name}
                className="w-12 h-12 rounded-full mr-3 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <span className="text-gray-500 font-medium">
                  {bookingData.attender.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-800">{bookingData.attender.name}</p>
              <div className="flex text-sm text-gray-600">
                <span className="mr-2">評価: {bookingData.attender.rating}</span>
                <span>レビュー: {bookingData.attender.reviewCount}件</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 料金詳細 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="font-medium text-gray-800 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
          料金詳細
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">基本料金（{bookingData.participants}名）</span>
            <span className="text-gray-800">{bookingData.basePrice.toLocaleString()}円</span>
          </div>
          
          {bookingData.optionPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">オプション料金</span>
              <span className="text-gray-800">{bookingData.optionPrice.toLocaleString()}円</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">消費税</span>
            <span className="text-gray-800">{bookingData.taxAmount.toLocaleString()}円</span>
          </div>
          
          <div className="flex justify-between pt-3 border-t border-gray-200 font-medium">
            <span className="text-gray-800">合計</span>
            <span className="text-gray-900 text-lg">{bookingData.totalAmount.toLocaleString()}円</span>
          </div>
        </div>
      </div>
      
      {/* キャンセルポリシー */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="font-medium text-gray-800 mb-2">キャンセルポリシー</h3>
        <p className="text-gray-600">{bookingData.cancellationPolicy}</p>
      </div>
      
      {/* チップセクション */}
      <TipSection booking={bookingData} />
      

      
      {/* 決済セクション */}
      <div className="mt-6">
        {paymentComplete ? (
          <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-green-800 font-medium text-lg mb-2">お支払いが完了しました</h3>
            <p className="text-green-700 mb-4">ご予約の詳細は登録されたメールアドレスに送信されます。</p>
            <button
              onClick={() => navigate('/bookings/history')}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              予約履歴を見る
            </button>
          </div>
        ) : showPaymentForm ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium text-lg text-gray-800 flex items-center">
                <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                お支払い情報
              </h3>
              <button 
                onClick={handlePaymentCancel}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="閉じる"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <PaymentForm 
              totalAmount={bookingData.totalAmount} 
              onPaymentSubmit={handlePaymentSubmit}
              onCancel={handlePaymentCancel}
            />
          </div>
        ) : (
          <div>
            <h3 className="font-medium text-gray-800 mb-4">お支払い方法を選択して予約を確定します</h3>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="mr-2">お支払いに進む</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  if (window.confirm('予約をキャンセルしますか？')) {
                    // キャンセル処理
                    navigate('/bookings');
                  }
                }}
                className="text-gray-500 hover:text-gray-700 hover:underline text-sm"
              >
                予約をキャンセルする
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 注意事項 */}
      <div className="mt-6 text-sm text-gray-500 space-y-1">
        <p>※ お支払いは、クレジットカード、コンビニ支払い、銀行振込、QRコード決済がご利用いただけます。</p>
        <p>※ 予約内容に関するお問い合わせは、予約番号をお伝えください。</p>
      </div>
    </div>
  );
};

export default BookingConfirmationScreen;
