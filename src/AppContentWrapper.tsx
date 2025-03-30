import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentProvider } from './contexts/PaymentContext';
import { AppContent } from './App';

// PaymentProviderのラッパーコンポーネント
const PaymentProviderWithNavigate = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return <PaymentProvider navigate={navigate}>{children}</PaymentProvider>;
};

const AppContentWrapper = () => {
  return (
    <PaymentProviderWithNavigate>
      <AppContent />
    </PaymentProviderWithNavigate>
  );
};

export default AppContentWrapper;
