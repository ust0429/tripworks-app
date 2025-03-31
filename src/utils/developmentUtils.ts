/**
 * 開発用ユーティリティ集
 * 
 * このファイルは開発環境でのみ使用するテスト・デバッグ用のユーティリティを提供します。
 * コンソールから直接アクセスできるようにwindowオブジェクトにエクスポートされます。
 * 本番環境では無効化されます。
 */

import { isDevelopment } from '../config/env';
import AttenderService from '../services/AttenderService';
import imageUploadTest from './imageUploadTest';
import profileScoreTest from './profileScoreTest';

// window.echoDevTools オブジェクトを作成
if (isDevelopment() && typeof window !== 'undefined') {
  // 既存のオブジェクトがあれば拡張、なければ新規作成
  (window as any).echoDevTools = {
    ...(window as any).echoDevTools,
    
    // サービス
    services: {
      attender: AttenderService
    },
    
    // テストユーティリティ
    test: {
      imageUpload: imageUploadTest,
      profileScore: profileScoreTest
    },
    
    // ヘルパー関数
    helpers: {
      // サンプルアテンダープロフィールの作成
      createSampleProfile: profileScoreTest.createSampleProfile,
      
      // 簡単なアップロードテスト
      testUpload: async (attenderId: string) => {
        console.info('画像アップロードテスト実行中...');
        try {
          // テスト用サンプル画像URLを使用（実際のリクエストは行われません）
          const imageUrl = 'https://picsum.photos/200/300';
          return await imageUploadTest.testImageUpload(attenderId, imageUrl);
        } catch (error) {
          console.error('テスト失敗:', error);
          throw error;
        }
      },
      
      // プロフィールスコアテスト
      testProfileScore: () => {
        console.info('プロフィールスコアテスト実行中...');
        try {
          const profile = profileScoreTest.createSampleProfile();
          profileScoreTest.analyzeProfileScore(profile);
          return { profile, score: calculateProfileCompletionScore(profile) };
        } catch (error) {
          console.error('テスト失敗:', error);
          throw error;
        }
      },
      
      // プロフィール改善シミュレーション
      simulateProfileImprovements: () => {
        console.info('プロフィール改善シミュレーション実行中...');
        try {
          const profile = profileScoreTest.createSampleProfile();
          profileScoreTest.simulateProfileImprovements(profile);
          return profile;
        } catch (error) {
          console.error('シミュレーション失敗:', error);
          throw error;
        }
      }
    }
  };
  
  console.info('開発者用ツールが初期化されました。window.echoDevTools でアクセスできます。');
}

// この関数は非開発環境では何もしない
export const initDevTools = (): void => {
  if (!isDevelopment()) {
    return;
  }
  
  console.info('%cEcho Dev Tools が初期化されました', 'color: green; font-weight: bold; font-size: 14px');
  console.info('%cデバッグツールを使用するには、コンソールで window.echoDevTools にアクセスしてください', 'color: blue;');
  console.info('例: window.echoDevTools.helpers.testProfileScore() - プロフィールスコアをテスト');
  
  // アテンダープロフィール修復用のショートカット
  (window as any).repairAttender = async () => {
    console.info('アテンダープロフィールを修復します...');
    if ((window as any).echoDevTools && (window as any).echoDevTools.repairAttenderProfile) {
      return (window as any).echoDevTools.repairAttenderProfile('1');
    } else if ((window as any).echoDevTools && (window as any).echoDevTools.setUserAttenderStatus) {
      await (window as any).echoDevTools.setUserAttenderStatus(true);
      console.info('ユーザーをアテンダーに設定しました');
      return { success: true, message: 'ユーザーをアテンダーに設定しました' };
    } else {
      console.error('デバッグツールが初期化されていません。再読み込みして試してください。');
      return { success: false, error: 'デバッグツールが利用できません' };
    }
  };
  
  console.info('%c簡易コマンド: window.repairAttender() - アテンダープロフィールの問題を修復', 'color: orange; font-weight: bold;');
};

// プロフィール完成度計算用の関数を直接インポート
import { calculateProfileCompletionScore } from './profileCompletionScore';

export default {
  initDevTools
};
