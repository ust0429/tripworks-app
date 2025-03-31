/**
 * APIテストページ
 * 
 * バックエンドAPIとの接続をテストするためのページです。
 * 開発環境でのみ有効です。
 */
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import apiClient, { getAuthToken, logApiRequest, logApiResponse } from '../../utils/apiClientEnhanced';
import { ENDPOINTS } from '../../config/api';
import { isDevelopment } from '../../config/env';
import { testApiConnection, testApiEnvironment } from '../../utils/test/apiTest';

const ApiTestPage: NextPage = () => {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [testResults, setTestResults] = useState<Array<{ endpoint: string; status: 'success' | 'failed'; message: string }>>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'attenders' | 'experiences' | 'custom'>('basic');
  const [customEndpoint, setCustomEndpoint] = useState<string>('');
  const [customResponse, setCustomResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 開発環境チェック
  useEffect(() => {
    if (!isDevelopment()) {
      alert('このページは開発環境でのみ利用可能です');
      window.location.href = '/';
    }
  }, []);

  // 認証状態のチェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAuthToken();
        setAuthStatus(token ? 'authenticated' : 'unauthenticated');
      } catch (error) {
        console.error('認証確認エラー:', error);
        setAuthStatus('unauthenticated');
      }
    };

    checkAuth();
  }, []);

  // API接続テスト
  useEffect(() => {
    const runConnectionTest = async () => {
      try {
        setApiStatus('checking');
        const isConnected = await testApiConnection();
        setApiStatus(isConnected ? 'connected' : 'disconnected');
        
        if (isConnected) {
          // 環境設定のテスト
          testApiEnvironment();
        }
      } catch (error) {
        console.error('API接続テストエラー:', error);
        setApiStatus('disconnected');
      }
    };

    runConnectionTest();
  }, []);

  // エンドポイントテスト
  const testEndpoint = async (endpoint: string, method: 'get' | 'post' = 'get', data: any = null) => {
    try {
      setIsLoading(true);
      console.info(`エンドポイントをテスト中: ${method.toUpperCase()} ${endpoint}`);
      logApiRequest(method.toUpperCase(), endpoint, data);

      let response;
      if (method === 'get') {
        response = await apiClient.get(endpoint);
      } else {
        response = await apiClient.post(endpoint, data);
      }

      logApiResponse(method.toUpperCase(), endpoint, response);

      setTestResults(prev => [
        {
          endpoint,
          status: response.success ? 'success' : 'failed',
          message: response.success 
            ? `ステータス: ${response.status}, データ: ${typeof response.data === 'object' ? JSON.stringify(response.data).slice(0, 100) + '...' : response.data}`
            : `エラー: ${response.error?.message || 'Unknown error'}`
        },
        ...prev
      ]);

      if (endpoint === customEndpoint) {
        setCustomResponse(response);
      }

      return response;
    } catch (error) {
      console.error(`エンドポイントテストエラー (${endpoint}):`, error);
      setTestResults(prev => [
        {
          endpoint,
          status: 'failed',
          message: `例外: ${error instanceof Error ? error.message : String(error)}`
        },
        ...prev
      ]);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 基本エンドポイントのテスト
  const testBasicEndpoints = async () => {
    await testEndpoint(ENDPOINTS.ATTENDER.LIST);
  };

  // アテンダー関連エンドポイントのテスト
  const testAttenderEndpoints = async () => {
    // アテンダー一覧取得
    const attendersResponse = await testEndpoint(ENDPOINTS.ATTENDER.LIST);
    
    // 最初のアテンダーIDを使用して詳細を取得
    if (attendersResponse?.success && Array.isArray(attendersResponse.data) && attendersResponse.data.length > 0) {
      const firstAttenderId = attendersResponse.data[0].id;
      await testEndpoint(ENDPOINTS.ATTENDER.DETAIL(firstAttenderId));
      
      // アテンダーの体験一覧を取得
      await testEndpoint(ENDPOINTS.ATTENDER.EXPERIENCES(firstAttenderId));
    }
  };

  // 体験関連エンドポイントのテスト
  const testExperienceEndpoints = async () => {
    // 体験一覧取得
    const experiencesResponse = await testEndpoint(ENDPOINTS.EXPERIENCE.LIST);
    
    // 最初の体験IDを使用して詳細を取得
    if (experiencesResponse?.success && Array.isArray(experiencesResponse.data) && experiencesResponse.data.length > 0) {
      const firstExperienceId = experiencesResponse.data[0].id;
      await testEndpoint(ENDPOINTS.EXPERIENCE.DETAIL(firstExperienceId));
    }
  };

  // カスタムエンドポイントのテスト
  const testCustomEndpoint = async () => {
    if (!customEndpoint) return;
    
    await testEndpoint(customEndpoint);
  };

  // タブ切り替え
  const handleTabChange = (tab: 'basic' | 'attenders' | 'experiences' | 'custom') => {
    setActiveTab(tab);
  };

  return (
    <>
      <Head>
        <title>APIテスト | echo 開発</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">APIテスト</h1>
        
        {/* ステータス表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">認証状態</h2>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                authStatus === 'checking' ? 'bg-yellow-500' :
                authStatus === 'authenticated' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                {authStatus === 'checking' ? '確認中...' :
                 authStatus === 'authenticated' ? '認証済み' : '未認証'}
              </span>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">API接続状態</h2>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                apiStatus === 'checking' ? 'bg-yellow-500' :
                apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                {apiStatus === 'checking' ? '確認中...' :
                 apiStatus === 'connected' ? '接続済み' : '未接続'}
              </span>
            </div>
          </div>
        </div>
        
        {/* タブ */}
        <div className="border-b mb-6">
          <div className="flex">
            {['basic', 'attenders', 'experiences', 'custom'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab 
                    ? 'border-b-2 border-indigo-500 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleTabChange(tab as any)}
              >
                {tab === 'basic' ? '基本' :
                 tab === 'attenders' ? 'アテンダー' :
                 tab === 'experiences' ? '体験' : 'カスタム'}
              </button>
            ))}
          </div>
        </div>
        
        {/* テストパネル */}
        <div className="mb-8">
          {activeTab === 'basic' && (
            <div>
              <p className="mb-4">基本的なAPIエンドポイントをテストします。</p>
              <button
                onClick={testBasicEndpoints}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300"
                disabled={isLoading || apiStatus !== 'connected'}
              >
                {isLoading ? 'テスト実行中...' : '基本エンドポイントをテスト'}
              </button>
            </div>
          )}
          
          {activeTab === 'attenders' && (
            <div>
              <p className="mb-4">アテンダー関連のAPIエンドポイントをテストします。</p>
              <button
                onClick={testAttenderEndpoints}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300"
                disabled={isLoading || apiStatus !== 'connected'}
              >
                {isLoading ? 'テスト実行中...' : 'アテンダーエンドポイントをテスト'}
              </button>
            </div>
          )}
          
          {activeTab === 'experiences' && (
            <div>
              <p className="mb-4">体験関連のAPIエンドポイントをテストします。</p>
              <button
                onClick={testExperienceEndpoints}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300"
                disabled={isLoading || apiStatus !== 'connected'}
              >
                {isLoading ? 'テスト実行中...' : '体験エンドポイントをテスト'}
              </button>
            </div>
          )}
          
          {activeTab === 'custom' && (
            <div>
              <p className="mb-4">カスタムAPIエンドポイントをテストします。</p>
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="APIエンドポイントを入力"
                  className="flex-1 px-3 py-2 border rounded-l-md"
                  disabled={isLoading}
                />
                <button
                  onClick={testCustomEndpoint}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md disabled:bg-indigo-300"
                  disabled={isLoading || !customEndpoint || apiStatus !== 'connected'}
                >
                  {isLoading ? 'テスト中...' : 'テスト'}
                </button>
              </div>
              
              {customResponse && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md overflow-auto">
                  <h3 className="font-medium mb-2">レスポンス:</h3>
                  <pre className="text-sm">
                    {JSON.stringify(customResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* テスト結果 */}
        <div>
          <h2 className="text-xl font-bold mb-4">テスト結果</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500">テスト結果はまだありません。</p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">エンドポイント</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メッセージ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {testResults.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {result.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status === 'success' ? '成功' : '失敗'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {result.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApiTestPage;
