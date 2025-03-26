import React, { useEffect, useState } from 'react';
import { AttenderProfile } from '../../../components/attender/profile';
import AttenderProfileForm from '../../../components/attender/profile/AttenderProfileForm';
import ProfileAdapter from '../../../components/attender/profile/ProfileAdapter';
import { AttenderProfileProvider } from '../../../contexts/AttenderProfileContext';

/**
 * アテンダープロフィールページ
 */
const AttenderProfilePage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [attenderId, setAttenderId] = useState<string | null>(null);
  
  // 認証状態と現在のユーザーIDの確認
  // 注: 実際の認証システムと連携する必要があります
  useEffect(() => {
    // 仮の認証チェック（開発用）
    // 本番環境では実際の認証システムと連携してください
    const checkAuth = async () => {
      try {
        // localStorage から仮のユーザーID取得（開発用）
        const storedAttenderId = localStorage.getItem('echo_current_attender_id');
        
        if (storedAttenderId) {
          setAttenderId(storedAttenderId);
          setIsAuthenticated(true);
        } else {
          // 開発用: 仮のIDを生成して保存
          const mockAttenderId = `attender_${Date.now()}`;
          localStorage.setItem('echo_current_attender_id', mockAttenderId);
          setAttenderId(mockAttenderId);
          setIsAuthenticated(true);
        }
        
        // 本番環境では以下のような実装になります
        // const response = await fetch('/api/auth/status');
        // const data = await response.json();
        // if (data.isAuthenticated && data.user.role === 'attender') {
        //   setAttenderId(data.user.id);
        //   setIsAuthenticated(true);
        // } else {
        //   setIsAuthenticated(false);
        // }
      } catch (error) {
        console.error('認証確認エラー:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // 認証チェック中
  if (attenderId === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // 未認証の場合
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">アクセス制限</h1>
          <p className="mb-6 text-gray-600">
            このページにアクセスするにはアテンダーとしてログインする必要があります。
          </p>
          <a
            href="/login" // 実際のログインページへのリンク
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            ログインページへ
          </a>
        </div>
      </div>
    );
  }
  
  // 認証済みの場合、プロフィールページを表示
  return (
    <AttenderProfileProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">アテンダープロフィール</h1>
        
        {/* 以下の2つの方法から選択できます */}
        
        {/* 方法1: 新しいアテンダープロフィールコンポーネントを使用 */}
        <AttenderProfile attenderId={attenderId} />
        
        {/* 方法2: ProfileAdapterを使用してAttenderProfileFormと連携 */}
        {/* 
        <div className="mt-4">
          <AttenderProfile 
            attenderId={attenderId} 
            renderProfile={(profile) => (
              <ProfileAdapter profile={profile}>
                {(adaptedProfile) => (
                  <AttenderProfileForm 
                    initialProfile={adaptedProfile} 
                    onSave={(updated) => console.log('Profile updated:', updated)}
                  />
                )}
              </ProfileAdapter>
            )}
          />
        </div>
        */}
      </div>
    </AttenderProfileProvider>
  );
};

export default AttenderProfilePage;
