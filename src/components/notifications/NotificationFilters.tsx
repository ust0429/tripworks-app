import React, { useState, useRef, useEffect } from 'react';
import { NotificationFilter, NotificationType } from '../../types/notification';

interface NotificationFiltersProps {
  currentFilters: NotificationFilter;
  onFilterChange: (filters: NotificationFilter) => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  currentFilters,
  onFilterChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleType = (type: NotificationType) => {
    const currentTypes = currentFilters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFilterChange({
      ...currentFilters,
      type: newTypes.length > 0 ? newTypes : undefined
    });
  };

  const toggleReadStatus = (read: boolean | undefined) => {
    onFilterChange({
      ...currentFilters,
      read: currentFilters.read === read ? undefined : read
    });
  };

  const clearFilters = () => {
    onFilterChange({});
    setIsOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      (currentFilters.type && currentFilters.type.length > 0) ||
      currentFilters.read !== undefined ||
      currentFilters.startDate !== undefined ||
      currentFilters.endDate !== undefined
    );
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        className={`inline-flex justify-center items-center px-3 py-1.5 border ${
          hasActiveFilters() ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-300 bg-white text-gray-700'
        } rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {hasActiveFilters() && (
          <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full">
            {(currentFilters.type?.length || 0) + 
             (currentFilters.read !== undefined ? 1 : 0) + 
             (currentFilters.startDate !== undefined ? 1 : 0) + 
             (currentFilters.endDate !== undefined ? 1 : 0)}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
        >
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Filter by type
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.values(NotificationType).map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      id={`filter-${type}`}
                      name={`filter-${type}`}
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={(currentFilters.type || []).includes(type)}
                      onChange={() => toggleType(type)}
                    />
                    <label
                      htmlFor={`filter-${type}`}
                      className="ml-2 text-sm text-gray-700 capitalize"
                    >
                      {type.toLowerCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Filter by status
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="filter-read"
                    name="filter-status"
                    type="radio"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    checked={currentFilters.read === true}
                    onChange={() => toggleReadStatus(true)}
                  />
                  <label
                    htmlFor="filter-read"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Read
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="filter-unread"
                    name="filter-status"
                    type="radio"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    checked={currentFilters.read === false}
                    onChange={() => toggleReadStatus(false)}
                  />
                  <label
                    htmlFor="filter-unread"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Unread
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="filter-all-status"
                    name="filter-status"
                    type="radio"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    checked={currentFilters.read === undefined}
                    onChange={() => toggleReadStatus(undefined)}
                  />
                  <label
                    htmlFor="filter-all-status"
                    className="ml-2 text-sm text-gray-700"
                  >
                    All
                  </label>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 flex justify-between">
              <button
                type="button"
                className="text-xs text-gray-700 hover:text-gray-900"
                onClick={clearFilters}
              >
                Clear filters
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;
