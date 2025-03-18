// src/components/ReviewModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Star, X, Camera, AlertCircle, Loader, Image, Trash2, RotateCw, Crop } from 'lucide-react';

interface ReviewModalProps {
  experienceName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, photos?: File[]) => void;
  isSubmitting?: boolean;
  error?: string | null;
  enableCamera?: boolean; // カメラ機能を有効にするか
  uploadProgress?: number; // アップロード進捗（0〜100）
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  experienceName, 
  onClose, 
  onSubmit,
  isSubmitting = false,
  error = null,
  enableCamera = false,
  uploadProgress = 0
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  
  // カメラ関連の参照
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 写真をプレビュー用に処理
  useEffect(() => {
    const urls = photos.map(photo => URL.createObjectURL(photo));
    setPhotoPreviewUrls(urls);
    
    // クリーンアップ関数
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos]);

  // カメラを有効にする
  const startCamera = async () => {
    try {
      setShowCamera(true);
      // カメラを有効にしようとしていることをユーザーに連絡
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('カメラはサポートされていません');
      }
      
      // カメラのアクセス許可をリクエスト
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('カメラアクセスエラー:', err);
      setShowCamera(false);
      alert('カメラへのアクセスが拒否されました。写真アップロードを代わりにお使いください。');
    }
  };
  
  // カメラを停止する
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setShowCamera(false);
  };
  
  // 写真を撮影
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Canvasにビデオフレームを描画
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Canvasの内容をBlobに変換
        canvas.toBlob((blob) => {
          if (blob) {
            // BlobをFileに変換
            const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            // 写真を追加
            setPhotos(prev => [...prev, file]);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (rating === 0) {
      setValidationError('評価を選択してください');
      return;
    }
    
    if (comment.trim().length < 5) {
      setValidationError('コメントは5文字以上入力してください');
      return;
    }
    
    setValidationError('');
    onSubmit(rating, comment, photos.length > 0 ? photos : undefined);
  };
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // 最大5枚までに制限
    const newPhotosArray = Array.from(files).slice(0, 5 - photos.length);
    
    if (photos.length + newPhotosArray.length > 5) {
      alert('写真は最大5枚までアップロードできます');
    }
    
    // 画像の圧縮処理
    const compressedPhotos: File[] = [];
    
    for (const file of newPhotosArray) {
      // 画像ファイルのみ圧縮
      if (file.type.startsWith('image/')) {
        try {
          const compressedFile = await compressImage(file);
          compressedPhotos.push(compressedFile);
        } catch (err) {
          console.error('画像圧縮エラー:', err);
          compressedPhotos.push(file); // 圧縮に失敗した場合は元のファイルを使用
        }
      } else {
        compressedPhotos.push(file);
      }
    }
    
    setPhotos(prev => [...prev, ...compressedPhotos]);
  };
  
  // 画像圧縮関数
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        if (!event.target?.result) {
          return reject(new Error('Failed to read file'));
        }
        
        const img = document.createElement('img');
        img.src = event.target.result as string;
        
        img.onload = () => {
          // 圧縮サイズの設定
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          let width = img.width;
          let height = img.height;
          
          // アスペクト比を維持しながらサイズを調整
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Failed to get canvas context'));
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // 画質の設定（0.6〜0.8がバランス良好）
          const quality = 0.7;
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error('Failed to create blob'));
              }
              
              // 新しいファイル名を生成
              const newFileName = `compressed_${file.name}`;
              const compressedFile = new File([blob], newFileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };
  
  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    if (selectedPhotoIndex === index) {
      setSelectedPhotoIndex(null);
    }
  };
  
  // 写真回転処理
  const rotatePhoto = async (index: number) => {
    if (isRotating) return;
    setIsRotating(true);
    
    try {
      const file = photos[index];
      const img = document.createElement('img');
      img.src = photoPreviewUrls[index];
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // エラー時も続行
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // 縦横を入れ替え
      canvas.width = img.height;
      canvas.height = img.width;
      
      // 回転して描画（90度時計回り）
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });
      
      if (!blob) {
        throw new Error('Failed to create blob');
      }
      
      // 回転したファイルを作成
      const rotatedFile = new File([blob], `rotated_${file.name}`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      // 回転した写真で元の写真を置き換え
      const newPhotos = [...photos];
      newPhotos[index] = rotatedFile;
      setPhotos(newPhotos);
      
      // プレビューURLを更新
      URL.revokeObjectURL(photoPreviewUrls[index]);
      const newPhotoPreviewUrls = [...photoPreviewUrls];
      newPhotoPreviewUrls[index] = URL.createObjectURL(rotatedFile);
      setPhotoPreviewUrls(newPhotoPreviewUrls);
    } catch (error) {
      console.error('写真回転エラー:', error);
      alert('写真の回転処理に失敗しました');
    } finally {
      setIsRotating(false);
    }
  };

  // レーティングラベルを取得
  const getRatingLabel = (rating: number): string => {
    switch(rating) {
      case 1: return '非常に不満';
      case 2: return '不満';
      case 3: return '普通';
      case 4: return '満足';
      case 5: return '非常に満足';
      default: return '';
    }
  };

  // モーダルが閉じられるときにカメラを停止する
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">体験レビューを投稿</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">{experienceName}</h3>
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600 mb-2">体験の評価</p>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                  >
                    <Star
                      size={32}
                      className={
                        (hoverRating || rating) >= star
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
              {(rating > 0 || hoverRating > 0) && (
                <div className="text-center text-sm font-medium text-gray-700">
                  {getRatingLabel(hoverRating || rating)}
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* バリデーションエラーまたはAPIエラー */}
          {(validationError || error) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{validationError || error}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              コメント
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
              rows={5}
              placeholder="体験についての感想を入力してください..."
              disabled={isSubmitting}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000文字
            </p>
          </div>
          
          {/* 写真アップロード */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
              <span>写真</span>
              {enableCamera && !showCamera && (
                <button 
                  type="button"
                  onClick={startCamera}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  カメラで撮影
                </button>
              )}
            </label>
            
            {/* カメラビュー */}
            {showCamera && (
              <div className="mb-3">
                <div className="relative w-full h-64 bg-black rounded overflow-hidden mb-2">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    撮影
                  </button>
                </div>
              </div>
            )}
            
            {/* 写真プレビュー */}
            <div className="flex flex-wrap gap-2 mb-2">
              {photoPreviewUrls.map((url, index) => (
                <div 
                  key={index} 
                  className={`relative w-20 h-20 border rounded overflow-hidden group cursor-pointer ${selectedPhotoIndex === index ? 'ring-2 ring-black' : ''}`}
                  onClick={() => setSelectedPhotoIndex(index === selectedPhotoIndex ? null : index)}
                >
                  <img src={url} alt={`アップロード ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                    className="absolute top-0 right-0 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              {photos.length < 5 && !showCamera && (
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Camera size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">追加</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    multiple
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
            {/* 写真編集オプション */}
            {selectedPhotoIndex !== null && (
              <div className="mt-2 mb-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">写真の編集</p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => rotatePhoto(selectedPhotoIndex)}
                      disabled={isRotating}
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      {isRotating ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <RotateCw size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <img 
                    src={photoPreviewUrls[selectedPhotoIndex]} 
                    alt="選択中の写真" 
                    className="max-h-32 mx-auto object-contain" 
                  />
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 flex items-center">
              <Image size={12} className="mr-1" />
              {photos.length}/5枚（最大5枚までアップロードできます）
            </p>
            
            {/* アップロードプログレスバー */}
            {isSubmitting && photos.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">写真アップロード中...</p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right mt-1">{uploadProgress}%</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-black text-white rounded-lg font-medium disabled:bg-gray-400 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  送信中...
                </>
              ) : (
                'レビューを投稿'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;