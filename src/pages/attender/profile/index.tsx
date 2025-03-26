import React, { useState, useEffect } from 'react';
import { AttenderProfileProvider } from '@/contexts/AttenderProfileContext';
import AttenderProfile from '@/components/attender/profile/AttenderProfile';
import AttenderProfileEdit from '@/components/attender/profile/AttenderProfileEdit';
import { useAuth } from '@/contexts/AuthContext'; // 認証コンテキスト

const AttenderProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { isAuthenticated, isAttender, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  // 認証と権限のチェック
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // 権限がない場合はリダイレクト
  useEffect(() => {
    if (authChecked && !loading && (!isAuthenticated || !isAttender)) {
      // ログインページへリダイレクト
      // window.location.href = '/login'; // 必要に応じてコメントを解除
    }
  }, [authChecked, isAuthenticated, isAttender, loading]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSaved = () => {
    setIsEditing(false);
  };

  // 認証確認中はローディング表示
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 未認証または非アテンダーの場合
  /* 認証機能実装時にコメントを解除
  if (!isAuthenticated || !isAttender) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg font-medium text-gray-700 mb-4">アクセス権限がありません</p>
        <a 
          href="/login" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ログインへ戻る
        </a>
      </div>
    );
  }
  */

  return (
    <AttenderProfileProvider>
      <div className="container mx-auto px-4 py-8">
        {isEditing ? (
          <AttenderProfileEdit 
            onCancel={handleCancel} 
            onSaved={handleSaved} 
          />
        ) : (
          <AttenderProfile onEdit={handleEdit} />
        )}
      </div>
    </AttenderProfileProvider>
  );
};

export default AttenderProfilePage;
