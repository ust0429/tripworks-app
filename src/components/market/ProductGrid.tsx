import React from 'react';
import ProductCard from './ProductCard';
import { ProductType } from '../../types/market';

interface ProductGridProps {
  products: ProductType[];
  category?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, category }) => {
  const filteredProducts = category && category !== 'all' 
    ? products.filter(product => product.category === category)
    : products;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      {filteredProducts.length === 0 && (
        <div className="col-span-full py-8 text-center text-gray-500">
          該当する商品が見つかりませんでした
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
