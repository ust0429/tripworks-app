import React, { useState } from 'react';
import { Heart, MessageCircle, Check, AlertTriangle } from 'lucide-react';
import { TipAmount, TipData, TipOptions } from '../../types/tip';
import { AttenderInfo } from '../../types/booking';

interface TipFormProps {
  attender: AttenderInfo;
  bookingId: string;
  onSubmit: (tipData: TipData) => Promise<boolean>;
  options: TipOptions;
}

const TipForm: React.FC<TipFormProps> = ({ attender, bookingId, onSubmit, options }) => {
  const [selectedAmount, setSelectedAmount] = useState<TipAmount | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // 表示される金額オプション
  const tipAmounts = options.suggestedAmounts.length > 0 
    ? options.suggestedAmounts 
    : [500, 1000, 2000, 3000];

  // チップ金額の計算
  const calculateTipAmount = (): number => {
    if (!selectedAmount) return 0;
    if (selectedAmount === 'custom') {
      return parseInt(customAmount) || 0;
    }
    return selectedAmount;
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = calculateTipAmount();
    
    // バリデーション
    if (!finalAmount) {
      setError('チップ金額を選択または入力してください');
      return;
    }
    
    if (selectedAmount === 'custom') {
      if (finalAmount < options.minCustomAmount) {
        setError(`チップ金額は${options.minCustomAmount.toLocaleString()}円以上で入力してください`);
        return;
      }
      if (finalAmount > options.maxCustomAmount) {
        setError(`チップ金額は${options.maxCustomAmount.toLocaleString()}円以下で入力してください`);
        return;
      }
    }
    
    // 送信データ作成
    const tipData: TipData = {
      bookingId,
      attenderId: attender.id,
      amount: finalAmount,
      anonymous,
    };
    
    // メッセージが入力されている場合のみ追加
    if (options.allowMessage && message.trim()) {
      tipData.message = message.trim();
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await onSubmit(tipData);
      if (success) {
        setIsSuccess(true);
        // フォームをリセット
        setSelectedAmount(null);
        setCustomAmount('');
        setMessage('');
        setAnonymous(false);
      } else {
        setError('チップの送信に失敗しました。時間をおいて再度お試しください。');
      }
    } catch (err) {
      setError('予期せぬエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // カスタム金額の入力処理
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 数字のみ許可
    const value = e.target.value.replace(/[^\d]/g, '');
    setCustomAmount(value);
    // カスタム金額が入力されたら自動的にカスタムを選択
    if (value) {
      setSelectedAmount('custom');
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            チップを送信しました！
          </h3>
          <p className="text-gray-600 text-center">
            あなたのサポートはアテンダーの大きな励みになります。
            ありがとうございました。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0 mr-4">
          {attender.profileImage ? (
            <img
              src={attender.profileImage}
              alt={attender.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xl font-medium">
                {attender.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {attender.name} さんにチップを送る
          </h3>
          <p className="text-gray-600 text-sm">
            素晴らしい体験へのお礼として、チップでサポートしませんか？
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-md flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            チップ金額を選択
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {tipAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setSelectedAmount(amount as TipAmount)}
                className={`py-3 px-4 rounded-md font-medium ${
                  selectedAmount === amount
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {amount.toLocaleString()}円
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedAmount('custom')}
              className={`py-3 px-4 rounded-md font-medium ${
                selectedAmount === 'custom'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              カスタム
            </button>
          </div>

          {selectedAmount === 'custom' && (
            <div className="mt-3">
              <label htmlFor="customAmount" className="sr-only">
                カスタム金額
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="customAmount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="金額を入力"
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 py-3 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">円</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {options.minCustomAmount.toLocaleString()}円から
                {options.maxCustomAmount.toLocaleString()}円まで入力できます
              </p>
            </div>
          )}
        </div>

        {options.allowMessage && (
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              メッセージ (任意)
            </label>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-gray-400" />
              </div>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
                placeholder="アテンダーへのメッセージがあれば入力してください"
              />
            </div>
          </div>
        )}

        {options.allowAnonymous && (
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="anonymous"
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                匿名で送る
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 ml-6">
              チェックを入れると、アテンダーにはあなたの名前が表示されません
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedAmount}
          className={`w-full py-3 rounded-md flex items-center justify-center space-x-2 ${
            isSubmitting || !selectedAmount
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span>
            {isSubmitting
              ? '送信中...'
              : `${calculateTipAmount().toLocaleString()}円 チップを送る`}
          </span>
        </button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            チップは任意です。アテンダーへの感謝の気持ちとして送ることができます。
          </p>
        </div>
      </form>
    </div>
  );
};

export default TipForm;
