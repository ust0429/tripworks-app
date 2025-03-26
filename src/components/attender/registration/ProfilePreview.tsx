import React from 'react';
import { AttenderApplicationData } from '../../../types/attender';
import { User, Clock, MapPin, Tag, Star, Calendar, Image as ImageIcon } from 'lucide-react';
// next/image は React アプリでは利用できないので標準の img タグを使用

interface ProfilePreviewProps {
  data: Partial<AttenderApplicationData>;
  onClose: () => void;
}

/**
 * アテンダープロフィールのプレビュー表示コンポーネント
 * 
 * 入力データから生成される実際のプロフィールをプレビュー表示する
 */
const ProfilePreview: React.FC<ProfilePreviewProps> = ({ data, onClose }) => {
  // 利用可能時間を整形して表示する関数
  const formatAvailability = () => {
    if (!data.availability) return '情報なし';
    
    const daysOfWeek = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    return (
      <div className="grid grid-cols-1 gap-1">
        {daysOfWeek.map((day, index) => {
          const dayData = data.availability?.[`day${index+1}`];
          if (!dayData || !dayData.available) return null;
          
          return (
            <div key={day} className="flex items-center">
              <span className="font-medium w-20">{day}:</span>
              <span>
                {dayData.slots.map((slot: { startTime: string; endTime: string }, i: number) => (
                  <span key={i} className="text-sm">
                    {slot.startTime}〜{slot.endTime}{i < dayData.slots.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">アテンダープロフィールプレビュー</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {/* ヘッダー情報 */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* プロフィール画像 */}
            <div className="w-32 h-32 relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
              {data.profileImage ? (
                <img 
                  src={data.profileImage} 
                  alt={data.name || 'プロフィール'} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{data.name || '名前未設定'}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {data.expertise?.map((skill, index) => (
                  <span key={index} className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-1 text-gray-600 mb-2">
                <MapPin size={16} />
                <span>{data.location || '場所未設定'}</span>
              </div>
              
              <div className="flex items-center gap-1 text-gray-600">
                <Star size={16} />
                <span>新規アテンダー</span>
              </div>
            </div>
          </div>
          
          {/* 自己紹介 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">自己紹介</h2>
            <p className="whitespace-pre-line">{data.bio || '自己紹介文が設定されていません。'}</p>
          </div>
          
          {/* 専門分野 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3 border-b pb-2 flex items-center gap-2">
              <Tag size={18} />
              専門分野
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.expertise?.length ? (
                data.expertise.map((skill, index) => (
                  <span key={index} className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">専門分野が設定されていません。</p>
              )}
            </div>
          </div>
          
          {/* 体験サンプル */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3 border-b pb-2 flex items-center gap-2">
              <ImageIcon size={18} />
              体験サンプル
            </h2>
            
            {data.experienceSamples?.length ? (
              <div className="space-y-6">
                {data.experienceSamples.map((sample, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-2">{sample.title}</h3>
                    <p className="mb-4 text-gray-700">{sample.description}</p>
                    
                    {sample.images?.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {sample.images.map((img: string, imgIndex: number) => (
                          <div key={imgIndex} className="aspect-square relative rounded-md overflow-hidden bg-gray-100">
                            <img src={img} alt={`体験サンプル ${index+1} 画像 ${imgIndex+1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">画像がありません</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">体験サンプルが設定されていません。</p>
            )}
          </div>
          
          {/* 利用可能時間 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3 border-b pb-2 flex items-center gap-2">
              <Clock size={18} />
              利用可能時間
            </h2>
            {formatAvailability()}
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            閉じる
          </button>
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>プレビュー作成日: {new Date().toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;