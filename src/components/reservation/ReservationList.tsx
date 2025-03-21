import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReservations } from '../../services/reservationService';
import { Reservation } from '../../types/reservation';
import ReservationCard from './ReservationCard';
// import { Tab } from '@headlessui/react';
import { Tab } from '../../mocks/headlessUIMock';
import { Loader } from 'lucide-react';

const ReservationList: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await getReservations();
        setReservations(data);
        setError(null);
      } catch (err) {
        setError('予約データの取得に失敗しました。後でもう一度お試しください。');
        console.error('Failed to fetch reservations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // 予約を「今後の予約」と「過去の予約」に分類
  const upcomingReservations = reservations.filter(
    (res) => new Date(res.dateTime) > new Date()
  );
  
  const pastReservations = reservations.filter(
    (res) => new Date(res.dateTime) <= new Date()
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">予約管理</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <Tab.Group>
          <Tab.List className="flex space-x-1 border-b border-gray-200 mb-6">
            <Tab
              className={({ selected }) =>
                `py-2 px-4 text-sm font-medium focus:outline-none ${
                  selected
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              今後の予約 ({upcomingReservations.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                `py-2 px-4 text-sm font-medium focus:outline-none ${
                  selected
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              過去の予約 ({pastReservations.length})
            </Tab>
          </Tab.List>
          
          <Tab.Panels>
            <Tab.Panel>
              {upcomingReservations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  現在、予約はありません。
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/explore')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      体験を探す
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      isUpcoming={true}
                    />
                  ))}
                </div>
              )}
            </Tab.Panel>
            
            <Tab.Panel>
              {pastReservations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  過去の予約はありません。
                </div>
              ) : (
                <div className="space-y-4">
                  {pastReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      isUpcoming={false}
                    />
                  ))}
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
};

export default ReservationList;