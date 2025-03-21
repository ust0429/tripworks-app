import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { format } from 'date-fns';
// import { ja } from 'date-fns/locale';
import { format, ja } from '../../mocks/dateFnsMock';
import { Reservation } from '../../types/reservation';
import { Calendar, Clock, MapPin, Users, Star } from 'lucide-react';

interface ReservationCardProps {
  reservation: Reservation;
  isUpcoming: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  isUpcoming,
}) => {
  const navigate = useNavigate();
  
  const date = new Date(reservation.dateTime);
  const formattedDate = format(date, 'yyyy年M月d日(E)', { locale: ja });
  const formattedTime = format(date, 'HH:mm', { locale: ja });

  // 予約詳細ページへ
  const handleViewDetails = () => {
    navigate(`/reservations/${reservation.id}`);
  };

  // レビュー投稿ページへ
  const handleWriteReview = () => {
    navigate(`/reviews/create/${reservation.experience.id}`, {
      state: { reservationId: reservation.id }
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* 体験の画像 */}
        <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
          <img
            src={reservation.experience.imageUrl}
            alt={reservation.experience.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* 予約情報 */}
        <div className="p-4 md:w-2/3 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium mb-2">{reservation.experience.title}</h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formattedTime} 〜 ({reservation.experience.duration}分)</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{reservation.experience.location}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>参加人数: {reservation.numberOfPeople}人</span>
              </div>
            </div>
          </div>
          
          {/* アクションボタン */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleViewDetails}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              詳細を見る
            </button>
            
            {isUpcoming ? (
              <button
                onClick={() => navigate(`/reservations/${reservation.id}/cancel`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                キャンセル
              </button>
            ) : !reservation.hasReview ? (
              <button
                onClick={handleWriteReview}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center"
              >
                <Star className="w-4 h-4 mr-1" />
                レビューを書く
              </button>
            ) : (
              <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                レビュー済み
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;