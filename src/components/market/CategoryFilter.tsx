import React from 'react';

interface CategoryFilterProps {
  categories: { id: string; name: string }[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
      <button 
        onClick={() => onCategoryChange('all')}
        className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
          selectedCategory === 'all' 
            ? 'bg-black text-white' 
            : 'bg-white border border-gray-300 hover:bg-gray-50'
        }`}
      >
        すべて
      </button>
      {categories.map(category => (
        <button 
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            selectedCategory === category.id 
              ? 'bg-black text-white' 
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
