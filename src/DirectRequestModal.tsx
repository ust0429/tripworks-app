<<<<<<< HEAD
import React, { useState } from 'react';
import { ChevronDown, Gift } from 'lucide-react';
import { useAuth } from './AuthComponents';
import { AttenderType } from './types'; // 追加

interface DirectRequestModalProps {
  attender: AttenderType;
  onClose: () => void;
}

// 直接リクエストモーダルコンポーネント
const DirectRequestModal = ({ attender, onClose }: DirectRequestModalProps) => {
  const [showDonation, setShowDonation] = useState(false);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
            {attender.icon ? React.cloneElement(attender.icon, { size: 24, className: "text-gray-600" }) : null}
          </div>
          <div>
            <h3 className="text-lg font-bold">{attender.name}</h3>
            <p className="text-sm text-gray-600">{attender.type}</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            どんな体験をしたいですか？
          </label>
          <textarea
            placeholder={`${attender.name}さんに具体的なリクエストを伝えてください...`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
            rows={3}
          ></textarea>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日付
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              時間
            </label>
            <input
              type="time"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            希望する時間
          </label>
          <div className="flex space-x-2">
            <button className="flex-1 py-2 border border-black text-black rounded-lg text-sm">1時間</button>
            <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">2時間</button>
            <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">3時間+</button>
          </div>
        </div>
        
        {/* 地域貢献オプション */}
        <div className="border-t pt-3">
          <button 
            onClick={() => setShowDonation(!showDonation)}
            className="flex items-center text-sm text-black mb-2"
          >
            <Gift size={16} className="mr-1" />
            <span>地域コミュニティへの貢献オプション</span>
            <ChevronDown size={16} className={`ml-1 transform ${showDonation ? 'rotate-180' : ''}`} />
          </button>
          
          {showDonation && (
            <div className="bg-gray-50 p-3 rounded-lg mb-2">
              <p className="text-sm text-gray-700 mb-2">
                体験料金の一部を地域活性化プロジェクトに寄付できます。
              </p>
              <div className="flex space-x-2 mb-2">
                <button className="flex-1 py-2 border bg-white border-gray-300 rounded-lg text-sm">
                  10%
                </button>
                <button className="flex-1 py-2 border bg-gray-200 border-gray-400 rounded-lg text-sm font-medium">
                  15%
                </button>
                <button className="flex-1 py-2 border bg-white border-gray-300 rounded-lg text-sm">
                  20%
                </button>
              </div>
              <div className="text-xs text-gray-600">
                現在の地域プロジェクト: 商店街の伝統工芸育成支援
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
          >
            リクエスト送信
          </button>
        </div>
      </div>
    </div>
  );
};

=======
import React, { useState } from 'react';
import { ChevronDown, Gift } from 'lucide-react';
import { useAuth } from './AuthComponents';
import { AttenderType } from './types'; // 追加

interface DirectRequestModalProps {
  attender: AttenderType;
  onClose: () => void;
}

// 直接リクエストモーダルコンポーネント
const DirectRequestModal = ({ attender, onClose }: DirectRequestModalProps) => {
  const [showDonation, setShowDonation] = useState(false);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
            {attender.icon ? React.cloneElement(attender.icon, { size: 24, className: "text-gray-600" }) : null}
          </div>
          <div>
            <h3 className="text-lg font-bold">{attender.name}</h3>
            <p className="text-sm text-gray-600">{attender.type}</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            どんな体験をしたいですか？
          </label>
          <textarea
            placeholder={`${attender.name}さんに具体的なリクエストを伝えてください...`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
            rows={3}
          ></textarea>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日付
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              時間
            </label>
            <input
              type="time"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            希望する時間
          </label>
          <div className="flex space-x-2">
            <button className="flex-1 py-2 border border-black text-black rounded-lg text-sm">1時間</button>
            <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">2時間</button>
            <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">3時間+</button>
          </div>
        </div>
        
        {/* 地域貢献オプション */}
        <div className="border-t pt-3">
          <button 
            onClick={() => setShowDonation(!showDonation)}
            className="flex items-center text-sm text-black mb-2"
          >
            <Gift size={16} className="mr-1" />
            <span>地域コミュニティへの貢献オプション</span>
            <ChevronDown size={16} className={`ml-1 transform ${showDonation ? 'rotate-180' : ''}`} />
          </button>
          
          {showDonation && (
            <div className="bg-gray-50 p-3 rounded-lg mb-2">
              <p className="text-sm text-gray-700 mb-2">
                体験料金の一部を地域活性化プロジェクトに寄付できます。
              </p>
              <div className="flex space-x-2 mb-2">
                <button className="flex-1 py-2 border bg-white border-gray-300 rounded-lg text-sm">
                  10%
                </button>
                <button className="flex-1 py-2 border bg-gray-200 border-gray-400 rounded-lg text-sm font-medium">
                  15%
                </button>
                <button className="flex-1 py-2 border bg-white border-gray-300 rounded-lg text-sm">
                  20%
                </button>
              </div>
              <div className="text-xs text-gray-600">
                現在の地域プロジェクト: 商店街の伝統工芸育成支援
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
          >
            リクエスト送信
          </button>
        </div>
      </div>
    </div>
  );
};

>>>>>>> 7b9c74b (初期コミット: プロジェクト基本構造)
export default DirectRequestModal;