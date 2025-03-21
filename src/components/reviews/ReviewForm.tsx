import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getExperienceById } from '../../services/experienceService';
import { submitReview } from '../../services/reviewService';
import { Experience } from '../../types/experience';
import { Star, Loader, ArrowLeft, Camera } from 'lucide-react';
import FileUploader from '../common/FileUploader';

const ReviewForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const reservationId = location.state?.reservationId;
  
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const fetchExperience = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getExperienceById(id);
        setExperience(data);
      } catch (err) {
        setError('体験情報の取得に失敗しました。');
        console.error('Failed to fetch experience:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id]);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleRatingHover = (value: number) => {
    setHoverRating(value);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handlePhotoUpload = (url: string) => {
    setPhotos([...photos, url]);
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('評価を選択してください。');
      return;
    }
    
    if (!id) return;
    
    try {
      setSubmitting(true);
      await submitReview({
        experienceId: id,
        reservationId: reservationId || '',
        rating,
        comment,
        photos,
        isAnonymous
      });
      
      navigate('/my-reviews', { 
        state: { message: 'レビューを投稿しました。ありがとうございます！' } 
      });
    } catch (err) {
      setError('レビューの投稿に失敗しました。後でもう一度お試しください。');
      console.error('Failed to submit review:', err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex justify-center">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          体験情報が見つかりませんでした。
        </div>
        <button
          onClick={() => navigate('/reservations')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          予約一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        戻る
      </button>
      
      <h1 className="text-2xl font-bold mb-2">レビューを書く</h1>
      <h2 className="text-lg text-gray-700 mb-6">{experience.title}</h2>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* 評価（星） */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            体験はいかがでしたか？
          </label>
          
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => handleRatingHover(value)}
                onMouseLeave={handleRatingLeave}
                className="p-1"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= value
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            
            <span className="ml-2 text-sm text-gray-500">
              {rating > 0 ? '選択済み' : '選択してください'}
            </span>
          </div>
        </div>
        
        {/* コメント */}
        <div className="mb-6">
          <label 
            htmlFor="comment" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            コメント
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={5}
            placeholder="体験の感想を教えてください..."
            required
          />
        </div>
        
        {/* 写真アップロード */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            写真
          </label>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo}
                  alt={`体験の写真 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            
            {photos.length < 5 && (
              <div className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <FileUploader
                  onUploadComplete={handlePhotoUpload}
                  acceptedFileTypes="image/*"
                  buttonLabel={
                    <div className="flex flex-col items-center">
                      <Camera className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-500">写真を追加</span>
                    </div>
                  }
                />
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            最大5枚まで追加できます。
          </p>
        </div>
        
        {/* 匿名投稿オプション */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="isAnonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700">
              匿名で投稿する
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            チェックを入れると、レビューにあなたの名前が表示されません。
          </p>
        </div>
        
        {/* 送信ボタン */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                投稿中...
              </>
            ) : (
              'レビューを投稿'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;