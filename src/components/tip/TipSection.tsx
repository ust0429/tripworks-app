import React, { useState, useEffect } from 'react';
import { Heart, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { BookingData } from '../../types/booking';
import { TipOptions, TipData } from '../../types/tip';
import { getTipOptions, sendTip, canReceiveTip } from '../../services/tipService';
import TipForm from './TipForm';

interface TipSectionProps {
  booking: BookingData;
}

const TipSection: React.FC<TipSectionProps> = ({ booking }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tipOptions, setTipOptions] = useState<TipOptions | null>(null);
  const [canTip, setCanTip] = useState<boolean>(false);

  useEffect(() => {
    const loadTipOptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // チップオプションを取得
        const options = await getTipOptions(booking.id);
        setTipOptions(options);
        
        // チップ可能かどうかを確認
        const tipAllowed = await canReceiveTip(booking.attender.id, booking.id);
        setCanTip(tipAllowed && options.enabled);
      } catch (err) {
        setError('チップ情報の読み込みに失敗しました。');
        setCanTip(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTipOptions();
  }, [booking.id, booking.attender.id]);

  // チップ送信処理
  const handleSendTip = async (tipData: TipData): Promise<boolean> => {
    try {
      const result = await sendTip(tipData);
      return result;
    } catch (err) {
      return false;
    }
  };

  // チップが無効の場合は何も表示しない
  if (!isLoading && (!tipOptions || !tipOptions.enabled || !canTip)) {
    return null;
  }

  // 予約状態に応じたチップ可否の判定
  const isTipableNow = (): boolean => {
    if (!tipOptions) return false;
    
    const bookingStatus = booking.status;
    const tipableState = tipOptions.tipableState;
    
    switch (tipableState) {
      case 'before':
        // 予約前のみ（未確定状態）
        return bookingStatus === 'pending';
      case 'during':
        // 予約中のみ（確定状態）
        return bookingStatus === 'confirmed';
      case 'after':
        // 予約後のみ（完了状態）
        return bookingStatus === 'completed';
      case 'anytime':
        // いつでも（キャンセル以外）
        return bookingStatus !== 'cancelled';
      default:
        return false;
    }
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
      {/* ヘッダー部分 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-white flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <span className="font-medium text-gray-800">アテンダーにチップを送る</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {/* 展開されるコンテンツ */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : !isTipableNow() ? (
            <div className="p-4 bg-yellow-50">
              <p className="text-sm text-yellow-700">
                現在の予約状態ではチップを送ることができません。
                {tipOptions?.tipableState === 'after' && '体験完了後にチップを送ることができます。'}
              </p>
            </div>
          ) : (
            <TipForm
              attender={booking.attender}
              bookingId={booking.id}
              onSubmit={handleSendTip}
              options={tipOptions as TipOptions}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TipSection;
