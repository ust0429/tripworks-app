// src/components/ReviewPhotoViewer.tsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface ReviewPhotoViewerProps {
  photos: string[];
  initialIndex: number;
  onClose: () => void;
}

const ReviewPhotoViewer: React.FC<ReviewPhotoViewerProps> = ({ 
  photos, 
  initialIndex, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // キーボードイベントを処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, photos.length]);
  
  // 次の写真に移動
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // 前の写真に移動
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };
  
  // 写真を保存（実際には仮の実装）
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photos[currentIndex];
    link.download = `review-photo-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 flex justify-between items-center text-white">
        <div className="text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <Download size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      {/* メインイメージエリア */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="max-w-4xl max-h-full px-4">
          <img
            src={photos[currentIndex]}
            alt={`写真 ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        {/* 前の写真へのナビゲーションボタン */}
        {photos.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {/* 次の写真へのナビゲーションボタン */}
        {photos.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
      
      {/* サムネイルプレビュー */}
      {photos.length > 1 && (
        <div className="p-4 flex justify-center">
          <div className="flex space-x-2 overflow-x-auto max-w-full">
            {photos.map((photo, index) => (
              <div
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-16 h-16 flex-shrink-0 bg-gray-900 cursor-pointer ${
                  index === currentIndex ? 'ring-2 ring-white' : 'opacity-60'
                }`}
              >
                <img
                  src={photo}
                  alt={`サムネイル ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPhotoViewer;