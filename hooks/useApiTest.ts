/**
 * API統合テスト用カスタムフック
 * 
 * APIのテスト実行と結果管理を行うフック
 */

import { useState, useCallback } from 'react';
import apiTester, { TestResult } from '../utils/apiTester';
import { isRetryableError } from '../utils/errorHandler';

interface UseApiTestReturn {
  results: TestResult | TestResult[] | null;
  isRunning: boolean;
  error: Error | null;
  runTest: (testName: string) => Promise<void>;
  runAllTests: () => Promise<void>;
  clearResults: () => void;
}

/**
 * APIテスト実行・結果管理用フック
 */
export function useApiTest(): UseApiTestReturn {
  const [results, setResults] = useState<TestResult | TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 単一テストを実行
   */
  const runTest = useCallback(async (testName: string) => {
    try {
      setIsRunning(true);
      setError(null);
      
      // テスト関数を決定
      let testFn;
      switch (testName) {
        case 'authentication':
          testFn = apiTester.testAuthentication;
          break;
        case 'getAttenders':
          testFn = apiTester.testGetAttenders;
          break;
        case 'getExperiences':
          testFn = apiTester.testGetExperiences;
          break;
        case 'getBookings':
          testFn = apiTester.testGetBookings;
          break;
        case 'getReviews':
          testFn = apiTester.testGetReviews;
          break;
        case 'createReview':
          testFn = apiTester.testCreateReview;
          break;
        case 'createBooking':
          testFn = apiTester.testCreateBooking;
          break;
        case 'fileUpload':
          testFn = apiTester.testFileUpload;
          break;
        default:
          throw new Error(`不明なテスト: ${testName}`);
      }
      
      // テスト実行
      const result = await testFn();
      setResults(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // 再試行可能なエラーの場合は自動再試行を検討
      if (isRetryableError(error)) {
        console.info('再試行可能なエラーが発生しました。自動再試行を検討してください。');
      }
    } finally {
      setIsRunning(false);
    }
  }, []);

  /**
   * すべてのテストを実行
   */
  const runAllTests = useCallback(async () => {
    try {
      setIsRunning(true);
      setError(null);
      
      // すべてのテストを実行
      const results = await apiTester.runAllTests();
      setResults(results);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsRunning(false);
    }
  }, []);

  /**
   * テスト結果をクリア
   */
  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    isRunning,
    error,
    runTest,
    runAllTests,
    clearResults
  };
}

export default useApiTest;
