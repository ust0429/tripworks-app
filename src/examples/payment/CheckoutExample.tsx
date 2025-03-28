import React, { useState } from 'react';
import { usePayment } from '../../contexts/PaymentContext';
import { 
  PaymentForm, 
  PaymentMethodSelector, 
  CheckoutSummary,
  PaymentResult
} from '../../components/payment';
import { PaymentResult as PaymentResultType } from '../../types/payment';

/**
 * 決済フローの使用例を示すサンプルコンポーネント
 */
const CheckoutExample: React.FC = () => {
  // PaymentContext から必要な関数と状態を取得
  const { 
    paymentMethods, 
    calculateTotal, 
    processPayment, 
    isLoading 
  } = usePayment();
  
  // 内部状態
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResultType | null>(null);
  
  // テスト用の予約情報
  const booking = {
    id: 'sample-booking-123',
    price: 5000,
    title: '東京音楽シーンツアー'
  };
  
  // 合計金額の計算
  const summary = calculateTotal(booking.price);
  
  // 新しいカードの追加完了時
  const handleNewCardComplete = (paymentMethodId: string) => {
    setSelectedPaymentMethodId(paymentMethodId);
    setShowNewCardForm(false);
  };
  
  // 支払い処理
  const handlePayment = async () => {
    if (!selectedPaymentMethodId) return;
    
    try {
      // processPayment 関数を呼び出して決済を実行
      const result = await processPayment(
        booking.id,
        summary.total,
        selectedPaymentMethodId,
        { bookingTitle: booking.title }
      );
      
      // 結果を保存
      setPaymentResult(result);
      
      // 成功時の処理
      if (result.success) {
        console.log('支払いが成功しました', result);
        // ここでリダイレクトや通知などを行う
      } else {
        console.error('支払いに失敗しました', result);
      }
    } catch (error) {
      console.error('支払い処理中にエラーが発生しました', error);
      setPaymentResult({
        success: false,
        message: '支払い処理中にエラーが発生しました',
        bookingId: booking.id
      });
    }
  };
  
  // 決済結果からの戻り
  const handleResultClose = () => {
    setPaymentResult(null);
  };
  
  // 決済結果が表示されている場合
  if (paymentResult) {
    return (
      <div className="max-w-md mx-auto p-4">
        <PaymentResult 
          result={paymentResult} 
          onClose={handleResultClose} 
        />
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">お支払い</h1>
      
      {/* 予約情報 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-2">予約内容</h2>
        <p className="text-gray-700">{booking.title}</p>
        <p className="text-gray-500 text-sm">予約ID: {booking.id}</p>
      </div>
      
      {/* 支払い金額サマリー */}
      <div className="mb-6">
        <CheckoutSummary 
          summary={summary}
          itemName="体験"
        />
      </div>
      
      {/* 支払い方法選択または新規カード追加 */}
      <div className="mb-6">
        {showNewCardForm ? (
          <PaymentForm
            onComplete={handleNewCardComplete}
            onCancel={() => setShowNewCardForm(false)}
          />
        ) : (
          <>
            <h2 className="text-lg font-bold mb-3">支払い方法</h2>
            {paymentMethods.length > 0 ? (
              <PaymentMethodSelector
                selectedId={selectedPaymentMethodId || undefined}
                onSelect={setSelectedPaymentMethodId}
                onAddNew={() => setShowNewCardForm(true)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <p className="text-gray-500 mb-4">保存された支払い方法はありません</p>
                <button
                  onClick={() => setShowNewCardForm(true)}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                >
                  カード情報を入力する
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 支払いボタン */}
      {!showNewCardForm && (
        <button
          onClick={handlePayment}
          disabled={!selectedPaymentMethodId || isLoading}
          className="w-full py-3 bg-black text-white rounded-lg font-medium disabled:bg-gray-400"
        >
          {isLoading ? '処理中...' : '支払いを確定する'}
        </button>
      )}
    </div>
  );
};

export default CheckoutExample;
