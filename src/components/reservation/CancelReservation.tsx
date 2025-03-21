import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReservationById, cancelReservation } from '../../services/reservationService';
import { Reservation } from '../../types/reservation';
// import { format } from 'date-fns';
// import { ja } from 'date-fns/locale';
import { format, ja } from '../../mocks/dateFnsMock';
import { AlertTriangle, ArrowLeft, Loader } from 'lucide-react';

const CancelReservation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getReservationById(id);
        setReservation(data);
        
        // 過去の予約はキャンセル不可
        if (new Date(data.dateTime) <= new Date()) {
          setError('過去の予約はキャンセルできません。');
        }
        // キャンセル期限を過ぎている場合
        else if (data.cancellationPolicy && 
                new Date(data.dateTime).getTime() - new Date().getTime() < 
                data.cancellationPolicy.hoursBeforeDeadline * 60 * 60 * 1000) {
          setError(`キャンセル期限を過ぎています。体験の${data.cancellationPolicy.hoursBeforeDeadline}時間前までにキャンセルする必要があります。`);
        }
      } catch (err) {
        setError('予約データの取得に失敗しました。');
        console.error('Failed to fetch reservation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  const handleCancel = async () => {
    if (!id || !reservation) return;
    
    try {
      setCancelling(true);
      await cancelReservation(id, cancellationReason);
      navigate('/reservations', { 
        state: { message: '予約をキャンセルしました。' } 
      });
    } catch (err) {
      setError('予約のキャンセルに失敗しました。後でもう一度お試しください。');
      console.error('Failed to cancel reservation:', err);
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex justify-center">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          戻る
        </button>
        
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium">エラー</h3>
              <p>{error || '予約情報が見つかりませんでした。'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = format(
    new Date(reservation.dateTime),
    'yyyy年M月d日(E) HH:mm',
    { locale: ja }
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        戻る
      </button>
      
      <h1 className="text-2xl font-bold mb-6">予約のキャンセル</h1>
      
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">{reservation.experience.title}</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">予約日時:</span>
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">場所:</span>
            <span>{reservation.experience.location}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">参加人数:</span>
            <span>{reservation.numberOfPeople}人</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">合計金額:</span>
            <span>¥{reservation.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* キャンセルポリシー情報 */}
      {reservation.cancellationPolicy && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">キャンセルポリシー</h3>
          <p className="text-sm">{reservation.cancellationPolicy.description}</p>
        </div>
      )}
      
      {/* キャンセル理由入力 */}
      <div className="mb-6">
        <label 
          htmlFor="cancellationReason" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          キャンセル理由 (任意)
        </label>
        <textarea
          id="cancellationReason"
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="キャンセルの理由をお知らせください"
        />
      </div>
      
      {/* キャンセル確認 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
          disabled={cancelling}
        >
          キャンセルせずに戻る
        </button>
        
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center"
          disabled={cancelling}
        >
          {cancelling ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              処理中...
            </>
          ) : (
            '予約をキャンセルする'
          )}
        </button>
      </div>
    </div>
  );
};

export default CancelReservation;