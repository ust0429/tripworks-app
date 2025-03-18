// src/components/ReviewPhotoViewer.tsx
import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

interface ReviewPhotoViewerProps {
  photos: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ReviewPhotoViewer: React.FC<ReviewPhotoViewerProps> = ({ 
  photos, 
  initialIndex = 0, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // キーボードイベントのハンドリング
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
          setZoomLevel(1);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isZoomed) {
          setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
        }
      } else if (e.key === 'ArrowRight') {
        if (!isZoomed) {
          setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
        }
      } else if (e.key === '+') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length, onClose, isZoomed]);
  
  // 前の写真に移動
  const goToPrev = () => {
    if (!isZoomed) {
      setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
    }
  };
  
  // 次の写真に移動
  const goToNext = () => {
    if (!isZoomed) {
      setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
    }
  };
  
  // タッチイベント処理
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isZoomed) return;
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
  };
  
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isZoomed || !touchStart) return;
    
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isZoomed) return;
    
    const horizontalDistance = touchStart.x - touchEnd.x;
    const verticalDistance = touchStart.y - touchEnd.y;
    
    // スワイプが主に水平方向かを確認
    if (Math.abs(horizontalDistance) > Math.abs(verticalDistance) * 2) {
      // 左右にスワイプ距離が十分かを確認
      if (Math.abs(horizontalDistance) > 50) {
        if (horizontalDistance > 0) {
          // 左スワイプ（次の写真）
          goToNext();
        } else {
          // 右スワイプ（前の写真）
          goToPrev();
        }
      }
    }
    
    // タッチ状態をリセット
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // ズーム機能
  const handleToggleZoom = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomLevel(1);
    } else {
      setIsZoomed(true);
      setZoomLevel(2); // 初期ズームレベル
    }
  };
  
  const handleZoomIn = () => {
    if (zoomLevel < 4) {
      setZoomLevel(prev => prev + 0.5);
      setIsZoomed(true);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => prev - 0.5);
      if (zoomLevel <= 1.5) { // 1.5→1.0になる場合
        setIsZoomed(false);
        setZoomLevel(1);
      }
    }
  };
  
  // モーダル外クリックでの閉じる処理
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // モーダル自体のクリックでは閉じないように
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white z-10"
        >
          <X size={24} />
        </button>
        
        {/* 写真カウンター */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black bg-opacity-50 rounded-full text-white text-sm z-10">
          {currentIndex + 1} / {photos.length}
        </div>
        
        {/* ズームコントロール */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className={`p-2 rounded-full text-white ${zoomLevel <= 1 ? 'bg-gray-600 bg-opacity-50' : 'bg-black bg-opacity-50'}`}
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={handleToggleZoom}
            className="p-2 bg-black bg-opacity-50 rounded-full text-white"
          >
            <Maximize2 size={20} />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 4}
            className={`p-2 rounded-full text-white ${zoomLevel >= 4 ? 'bg-gray-600 bg-opacity-50' : 'bg-black bg-opacity-50'}`}
          >
            <ZoomIn size={20} />
          </button>
        </div>
        
        {/* 前へボタン */}
        {photos.length > 1 && !isZoomed && (
          <button
            onClick={goToPrev}
            className="absolute left-4 p-2 bg-black bg-opacity-50 rounded-full text-white z-10"
          >
            <ChevronLeft size={32} />
          </button>
        )}
        
        {/* 次へボタン */}
        {photos.length > 1 && !isZoomed && (
          <button
            onClick={goToNext}
            className="absolute right-4 p-2 bg-black bg-opacity-50 rounded-full text-white z-10"
          >
            <ChevronRight size={32} />
          </button>
        )}
        
        {/* サムネイルナビゲーション */}
        {photos.length > 1 && !isZoomed && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-12 h-12 border-2 overflow-hidden ${index === currentIndex ? 'border-white' : 'border-transparent'}`}
              >
                <img 
                  src={photo} 
                  alt={`サムネイル ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
        
        {/* 写真表示エリア */}
        <div className="max-w-screen-lg max-h-screen p-4 flex items-center justify-center overflow-hidden">
          <div 
            className={`transition-transform duration-300 ease-out cursor-${isZoomed ? 'move' : 'zoom-in'}`}
            style={isZoomed ? { overflow: 'auto' } : {}}
          >
            <img
              ref={imageRef}
              src={photos[currentIndex]}
              alt={`レビュー写真 ${currentIndex + 1}`}
              className="max-w-full max-h-[calc(100vh-32px)] object-contain transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={handleToggleZoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPhotoViewer;