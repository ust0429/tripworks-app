/**
 * 体験登録ページ
 * 
 * アテンダーが新しい体験を登録するためのページ
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { NextPage } from 'next';
import ExperienceForm from '../../../components/experience/ExperienceForm';
import apiClient, { getAuthToken } from '../../../utils/apiClientEnhanced';
import { ENDPOINTS } from '../../../config/api';

const CreateExperiencePage: NextPage = () => {
  const router = useRouter();
  const { attenderId } = router.query;
  const [loading, setLoading] = useState<boolean>(true);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // アテンダー権限確認
  useEffect(() => {
    const checkOwnership = async () => {
      if (!attenderId) return;
      
      try {
        setLoading(true);
        
        // 認証状態の確認
        const token = await getAuthToken();
        if (!token) {
          console.error('認証されていません');
          setError('この操作を行うにはログインが必要です');
          router.push('/login?redirect=' + encodeURIComponent(router.asPath));
          return;
        }
        
        // アテンダー情報の取得
        const response = await apiClient.get(ENDPOINTS.ATTENDER.DETAIL(attenderId as string));
        
        if (!response.success) {
          console.error('アテンダー情報取得エラー:', response.error);
          setError('アテンダー情報の取得に失敗しました');
          return;
        }
        
        // 権限チェック (ユーザーIDの比較など、実際の実装に合わせて調整)
        // 実際にはバックエンドでもアテンダーIDとトークンの関連をチェックする
        const isAuthorized = true; // 仮の実装
        
        setIsOwner(isAuthorized);
        
        if (!isAuthorized) {
          setError('このアテンダープロフィールを編集する権限がありません');
        }
      } catch (err) {
        console.error('権限確認中にエラーが発生:', err);
        setError('権限の確認中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    if (attenderId) {
      checkOwnership();
    }
  }, [attenderId, router]);
  
  // 体験登録成功時の処理
  const handleSuccess = (experienceId: string) => {
    // 登録した体験の詳細ページに遷移
    router.push(`/experiences/${experienceId}`);
  };
  
  // キャンセル時の処理
  const handleCancel = () => {
    // アテンダープロフィールページに戻る
    router.push(`/attenders/${attenderId}`);
  };
  
  return (
    <>
      <Head>
        <title>新しい体験を登録 | echo</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">新しい体験を登録</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            <p>{error}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              戻る
            </button>
          </div>
        ) : isOwner ? (
          <ExperienceForm
            attenderId={attenderId as string}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
            <p>権限がありません。アテンダープロフィールの所有者のみが体験を登録できます。</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              戻る
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateExperiencePage;
