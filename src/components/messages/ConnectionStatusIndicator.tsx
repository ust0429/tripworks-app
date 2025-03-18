// src/components/messages/ConnectionStatusIndicator.tsx
import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle, Loader } from 'lucide-react';
import { webSocketService, ConnectionStatus } from '../../utils/websocketService';

interface ConnectionStatusIndicatorProps {
  compact?: boolean;
}

/**
 * WebSocket接続状態を表示するインジケータコンポーネント
 */
const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ compact = false }) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  // 接続状態の変更を監視
  useEffect(() => {
    const unsubscribe = webSocketService.addConnectionListener(setStatus);
    return unsubscribe;
  }, []);

  // 接続済みの場合は何も表示しない（オプション）
  if (status === ConnectionStatus.CONNECTED && !compact) {
    return null;
  }

  // 状態に応じてメッセージとスタイルを設定
  let message = '';
  let icon = null;
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case ConnectionStatus.CONNECTING:
      message = 'サーバーに接続中...';
      icon = <Loader size={compact ? 14 : 18} className="animate-spin" />;
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    
    case ConnectionStatus.RECONNECTING:
      message = '再接続中...';
      icon = <Loader size={compact ? 14 : 18} className="animate-spin" />;
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    
    case ConnectionStatus.DISCONNECTED:
      message = 'オフライン';
      icon = <WifiOff size={compact ? 14 : 18} />;
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      break;
    
    case ConnectionStatus.ERROR:
      message = '接続エラー';
      icon = <AlertCircle size={compact ? 14 : 18} />;
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    
    case ConnectionStatus.CONNECTED:
      message = 'オンライン';
      icon = null;
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
  }

  // コンパクトモードの場合は簡略表示
  if (compact) {
    return (
      <div className={`flex items-center ${textColor}`}>
        {icon && <span className="mr-1">{icon}</span>}
        <span className="text-xs">{message}</span>
      </div>
    );
  }

  return (
    <div className={`${bgColor} ${textColor} p-2 flex items-center justify-center text-sm rounded-md`}>
      {icon && <span className="mr-2">{icon}</span>}
      <span>{message}</span>
      {status === ConnectionStatus.ERROR && (
        <button
          onClick={() => webSocketService.connect(localStorage.getItem('userId') || '', localStorage.getItem('token') || '')}
          className="ml-2 px-2 py-0.5 bg-white rounded text-xs"
        >
          再試行
        </button>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;
