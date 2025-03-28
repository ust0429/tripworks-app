/**
 * API テスター
 * 
 * バックエンド統合テスト用のUIコンポーネント
 */

import React, { useState } from 'react';
import {
  testAuthentication,
  testGetBookings,
  testGetReviews,
  testCreateReview,
  testCreateBooking,
  testFileUpload,
  runAllTests,
  TestResult
} from '../../utils/apiTester';
import { useAsyncHandler } from '../../utils/asyncErrorBoundary';

// 各テストの定義
const TESTS = [
  { name: '認証テスト', fn: testAuthentication },
  { name: '予約一覧取得テスト', fn: testGetBookings },
  { name: 'レビュー一覧取得テスト', fn: testGetReviews },
  { name: 'レビュー投稿テスト', fn: testCreateReview },
  { name: '予約作成テスト', fn: testCreateBooking },
  { name: 'ファイルアップロードテスト', fn: testFileUpload },
  { name: '全テスト実行', fn: runAllTests },
];

// テスト結果の表示コンポーネント
const TestResultView: React.FC<{ result: TestResult | TestResult[] }> = ({ result }) => {
  if (Array.isArray(result)) {
    return (
      <div className="test-results-container">
        <h3>テスト実行結果一覧</h3>
        {result.map((singleResult, index) => (
          <div key={index} className="test-result-item">
            <TestResultView result={singleResult} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`test-result ${result.success ? 'success' : 'failure'}`}>
      <h4>{result.name}: {result.success ? '成功' : '失敗'}</h4>
      <p><strong>メッセージ:</strong> {result.message}</p>
      <p><strong>所要時間:</strong> {result.duration.toFixed(2)}ms</p>
      
      {result.data && (
        <div className="result-data">
          <h5>レスポンスデータ:</h5>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
      
      {result.error && (
        <div className="result-error">
          <h5>エラー詳細:</h5>
          <pre>{JSON.stringify(result.error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// APIテスター本体
const ApiTester: React.FC = () => {
  const [results, setResults] = useState<TestResult | TestResult[] | null>(null);
  const { execute: runTest, isLoading, error } = useAsyncHandler(
    async (testFn: () => Promise<TestResult | TestResult[]>) => {
      const result = await testFn();
      setResults(result);
      return result;
    }
  );

  // テスト実行ハンドラ
  const handleRunTest = async (testFn: () => Promise<TestResult | TestResult[]>) => {
    setResults(null);
    await runTest(testFn);
  };

  return (
    <div className="api-tester-container">
      <h2>API統合テスター</h2>
      <p>このツールはバックエンドAPIとの連携を検証するためのものです。</p>
      
      <div className="test-buttons">
        {TESTS.map((test, index) => (
          <button
            key={index}
            onClick={() => handleRunTest(test.fn)}
            disabled={isLoading}
            className={`test-button ${test.name === '全テスト実行' ? 'run-all-button' : ''}`}
          >
            {test.name}
          </button>
        ))}
      </div>
      
      {isLoading && <div className="loading">テスト実行中...</div>}
      {error && <div className="error">エラーが発生しました: {error.message}</div>}
      
      {results && <TestResultView result={results} />}
      
      <style jsx>{`
        .api-tester-container {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
          font-family: sans-serif;
        }
        
        h2 {
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        
        .test-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 20px 0;
        }
        
        .test-button {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          background-color: #007bff;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .test-button:hover {
          background-color: #0056b3;
        }
        
        .test-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .run-all-button {
          background-color: #28a745;
        }
        
        .run-all-button:hover {
          background-color: #218838;
        }
        
        .loading {
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 4px;
          margin: 20px 0;
          text-align: center;
        }
        
        .error {
          padding: 15px;
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          margin: 20px 0;
        }
        
        .test-results-container {
          margin-top: 30px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
        }
        
        .test-result {
          margin: 15px 0;
          padding: 15px;
          border-radius: 4px;
        }
        
        .test-result.success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
        }
        
        .test-result.failure {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
        }
        
        .test-result h4 {
          margin-top: 0;
        }
        
        .result-data, .result-error {
          margin-top: 15px;
        }
        
        pre {
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 14px;
        }
        
        .test-result-item {
          margin-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 20px;
        }
        
        .test-result-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default ApiTester;
