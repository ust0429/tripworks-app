import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
}

interface EventFilterProps {
  filters: {
    types: FilterOption[];
    periods: FilterOption[];
  };
  selectedFilters: {
    type: string;
    period: string;
  };
  onFilterChange: (filterType: 'type' | 'period', value: string) => void;
  onClearFilters: () => void;
}

const EventFilter: React.FC<EventFilterProps> = ({ 
  filters, 
  selectedFilters, 
  onFilterChange,
  onClearFilters
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterChange = (filterType: 'type' | 'period', value: string) => {
    onFilterChange(filterType, value);
    setIsOpen(false);
  };

  const hasActiveFilters = selectedFilters.type !== 'all' || selectedFilters.period !== 'all';

  return (
    <div className="relative">
      {/* フィルターボタン */}
      <div className="flex justify-between items-center">
        <button 
          className={`flex items-center px-3 py-1 rounded-full text-sm border ${
            hasActiveFilters ? 'border-black bg-black text-white' : 'border-gray-300'
          }`}
          onClick={toggleFilter}
        >
          <Filter size={16} className="mr-1" />
          絞り込み
          {hasActiveFilters && (
            <span className="ml-1 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {(selectedFilters.type !== 'all' ? 1 : 0) + (selectedFilters.period !== 'all' ? 1 : 0)}
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button 
            className="text-sm text-gray-600 ml-2"
            onClick={onClearFilters}
          >
            クリア
          </button>
        )}
      </div>
      
      {/* フィルターパネル */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">絞り込み条件</h3>
            <button onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          
          {/* イベントタイプ */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">イベントタイプ</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedFilters.type === 'all' 
                    ? 'bg-black text-white' 
                    : 'bg-white border border-gray-300'
                }`}
                onClick={() => handleFilterChange('type', 'all')}
              >
                すべて
              </button>
              {filters.types.map(type => (
                <button 
                  key={type.id}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedFilters.type === type.id 
                      ? 'bg-black text-white' 
                      : 'bg-white border border-gray-300'
                  }`}
                  onClick={() => handleFilterChange('type', type.id)}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* 期間 */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">期間</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedFilters.period === 'all' 
                    ? 'bg-black text-white' 
                    : 'bg-white border border-gray-300'
                }`}
                onClick={() => handleFilterChange('period', 'all')}
              >
                すべて
              </button>
              {filters.periods.map(period => (
                <button 
                  key={period.id}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedFilters.period === period.id 
                      ? 'bg-black text-white' 
                      : 'bg-white border border-gray-300'
                  }`}
                  onClick={() => handleFilterChange('period', period.id)}
                >
                  {period.name}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            className="w-full py-2 bg-black text-white rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            適用する
          </button>
        </div>
      )}
    </div>
  );
};

export default EventFilter;
