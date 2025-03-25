import React from 'react';
import { User, Heart } from 'lucide-react';
import { ProductType } from '../../types/market';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: ProductType;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/market/product/${product.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md"
      onClick={handleClick}
    >
      <div className="relative">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            product.icon
          )}
        </div>
        <button 
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            // お気に入り追加処理
          }}
        >
          <Heart size={18} className="text-gray-500" />
        </button>
        {product.featured && (
          <div className="absolute top-2 left-2 bg-black text-white text-xs py-1 px-2 rounded-full">
            おすすめ
          </div>
        )}
        {product.limited && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs py-1 px-2 rounded-full">
            限定品
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium line-clamp-2">{product.name}</p>
        <p className="text-black font-bold mt-1">¥{product.price.toLocaleString()}</p>
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <User size={12} className="mr-1" />
          <span>{product.attender}</span>
          <span className="mx-1">|</span>
          <span>{product.region}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
