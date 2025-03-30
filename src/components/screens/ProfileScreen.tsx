// src/components/screens/ProfileScreen.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">プロフィール</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-2xl font-medium">
            {user?.displayName?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.displayName || 'ユーザー'}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-medium text-gray-700 mb-2">アカウント情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">名前</p>
                <p>{user?.displayName || 'ユーザー'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">メールアドレス</p>
                <p>{user?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-medium text-gray-700 mb-2">通知設定</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p>メッセージ通知</p>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <p>予約リマインダー</p>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <p>特別オファー</p>
                <input type="checkbox" className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">お支払い情報</h3>
            <div className="flex justify-between items-center">
              <p className="text-gray-500">お支払い方法は登録されていません</p>
              <button className="px-3 py-1 bg-gray-100 text-black rounded-md text-sm">
                追加
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button className="px-4 py-2 bg-gray-100 text-black rounded-lg">
            プロフィールを編集
          </button>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;