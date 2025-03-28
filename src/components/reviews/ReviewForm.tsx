import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { submitReview } from '../../services/reviewService';

// 型定義問題を回避するためのサンプル実装
// getExperienceByIdのモック
const getExperienceById = async (id: string) => {
  // モック関数
  return {
    id,
    title: 'サンプル体験',
    date: '2025-04-01',
    time: '14:00',
  };
};

const ReviewForm: React.FC = () => {
  const { experienceId, attenderId } = useParams<{ experienceId?: string, attenderId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = new URLSearchParams(location.search).get('bookingId');

  const [experience, setExperience] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExperience = async () => {
      if (experienceId) {
        try {
          const data = await getExperienceById(experienceId);
          setExperience(data);
        } catch (err) {
          setError('体験情報の読み込みに失敗しました');
          console.error(err);
        }
      }
      setLoading(false);
    };

    loadExperience();
  }, [experienceId]);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handlePhotoUpload = (newPhotos: string[]) => {
    setPhotos([...photos, ...newPhotos]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('コメントを入力してください');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const reviewData = {
        attenderId: attenderId || '',
        experienceId,
        rating,
        comment,
        photos
      };
      
      await submitReview(reviewData);
      
      // 成功時のリダイレクト
      if (bookingId) {
        navigate(`/bookings/${bookingId}?reviewed=true`);
      } else if (experienceId) {
        navigate(`/experiences/${experienceId}?reviewed=true`);
      } else {
        navigate('/profile/reviews?success=true');
      }
    } catch (err) {
      console.error('レビュー投稿エラー:', err);
      setError('レビューの投稿に失敗しました');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <button 
          className="back-button" 
          onClick={() => navigate(-1)}
          aria-label="戻る"
        >
          <span>←</span>
        </button>
        <h1>レビューを投稿</h1>
      </div>
      
      {experience && (
        <div className="experience-summary">
          <h2>{experience.title}</h2>
          <p>{experience.date} • {experience.time}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-section">
          <p>この体験を評価してください</p>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className={`star ${star <= rating ? 'active' : ''}`}
                onClick={() => handleStarClick(star)}
                aria-label={`${star}星`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        <div className="comment-section">
          <label htmlFor="review-comment">体験についてのコメント</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="あなたの体験はいかがでしたか？他の利用者に役立つ情報を共有してください。"
            rows={6}
            required
          />
        </div>
        
        <div className="photos-section">
          <p>写真を追加（任意）</p>
          <div className="photo-upload-area">
            {/* 写真アップロードコンポーネントを表示（ここでは実装省略） */}
            <button type="button" className="upload-button">
              <span>+</span>
              写真を追加
            </button>
          </div>
          
          {photos.length > 0 && (
            <div className="photo-preview-area">
              {photos.map((photo, index) => (
                <div key={index} className="photo-preview">
                  <img src={photo} alt={`アップロード${index + 1}`} />
                  <button
                    type="button"
                    className="remove-photo"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    aria-label="写真を削除"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? '送信中...' : 'レビューを投稿'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
