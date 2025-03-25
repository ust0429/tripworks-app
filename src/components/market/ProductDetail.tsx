import React, { useState } from 'react';
import { ChevronLeft, User, Star, Heart, Share2, Minus, Plus, MapPin } from 'lucide-react';
import { ProductType, ReviewType } from '../../types/market';
import { useNavigate } from 'react-router-dom';

interface ProductDetailProps {
  product: ProductType;
  reviews?: ReviewType[];
  relatedProducts?: ProductType[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  reviews = [], 
  relatedProducts = [] 
}) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // 仮の複数画像
  const productImages = product.imageUrl 
    ? [product.imageUrl, ...Array(3).fill('https://via.placeholder.com/400')] 
    : Array(4).fill('https://via.placeholder.com/400');

  const handleBack = () => {
    navigate(-1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // カート追加処理
    alert(`${quantity}個のカートに追加しました`);
  };

  return (
    <div className="pb-20">
      {/* ヘッダー */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 px-4 py-3 flex items-center border-b">
        <button onClick={handleBack} className="mr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">{product.name}</h1>
        <div className="flex space-x-2">
          <button className="w-8 h-8 flex items-center justify-center">
            <Heart size={20} className="text-gray-600" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center">
            <Share2 size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="pt-16">
        {/* 商品画像 */}
        <div className="aspect-square relative bg-gray-100">
          <img 
            src={productImages[selectedImage]} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.limited && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs py-1 px-2 rounded-full">
              限定品
            </div>
          )}
        </div>
        
        {/* サムネイル画像 */}
        <div className="flex px-4 space-x-2 mt-3">
          {productImages.map((img, index) => (
            <button 
              key={index}
              className={`w-16 h-16 rounded-md overflow-hidden ${selectedImage === index ? 'ring-2 ring-black' : 'opacity-70'}`}
              onClick={() => setSelectedImage(index)}
            >
              <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        
        {/* 商品情報 */}
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{product.name}</h1>
            <p className="text-2xl font-bold mt-2">¥{product.price.toLocaleString()}</p>
            {product.stock && product.stock < 10 && (
              <p className="text-sm text-red-600 mt-1">残り{product.stock}点</p>
            )}
          </div>
          
          {/* アテンダー情報 */}
          <div className="flex items-center bg-gray-50 p-3 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-3">
              {product.attenderAvatar ? (
                <img 
                  src={product.attenderAvatar} 
                  alt={product.attender} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={24} className="text-gray-500" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{product.attender}</p>
              <div className="flex items-center mt-1">
                <MapPin size={14} className="text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">{product.region}</span>
              </div>
            </div>
            <button className="ml-auto bg-black text-white py-1 px-3 rounded-full text-sm">
              プロフィール
            </button>
          </div>
          
          {/* 商品説明 */}
          <div>
            <h2 className="font-bold text-lg mb-2">商品説明</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {/* 評価 */}
          {(product.rating || reviews.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-lg">カスタマーレビュー</h2>
                <div className="flex items-center">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    />
                  ))}
                  <span className="ml-1 text-sm">
                    {product.rating?.toFixed(1) || "0.0"} ({product.reviewCount || 0})
                  </span>
                </div>
              </div>
              
              {reviews.slice(0, 2).map(review => (
                <div key={review.id} className="bg-gray-50 p-3 rounded-lg mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden mr-2">
                      {review.userAvatar ? (
                        <img 
                          src={review.userAvatar} 
                          alt={review.userName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={16} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{review.userName}</p>
                      <div className="flex items-center">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i}
                            size={12}
                            className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          />
                        ))}
                        <span className="ml-1 text-xs text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mt-2">{review.comment}</p>
                </div>
              ))}
              
              {reviews.length > 2 && (
                <button className="text-black text-sm font-medium">
                  すべてのレビューを見る ({reviews.length})
                </button>
              )}
            </div>
          )}
          
          {/* 関連商品 */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-2">関連商品</h2>
              <div className="grid grid-cols-2 gap-3">
                {relatedProducts.slice(0, 4).map(product => (
                  <div 
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border"
                    onClick={() => navigate(`/market/product/${product.id}`)}
                  >
                    <div className="aspect-square bg-gray-100">
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
                    <div className="p-2">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-black font-bold">¥{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 購入ボタン */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex items-center">
        <div className="flex items-center border rounded-lg mr-3">
          <button 
            className="w-10 h-10 flex items-center justify-center"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus size={18} className={quantity <= 1 ? "text-gray-300" : "text-gray-600"} />
          </button>
          <span className="w-8 text-center">{quantity}</span>
          <button 
            className="w-10 h-10 flex items-center justify-center"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= (product.stock || 99)}
          >
            <Plus size={18} className={quantity >= (product.stock || 99) ? "text-gray-300" : "text-gray-600"} />
          </button>
        </div>
        <button 
          className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
          onClick={handleAddToCart}
        >
          カートに追加
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
