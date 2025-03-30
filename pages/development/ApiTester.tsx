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
  testGetAttenders,
  testGetExperiences,
  runAllTests,
  printTestResults,
  TestResult
} from '../../utils/apiTester';
import { useAsyncHandler } from '../../hooks/useAsyncHandler';

// 各テストの定義
const TESTS = [
  { name: '認証テスト', fn: testAuthentication },
  { name: 'アテンダー一覧取得テスト', fn: testGetAttenders },
  { name: '体験一覧取得テスト', fn: testGetExperiences },
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
    // 全テスト実行時の結果
    const successCount = result.filter(r => r.success).length;
    const totalCount = result.length;
    const successRate = totalCount > 0 ? (successCount / totalCount * 100) : 0;
    
    return (
      <div className="test-results-container">
        <div className="test-summary">
          <h3>テスト実行結果まとめ</h3>
          <div className="test-stats">
            <div className="stat-item">
              <span className="stat-label">合計テスト数:</span>
              <span className="stat-value">{totalCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">成功:</span>
              <span className="stat-value success">{successCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">失敗:</span>
              <span className="stat-value failure">{totalCount - successCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">成功率:</span>
              <span className={`stat-value ${successRate >= 80 ? 'success' : 'warning'}`}>
                {successRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        
        <h3>個別テスト結果</h3>
        {result.map((singleResult, index) => (
          <div key={index} className={`test-result-item ${singleResult.success ? 'success' : 'failure'}`}>
            <h4>
              <span className="result-icon">{singleResult.success ? '✅' : '❌'}</span>
              {singleResult.name}
            </h4>
            <p className="result-message">{singleResult.message}</p>
            <p className="result-time">所要時間: {singleResult.duration.toFixed(2)}ms</p>
            
            {singleResult.data && (
              <details className="result-details">
                <summary>レスポンスデータを表示</summary>
                <pre>{JSON.stringify(singleResult.data, null, 2)}</pre>
              </details>
            )}
            
            {singleResult.error && (
              <details className="result-details error-details">
                <summary>エラー詳細を表示</summary>
                <pre>{JSON.stringify(singleResult.error, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    );
  }

  // 単体テスト実行時の結果
  return (
    <div className={`test-result ${result.success ? 'success' : 'failure'}`}>
      <h4>
        <span className="result-icon">{result.success ? '✅' : '❌'}</span>
        {result.name}
      </h4>
      <p className="result-message">{result.message}</p>
      <p className="result-time">所要時間: {result.duration.toFixed(2)}ms</p>
      
      {result.data && (
        <details className="result-details">
          <summary>レスポンスデータを表示</summary>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </details>
      )}
      
      {result.error && (
        <details className="result-details error-details">
          <summary>エラー詳細を表示</summary>
          <pre>{JSON.stringify(result.error, null, 2)}</pre>
        </details>
      )}
    </div>
  );
};

// APIテスター本体
const ApiTester: React.FC = () => {
  const [results, setResults] = useState<TestResult | TestResult[] | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<boolean>(false);
  
  const { execute: runTest, isLoading, error } = useAsyncHandler(
    async (testFn: () => Promise<TestResult | TestResult[]>) => {
      const result = await testFn();
      setResults(result);
      
      // コンソール出力が有効な場合
      if (consoleOutput) {
        if (Array.isArray(result)) {
          printTestResults(result);
        } else {
          printTestResults([result]);
        }
      }
      
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
      <h2>Echo アプリ API統合テスター</h2>
      <p>このツールはバックエンドAPIとの連携を検証するためのものです。各ボタンをクリックして対応するテストを実行します。</p>
      
      <div className="tester-options">
        <label className="console-option">
          <input 
            type="checkbox" 
            checked={consoleOutput} 
            onChange={(e) => setConsoleOutput(e.target.checked)} 
          />
          テスト結果をコンソールにも出力する（開発者ツール F12 で確認）
        </label>
      </div>
      
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
      
      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>テスト実行中...</p>
        </div>
      )}
      
      {error && (
        <div className="error">
          <h4>エラーが発生しました</h4>
          <p>{error.message}</p>
          <details>
            <summary>詳細情報</summary>
            <pre>{error.stack}</pre>
          </details>
        </div>
      )}
      
      {results && <TestResultView result={results} />}
      
      <style jsx>{`
        .api-tester-container {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        h2 {
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          color: #1a1a1a;
        }
        
        .tester-options {
          margin: 15px 0;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        
        .console-option {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #555;
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
          font-size: 14px;
          font-weight: 500;
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
          font-weight: 600;
        }
        
        .run-all-button:hover {
          background-color: #218838;
        }
        
        .loading {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 4px;
          margin: 20px 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #007bff;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          padding: 20px;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .test-summary {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .test-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 15px;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
        }
        
        .stat-value.success {
          color: #28a745;
        }
        
        .stat-value.failure {
          color: #dc3545;
        }
        
        .stat-value.warning {
          color: #ffc107;
        }
        
        .test-result, .test-result-item {
          margin: 15px 0;
          padding: 15px;
          border-radius: 4px;
          position: relative;
        }
        
        .test-result-item {
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        }
        
        .test-result-item:last-child {
          border-bottom: none;
        }
        
        .test-result.success, .test-result-item.success {
          background-color: rgba(40, 167, 69, 0.1);
        }
        
        .test-result.failure, .test-result-item.failure {
          background-color: rgba(220, 53, 69, 0.1);
        }
        
        .result-icon {
          margin-right: 8px;
          font-size: 20px;
        }
        
        .test-result h4, .test-result-item h4 {
          margin-top: 0;
          display: flex;
          align-items: center;
        }
        
        .result-message {
          font-size: 16px;
          margin: 10px 0;
        }
        
        .result-time {
          font-size: 14px;
          color: #666;
        }
        
        .result-details {
          margin-top: 15px;
          background-color: #f8f9fa;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .result-details summary {
          padding: 10px;
          cursor: pointer;
          background-color: #e9ecef;
          font-weight: 500;
        }
        
        .result-details summary:hover {
          background-color: #dee2e6;
        }
        
        .error-details summary {
          background-color: #f8d7da;
        }
        
        .error-details summary:hover {
          background-color: #f5c6cb;
        }
        
        pre {
          padding: 15px;
          margin: 0;
          overflow-x: auto;
          font-size: 14px;
          line-height: 1.5;
          background-color: #f8f9fa;
          border-top: 1px solid #dee2e6;
        }
      `}</style>
    </div>
  );
};

export default ApiTester;
