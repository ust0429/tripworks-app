/**
 * @headlessui/react モックファイル
 */

import React from 'react';

interface TabProps {
  children: React.ReactNode;
  className?: string | ((params: { selected: boolean }) => string);
  onClick?: () => void;
  [key: string]: any;
}

// Tab コンポーネント本体
const Tab: React.FC<TabProps> & {
  Group: React.FC<{ children: React.ReactNode }>;
  List: React.FC<{ children: React.ReactNode; className?: string }>;
  Panels: React.FC<{ children: React.ReactNode }>;
  Panel: React.FC<{ children: React.ReactNode }>;
} = (props) => {
  const { children, className, onClick, ...rest } = props;
  
  // className が関数の場合、selected=false をデフォルト値として渡す
  const classNameValue = typeof className === 'function' 
    ? className({ selected: false }) 
    : className;
  
  return React.createElement(
    'button',
    { 
      className: classNameValue, 
      onClick, 
      ...rest 
    },
    children
  );
};

// Tab 関連コンポーネント
Tab.Group = ({ children }) => React.createElement('div', { className: "tab-group" }, children);
Tab.List = ({ children, className }) => React.createElement('div', { className: `tab-list ${className || ''}` }, children);
Tab.Panels = ({ children }) => React.createElement('div', { className: "tab-panels" }, children);
Tab.Panel = ({ children }) => React.createElement('div', { className: "tab-panel" }, children);

export { Tab };
