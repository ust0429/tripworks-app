import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../AuthComponents';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translate, setTranslate] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { openLoginModal, openSignupModal } = useAuth();
  
  // オンボーディングスライドのデータ
  const slides = [
    {
      title: 'ガイドブックには載っていない体験を',
      description: '地元の人や移住者がナビゲートする、路地裏や隠れ家のような本当のローカル体験を探索しましょう。',
      image: '/onboarding-1.jpg', // 実際にはアプリの画像パスに変更
      color: 'bg-indigo-500'
    },
    {
      title: '移動ではなく、人との繋がりをオンデマンドに',
      description: '観光名所を巡るだけでなく、地域の魅力を知り尽くした「アテンダー」と共に街の新たな一面を発見しましょう。',
      image: '/onboarding-2.jpg',
      color: 'bg-emerald-500'
    },
    {
      title: '偶然と不確実性を楽しむ旅へ',
      description: '「ゆるい」予定で、予測不能な出会いやスリルを体感。行き当たりばったりのワクワクを楽しみましょう。',
      image: '/onboarding-3.jpg',
      color: 'bg-amber-500'
    },
    {
      title: '旅がもっと自由に',
      description: '今、echoを始めて、旅の新しい可能性を広げてみませんか？',
      image: '/onboarding-4.jpg',
      color: 'bg-rose-500'
    }
  ];
  
  // スライドの切り替え
  const goToSlide = (index: number) => {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;
    setCurrentSlide(index);
  };
  
  // 次のスライドへ
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      // 最後のスライドの場合、オンボーディングを完了
      onComplete();
    }
  };
  
  // 前のスライドへ
  const prevSlide = () => {
    goToSlide(currentSlide - 1);
  };
  
  // スワイプの挙動を制御
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    if ('touches' in e) {
      setStartX(e.touches[0].clientX);
    } else {
      setStartX(e.clientX);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    let currentX;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
    } else {
      currentX = e.clientX;
    }
    
    const diff = currentX - startX;
    setTranslate(diff);
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // 100px以上のスワイプを検出した場合、スライドを切り替える
    if (translate > 100) {
      prevSlide();
    } else if (translate < -100) {
      nextSlide();
    }
    
    setTranslate(0);
  };
  
  // スライド変更時にスクロールを実行
  useEffect(() => {
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.clientWidth;
      sliderRef.current.scrollLeft = currentSlide * slideWidth;
    }
  }, [currentSlide]);
  
  // ログインモーダルを開く
  const handleLogin = () => {
    openLoginModal();
  };
  
  // 新規登録モーダルを開く
  const handleSignup = () => {
    openSignupModal();
  };
  
  // スキップしてオンボーディングを完了
  const handleSkip = () => {
    onComplete();
  };
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10">
        {/* スキップボタン */}
        <button onClick={handleSkip} className="text-white text-sm">
          スキップ
        </button>
        
        {/* クローズボタン */}
        <button onClick={handleSkip} className="text-white">
          <X size={20} />
        </button>
      </div>
      
      {/* スライダー */}
      <div 
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <div 
          ref={sliderRef}
          className="flex h-full transition-transform duration-300 ease-out snap-x snap-mandatory"
          style={{ 
            transform: isDragging ? `translateX(${translate}px)` : 'translateX(0)',
            willChange: 'transform'
          }}
        >
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className="min-w-full h-full flex flex-col justify-end snap-center"
              style={{ 
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), rgba(0,0,0,0)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="p-8 pt-16 space-y-4">
                <h2 className={`text-3xl font-bold text-white`}>
                  {slide.title}
                </h2>
                <p className="text-white text-lg">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* フッター */}
      <div className="bg-black p-4 space-y-4">
        {/* インジケーター */}
        <div className="flex justify-center space-x-2 pb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* ナビゲーションボタン */}
        <div className="flex justify-between items-center">
          {currentSlide > 0 ? (
            <button 
              onClick={prevSlide}
              className="p-2 text-white"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="w-10"></div>
          )}
          
          {currentSlide < slides.length - 1 ? (
            <button 
              onClick={nextSlide}
              className="p-2 text-white"
            >
              <ChevronRight size={24} />
            </button>
          ) : (
            <div className="w-10"></div>
          )}
        </div>
        
        {/* 最後のスライドでのみ表示するボタン */}
        {currentSlide === slides.length - 1 && (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSignup}
              className="w-full py-3 bg-white text-black rounded-lg font-medium"
            >
              無料でアカウント作成
            </button>
            <button
              onClick={handleLogin}
              className="w-full py-3 border border-white text-white rounded-lg font-medium"
            >
              ログイン
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;