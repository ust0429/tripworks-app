import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAttenderDetails, getAttenderExperiences } from '../../../services/AttenderService';
import { getAttenderReviews } from '../../../services/ReviewService';
import { AttenderProfile as AttenderProfileType, ExperienceSample } from '../../../services/AttenderService';

const AttenderProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [attender, setAttender] = useState<AttenderProfileType | null>(null);
  const [experiences, setExperiences] = useState<ExperienceSample[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttenderData = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        
        // アテンダー詳細を取得
        const attenderData = await getAttenderDetails(id);
        if (attenderData) {
          setAttender(attenderData);
          
          // 関連データを並行して取得
          const [experiencesData, reviewsData] = await Promise.all([
            getAttenderExperiences(id, true), // アクティブな体験のみ
            getAttenderReviews(id, 5) // 最新5件のレビュー
          ]);
          
          setExperiences(experiencesData);
          setReviews(reviewsData);
        } else {
          setError('アテンダー情報が見つかりませんでした');
        }
      } catch (err) {
        console.error('アテンダー情報取得エラー:', err);
        setError('アテンダー情報の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchAttenderData();
  }, [id]);

  // 読み込み中表示
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // エラー表示
  if (error || !attender) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        <h2 className="text-xl font-bold mb-2">エラー</h2>
        <p>{error || 'アテンダー情報を取得できませんでした'}</p>
        <Link to="/attenders" className="mt-4 inline-block text-blue-500 hover:underline">
          アテンダー一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* アテンダーヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          {/* プロフィール画像 */}
          <div className="md:w-1/3 flex justify-center mb-4 md:mb-0">
            <div className="h-48 w-48 rounded-full overflow-hidden bg-gray-200">
              {attender.profilePhoto ? (
                <img 
                  src={attender.profilePhoto} 
                  alt={attender.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                  No Image
                </div>
              )}
            </div>
          </div>
          
          {/* プロフィール情報 */}
          <div className="md:w-2/3 md:pl-6">
            <h1 className="text-2xl font-bold mb-2">{attender.name}</h1>
            
            {/* 評価 */}
            <div className="flex items-center mb-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.floor(attender.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {attender.averageRating.toFixed(1)} ({attender.reviewCount}件のレビュー)
              </span>
            </div>
            
            {/* 地域 */}
            <div className="mb-3">
              <span className="text-gray-600">活動地域: {attender.location}</span>
            </div>
            
            {/* 専門分野 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {attender.specialties.map((specialty, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {specialty}
                </span>
              ))}
            </div>
            
            {/* 地元/移住 */}
            <div className="flex flex-wrap gap-3 mb-4">
              {attender.isLocalResident && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  地元住民
                </span>
              )}
              {attender.isMigrant && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  移住者 {attender.yearsMoved && `(${attender.yearsMoved}年前)`}
                </span>
              )}
            </div>
            
            {/* 言語 */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">対応言語</h3>
              <div className="flex flex-wrap gap-2">
                {attender.languages.map((lang, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {lang.language} ({getProficiencyLabel(lang.proficiency)})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* 自己紹介 */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">自己紹介</h3>
          <p className="text-gray-700 whitespace-pre-line">{attender.bio}</p>
        </div>
      </div>
      
      {/* 体験サンプル */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">提供可能な体験</h2>
          <Link 
            to={`/attenders/${id}/experiences`}
            className="text-blue-500 hover:underline text-sm"
          >
            すべて見る
          </Link>
        </div>
        
        {experiences.length === 0 ? (
          <p className="text-gray-500">現在提供可能な体験はありません</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiences.slice(0, 4).map((experience) => (
              <div key={experience.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <Link to={`/experiences/${experience.id}`}>
                  <div className="h-40 bg-gray-200 rounded-md mb-3 overflow-hidden">
                    {experience.images && experience.images.length > 0 ? (
                      <img 
                        src={experience.images[0]} 
                        alt={experience.title} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{experience.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {experience.estimatedDuration}分 · {experience.price?.toLocaleString()}円
                  </p>
                  <p className="text-gray-700 text-sm line-clamp-2">{experience.description}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* レビュー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">レビュー</h2>
          <Link 
            to={`/attenders/${id}/reviews`}
            className="text-blue-500 hover:underline text-sm"
          >
            すべて見る
          </Link>
        </div>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500">まだレビューはありません</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                    {review.userPhotoUrl ? (
                      <img 
                        src={review.userPhotoUrl} 
                        alt={review.userDisplayName} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                        U
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{review.userDisplayName || 'ゲスト'}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <div className="flex text-yellow-400 my-1">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    
                    {/* レビュー画像がある場合 */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex mt-2 space-x-2 overflow-x-auto">
                        {review.photos.map((photo: string, idx: number) => (
                          <div key={idx} className="h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                            <img 
                              src={photo} 
                              alt={`レビュー画像 ${idx + 1}`} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 「役に立った」ボタン */}
                    <div className="mt-2 text-sm text-gray-500">
                      <button className="hover:text-blue-500">
                        役に立った ({review.helpfulCount})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 言語レベルのラベル取得
function getProficiencyLabel(proficiency: string): string {
  switch (proficiency) {
    case 'native':
      return 'ネイティブ';
    case 'advanced':
      return '上級';
    case 'intermediate':
      return '中級';
    case 'beginner':
      return '初級';
    default:
      return proficiency;
  }
}

// 日付のフォーマット
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export default AttenderProfile;
