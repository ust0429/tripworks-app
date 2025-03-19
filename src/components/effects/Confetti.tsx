import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  duration?: number; // エフェクトの継続時間（ミリ秒）
  particleCount?: number; // パーティクルの数
}

const Confetti: React.FC<ConfettiProps> = ({
  duration = 5000,
  particleCount = 100
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスサイズを設定
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // パーティクルの設定
    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      speed: number;
      angle: number;
      rotation: number;
      rotationSpeed: number;
    }[] = [];
    
    // ランダムな色の生成
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
      '#009688', '#4CAF50', '#8BC34A', '#CDDC39', 
      '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
    ];
    
    // パーティクルの初期化
    const createParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          size: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 3 + 2,
          angle: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: Math.random() * 0.2 - 0.1
        });
      }
    };
    
    createParticles();
    
    // アニメーションの描画
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        // 四角形（紙吹雪）を描画
        ctx.rect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.fill();
        
        ctx.restore();
        
        // パーティクルを移動
        particle.y += particle.speed;
        particle.x += Math.sin(particle.angle) * 2;
        particle.rotation += particle.rotationSpeed;
        
        // 画面外に出たパーティクルを上に戻す
        if (particle.y > canvas.height) {
          particle.y = -particle.size;
          particle.x = Math.random() * canvas.width;
        }
      });
    };
    
    // アニメーションループ
    let animationId: number;
    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // 指定時間後にアニメーションを停止
    const timer = setTimeout(() => {
      cancelAnimationFrame(animationId);
    }, duration);
    
    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [duration, particleCount]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
};

export default Confetti;