// src/components/ReviewForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Star, Image, X, Camera, Upload, AlertCircle, Loader } from 'lucide-react';
import { processImage, isSupportedImageType, convertHeicToJpeg } from '../utils/imageUtils';

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
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // 画面サイズの変更を監視
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // モバイルかどうかを判定
  const isMobile = screenWidth < 768;

  // 写真を追加
  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadErrors([]);
    const files = e.target.files;
    console.log('写真選択イベント:', { 
      filesExist: Boolean(files), 
      filesCount: files ? files.length : 0,
      currentPhotosCount: photos.length
    });
    
    if (!files || files.length === 0) return;

    // 5枚までの制限を確認
    if (photos.length + files.length > 5) {
      setUploadErrors([...uploadErrors, '写真は最大5枚までアップロードできます']);
      return;
    }

    setIsProcessing(true);
    
    // 新しい写真を追加
    const newPhotos = [...photos];
    const newPreviewUrls = [...previewUrls];
    const newErrors: string[] = [];
    
    console.log('写真データ処理開始:', {  
      filesCount: files.length,
      fileDetails: Array.from(files).map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      }))
    });

    // ファイル処理を並列で行う
    const filePromises = Array.from(files).map(async (file) => {
      try {
        // ファイルサイズ上限チェック (10MB)
        if (file.size > 10 * 1024 * 1024) {
          newErrors.push(`ファイル「${file.name}」のサイズが大きすぎます（上限10MB）`);
          return null;
        }

        // HEIC/HEIF形式の場合はJPEGに変換
        let processFile = file;
        if (/^image\/(heic|heif)$/i.test(file.type)) {
          processFile = await convertHeicToJpeg(file);
        }

        // アップロード可能な形式かチェック
        if (!isSupportedImageType(processFile.type)) {
          newErrors.push(`ファイル「${processFile.name}」は対応していない形式です`);
          return null;
        }

        // 画像処理（圧縮とEXIF除去）
        const optimizedFile = await processImage(processFile, {
          quality: 0.85,
          maxWidth: 1920,
          maxHeight: 1080,
          removeExif: true
        });

        console.log(`写真処理完了: ${file.name} (${file.size} bytes) → ${optimizedFile.name} (${optimizedFile.size} bytes)`);
        
        // プレビュー画像の生成
        return new Promise<{ file: File, dataUrl: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && typeof e.target.result === 'string') {
              resolve({
                file: optimizedFile,
                dataUrl: e.target.result
              });
            }
          };
          reader.readAsDataURL(optimizedFile);
        });
      } catch (error) {
        console.error('画像処理エラー:', error);
        newErrors.push(`ファイル「${file.name}」の処理中にエラーが発生しました`);
        return null;
      }
    });

    // すべてのファイル処理が完了するのを待つ
    const results = await Promise.all(filePromises);
    
    // 有効な結果だけを抽出
    results.forEach(result => {
      if (result) {
        newPhotos.push(result.file);
        newPreviewUrls.push(result.dataUrl);
      }
    });

    setPhotos(newPhotos);
    setPreviewUrls(newPreviewUrls);
    setUploadErrors(newErrors);
    setIsProcessing(false);
    console.log('写真データ登録完了:', { 
      newCount: newPhotos.length,
      errors: newErrors.length > 0 ? newErrors : 'なし'
    });

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
      if (isMobile) {
        fileInputRef.current.setAttribute('capture', 'environment');
      }
      fileInputRef.current.click();
      
      // 確認メッセージ
      console.log('カメラ起動リクエスト:', { 
        accept: fileInputRef.current.accept,
        captureAttr: fileInputRef.current.getAttribute('capture'),
        isMobile
      });
      
      // クリック後にキャプチャ属性を削除して、次回のファイル選択に影響しないようにする
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.removeAttribute('capture');
        }
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (rating === 0) {
      setUploadErrors([...uploadErrors, '評価を選択してください']);
      return;
    }
    
    if (!comment.trim()) {
      setUploadErrors([...uploadErrors, 'コメントを入力してください']);
      return;
    }
    
    setIsProcessing(true);
    
    try {
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

      // フォーム送信処理
      onSubmit({ rating, comment, photos: photoData });
    } catch (error) {
      console.error('レビュー送信エラー:', error);
      setUploadErrors([...uploadErrors, 'レビューの送信中にエラーが発生しました']);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-mono-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-bold mb-4 text-mono-black">
        「{experienceTitle}」のレビューを投稿
      </h3>
      
      {/* エラーメッセージ表示 */}
      {uploadErrors.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center text-red-800 mb-1">
            <AlertCircle size={16} className="mr-1" />
            <span className="font-medium">以下のエラーが発生しました:</span>
          </div>
          <ul className="list-disc pl-5 text-sm text-red-700">
            {uploadErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 星評価 */}
        <div>
          <p className="text-sm font-medium text-mono-black mb-2">評価</p>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl focus:outline-none"
                aria-label={`${star}点`}
              >
                <Star
                  size={24}
                  className={`${
                    (hoverRating || rating) >= star
                      ? 'text-yellow-500 fill-current'
                      : 'text-mono-gray-light'
                  }`}
                  fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-mono-gray-medium" aria-live="polite">
              {rating > 0 ? `${rating}点` : ''}
            </span>
          </div>
        </div>
        
        {/* コメント */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-mono-black mb-1">
            コメント <span className="text-mono-gray-medium text-xs">(必須)</span>
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="体験の感想を詳しく書いてください..."
            className="w-full p-3 border border-mono-light rounded-lg focus:ring-mono-black focus:border-mono-gray-medium"
            required
            aria-required="true"
          />
          <p className="text-xs text-mono-gray-medium mt-1">
            {comment.length}/1000文字
          </p>
        </div>

        {/* 写真アップロード */}
        <div>
          <p className="text-sm font-medium text-mono-black mb-2">写真を追加 (最大5枚)</p>
          
          {/* プレビュー表示 */}
          <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-5'} gap-2 mb-2`}>
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square bg-mono-lighter rounded-lg overflow-hidden">
                <img src={url} alt={`プレビュー ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-mono-black bg-opacity-50 rounded-full p-1 text-mono-white hover:bg-opacity-70"
                  aria-label={`写真${index + 1}を削除`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {/* 空のプレビュースロット */}
            {Array.from({ length: Math.min(isMobile ? 3 : 5, 5 - previewUrls.length) }).map((_, index) => (
              <div 
                key={`empty-${index}`} 
                className="aspect-square bg-mono-lighter rounded-lg flex items-center justify-center flex-col cursor-pointer hover:bg-mono-light"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                aria-label="写真を追加"
                tabIndex={0}
              >
                <Upload size={20} className="text-mono-gray-medium mb-1" />
                <span className="text-xs text-mono-gray-medium">写真を追加</span>
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
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center px-3 py-2 bg-mono-lighter hover:bg-mono-light rounded-lg text-sm font-medium text-mono-black flex-1"
              disabled={photos.length >= 5 || isProcessing}
              aria-disabled={photos.length >= 5 || isProcessing}
            >
              {isProcessing ? (
                <Loader size={16} className="mr-2 animate-spin" />
              ) : (
                <Upload size={16} className="mr-2 text-mono-gray-medium" />
              )}
              写真を選択
            </button>
            {isMobile && (
              <button
                type="button"
                onClick={handleOpenCamera}
                className="flex items-center justify-center px-3 py-2 bg-mono-lighter hover:bg-mono-light rounded-lg text-sm font-medium text-mono-black flex-1"
                disabled={photos.length >= 5 || isProcessing}
                aria-disabled={photos.length >= 5 || isProcessing}
              >
                <Camera size={16} className="mr-2 text-mono-gray-medium" />
                カメラ
              </button>
            )}
          </div>
          
          {/* 注意書き */}
          <p className="text-xs text-mono-gray-light mt-1">
            写真は日付と場所の情報（EXIF）を除去して自動的に圧縮されます。
          </p>
        </div>
        
        {/* ボタン */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-mono-light rounded-lg font-medium text-mono-dark hover:bg-mono-lighter transition-colors duration-200"
            disabled={isProcessing}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 py-2 bg-mono-black text-mono-white rounded-lg font-medium hover:bg-mono-dark transition-colors duration-200 disabled:bg-mono-gray-light"
            disabled={rating === 0 || !comment.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader size={16} className="inline mr-2 animate-spin" />
                処理中...
              </>
            ) : (
              '投稿する'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;