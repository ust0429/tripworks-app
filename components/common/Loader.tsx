import React from 'react';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderType = 'spinner' | 'dots' | 'bar' | 'pulse';
export type LoaderTheme = 'primary' | 'secondary' | 'light' | 'dark';

interface LoaderProps {
  size?: LoaderSize;
  type?: LoaderType;
  theme?: LoaderTheme;
  fullPage?: boolean;
  transparent?: boolean;
  message?: string;
  className?: string;
}

const sizeMap = {
  xs: {
    spinner: 'w-4 h-4 border-2',
    dots: 'space-x-1',
    bar: 'h-1 w-16',
    pulse: 'w-4 h-4'
  },
  sm: {
    spinner: 'w-6 h-6 border-2',
    dots: 'space-x-1.5',
    bar: 'h-1.5 w-24',
    pulse: 'w-6 h-6'
  },
  md: {
    spinner: 'w-8 h-8 border-2',
    dots: 'space-x-2',
    bar: 'h-2 w-32',
    pulse: 'w-8 h-8'
  },
  lg: {
    spinner: 'w-12 h-12 border-3',
    dots: 'space-x-3',
    bar: 'h-2.5 w-48',
    pulse: 'w-12 h-12'
  },
  xl: {
    spinner: 'w-16 h-16 border-4',
    dots: 'space-x-4',
    bar: 'h-3 w-64',
    pulse: 'w-16 h-16'
  }
};

const themeMap = {
  primary: {
    spinner: 'border-primary-light border-t-primary',
    dots: 'bg-primary',
    bar: 'bg-primary',
    pulse: 'bg-primary-light'
  },
  secondary: {
    spinner: 'border-secondary-light border-t-secondary',
    dots: 'bg-secondary',
    bar: 'bg-secondary',
    pulse: 'bg-secondary-light'
  },
  light: {
    spinner: 'border-gray-200 border-t-white',
    dots: 'bg-white',
    bar: 'bg-white',
    pulse: 'bg-gray-200'
  },
  dark: {
    spinner: 'border-gray-600 border-t-gray-800',
    dots: 'bg-gray-800',
    bar: 'bg-gray-800',
    pulse: 'bg-gray-600'
  }
};

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  type = 'spinner',
  theme = 'primary',
  fullPage = false,
  transparent = false,
  message,
  className = ''
}) => {
  const sizeClasses = sizeMap[size][type];
  const themeClasses = themeMap[theme][type];
  
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className={`rounded-full border-solid animate-spin ${sizeClasses} ${themeClasses}`}></div>
        );
      case 'dots':
        return (
          <div className={`flex ${sizeClasses}`}>
            <div className={`rounded-full ${themeClasses} animate-bounce`} style={{ width: '0.5rem', height: '0.5rem' }}></div>
            <div className={`rounded-full ${themeClasses} animate-bounce`} style={{ width: '0.5rem', height: '0.5rem', animationDelay: '0.2s' }}></div>
            <div className={`rounded-full ${themeClasses} animate-bounce`} style={{ width: '0.5rem', height: '0.5rem', animationDelay: '0.4s' }}></div>
          </div>
        );
      case 'bar':
        return (
          <div className="relative">
            <div className={`rounded-full ${sizeClasses} ${themeClasses} opacity-20`}></div>
            <div className={`absolute top-0 left-0 rounded-full ${sizeClasses} ${themeClasses} animate-loadingBar`}></div>
          </div>
        );
      case 'pulse':
        return (
          <div className={`rounded-full ${sizeClasses} ${themeClasses} animate-pulse`}></div>
        );
      default:
        return (
          <div className={`rounded-full border-solid animate-spin ${sizeClasses} ${themeClasses}`}></div>
        );
    }
  };

  const containerClasses = `flex flex-col items-center justify-center ${className}`;
  
  if (fullPage) {
    return (
      <div className={`fixed inset-0 z-50 ${containerClasses} ${transparent ? 'bg-transparent' : 'bg-white bg-opacity-80'}`}>
        {renderLoader()}
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    );
  }
  
  return (
    <div className={containerClasses}>
      {renderLoader()}
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default Loader;
