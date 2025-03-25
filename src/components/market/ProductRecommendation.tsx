import React from 'react';
import { User } from 'lucide-react';
import { ProductType } from '../../types/market';
import { IconProps } from '../../types/common';
import { useNavigate } from 'react-router-dom';

interface ProductRecommendationProps {
  title: string;
  subTitle?: string;
  products: ProductType[];
  experienceId?: string;
  experienceName?: string;
  attenderName?: string;
}

const ProductRecommendation: React.FC<ProductRecommendationProps> = ({
  title,
  subTitle,
  products,
  experienceId,
  experienceName,
  attenderName,
}) => {
  const navigate = useNavigate();

  const handleProductClick = (productId: string | number) => {
    navigate(`/market/product/${productId}`);
  };

  const handleViewAllClick = () => {
    if (experienceId) {
      navigate(`/market/experience/${experienceId}`);
    } else {
      navigate('/market/recommended');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subTitle && <p className="text-sm text-gray-600">{subTitle}</p>}
        </div>
        <button 
          onClick={handleViewAllClick}
          className="text-sm text-black font-medium"
        >
          すべて見る
        </button>
      </div>

      {experienceName && attenderName && (
        <div className="flex items-center mb-3 bg-gray-50 p-3 rounded-lg">
          <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
            <User size={20} className="text-gray-600" />
          </div>
          <div>
            <p className="font-medium">{attenderName}さんの案内で巡った</p>
            <p className="text-sm text-gray-700">{experienceName}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map(product => (
          <div 
            key={product.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                product.icon && React.isValidElement(product.icon) && 
                React.cloneElement(product.icon as React.ReactElement<IconProps>, { 
                  size: 32, 
                  className: "text-gray-400" 
                })
              )}
            </div>
            <div className="p-2">
              <p className="font-medium text-sm line-clamp-2">{product.name}</p>
              <p className="text-xs text-gray-600">¥{product.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendation;