// src/components/ReviewForm.tsx
import React, { useState, useRef } from 'react';
import { Star, Image, X, Camera, Upload } from 'lucide-react';

interface ReviewFormProps {
  attenderId: number;
  experienceTitle: string;
  onSubmit: (review: { rating: number; comment: string; photos?: File[] }) => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  attenderId, 
  experienceTitle, 
  onSubmit, 
  onCancel 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 写真を追加
  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('写真選択イベント:', { 
      filesExist: Boolean(files), 
      filesCount: files ? files.length : 0,
      currentPhotosCount: photos.length
    });
    
    if (!files) return;

    // 5枚までの制限を確認
    if (photos.length + files.length > 5) {
      alert('写真は最大5枚までアップロードできます');
      return;
    }

    // 新しい写真を追加
    const newPhotos = [...photos];
    const newPreviewUrls = [...previewUrls];
    
    console.log('写真データ処理開始:', {  
      filesCount: files.length,
      fileDetails: Array.from(files).map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      }))
    });

    Array.from(files).forEach(file => {
      // ファイルサイズ上限チェック (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`ファイル「${file.name}」のサイズが大きすぎます（上限10MB）`);
        return;
      }

      // アップロード可能な形式かチェック
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(`ファイル「${file.name}」は対応していない形式です`);
        return;
      }

      newPhotos.push(file);
      console.log(`写真追加: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      // プレビュー画像の生成
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          newPreviewUrls.push(e.target.result);
          console.log(`プレビュー URL 生成済み: ${newPreviewUrls.length}個目`);
          setPreviewUrls([...newPreviewUrls]);
        }
      };
      reader.readAsDataURL(file);
    });

    setPhotos(newPhotos);
    console.log('写真データ登録完了:', { newCount: newPhotos.length });

    // ファイル選択をクリア（同じファイルを連続で選択可能にする）
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 写真を削除
  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newPreviewUrls = [...previewUrls];
    
    newPhotos.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setPhotos(newPhotos);
    setPreviewUrls(newPreviewUrls);
  };

  // カメラを起動
  const handleOpenCamera = () => {
    if (fileInputRef.current) {
      // 写真撮影用設定
      fileInputRef.current.accept = 'image/*';
      // モバイルデバイスではカメラを起動する
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
      
      // 確認メッセージ
      console.log('カメラ起動リクエスト:', { 
        accept: fileInputRef.current.accept,
        captureAttr: fileInputRef.current.getAttribute('capture')
      });
      
      // クリック後にキャプチャ属性を削除して、次回のファイル選択に影響しないようにする
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.removeAttribute('capture');
        }
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (rating === 0) {
      alert('評価を選択してください');
      return;
    }
    
    if (!comment.trim()) {
      alert('コメントを入力してください');
      return;
    }
    
    console.log('レビューフォーム送信:', { 
      rating, 
      commentLength: comment.length,
      photoCount: photos.length,
      photoDetails: photos.length > 0 ? photos.map(p => ({ name: p.name, type: p.type, size: p.size })) : []
    });
    
    // 取得した写真データをログ出力して確認
    const photoData = photos.length > 0 ? photos : undefined;
    if (photoData) {
      console.log(`レビュー送信: ${photoData.length}枚の写真を送信します:`, 
        photoData.map(p => `${p.name} (${p.type}, ${p.size} bytes)`));
    } else {
      console.log('レビュー送信: 写真なし');
    }

    onSubmit({ rating, comment, photos: photoData });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">
        「{experienceTitle}」のレビューを投稿
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 星評価 */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">評価</p>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl focus:outline-none"
              >
                <Star
                  size={24}
                  className={`${
                    (hoverRating || rating) >= star
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                  fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* コメント */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            コメント <span className="text-gray-500 text-xs">(必須)</span>
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="体験の感想を詳しく書いてください..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
            required
          />
        </div>

        {/* 写真アップロード */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">写真を追加 (最大5枚)</p>
          
          {/* プレビュー表示 */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src={url} alt={`プレビュー ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {/* 空のプレビュースロット */}
            {Array.from({ length: 5 - previewUrls.length }).map((_, index) => (
              <div 
                key={`empty-${index}`} 
                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center flex-col cursor-pointer hover:bg-gray-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} className="text-gray-500 mb-1" />
                <span className="text-xs text-gray-500">写真を追加</span>
              </div>
            ))}
          </div>
          
          {/* 写真追加ボタン */}
          <div className="flex space-x-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddPhoto}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex-1"
              disabled={photos.length >= 5}
            >
              <Upload size={16} className="mr-2" />
              写真を選択
            </button>
            <button
              type="button"
              onClick={handleOpenCamera}
              className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex-1"
              disabled={photos.length >= 5}
            >
              <Camera size={16} className="mr-2" />
              カメラ
            </button>
          </div>
          
          {/* 注意書き */}
          <p className="text-xs text-gray-500 mt-1">
            写真は日付と場所の情報（EXIF）を除去して投稿されます。
          </p>
        </div>
        
        {/* ボタン */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            disabled={rating === 0 || !comment.trim()}
          >
            投稿する
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;