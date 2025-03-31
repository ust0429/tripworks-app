/**
 * 開発者向けユーティリティ
 * 
 * 開発時のデバッグや検証を支援するユーティリティ関数群
 */

import api from './apiClientEnhanced';
import { ENDPOINTS } from '../config/api';
import { isDevelopment } from '../config/env';
import { calculateProfileCompletionScore } from './profileCompletionScore';

// プロフィール完成度診断結果の型定義
interface ProfileDiagnosisResult {
  score: number;
  status: 'poor' | 'fair' | 'good' | 'excellent';
  suggestions: string[];
  completedSections: string[];
  incompleteSections: string[];
  timestamp: string;
}

/**
 * コンソールメッセージを装飾して出力する
 */
function logMessage(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
  const styles = {
    info: 'color: #3498db; font-weight: bold;',
    success: 'color: #2ecc71; font-weight: bold;',
    warning: 'color: #f39c12; font-weight: bold;',
    error: 'color: #e74c3c; font-weight: bold;'
  };
  
  console.log(`%c[Echo Dev Tools] ${message}`, styles[type]);
}

/**
 * ローカルストレージの状態を確認
 */
export function checkStorage(): void {
  try {
    logMessage('ローカルストレージ診断を開始...', 'info');
    
    // ユーザー関連の保存状態
    const userToken = localStorage.getItem('userToken');
    const userProfile = localStorage.getItem('userProfile');
    const userSettings = localStorage.getItem('userSettings');
    
    logMessage('🔑 認証状態:', 'info');
    console.log({
      token: userToken ? '存在します' : '存在しません',
      profile: userProfile ? JSON.parse(userProfile) : '存在しません',
      settings: userSettings ? JSON.parse(userSettings) : '存在しません'
    });
    
    // アテンダー関連の保存状態
    const attenderProfile = localStorage.getItem('attenderProfile');
    const attenderDraft = localStorage.getItem('attenderDraft');
    
    logMessage('👤 アテンダー状態:', 'info');
    console.log({
      profile: attenderProfile ? JSON.parse(attenderProfile) : '存在しません',
      draft: attenderDraft ? JSON.parse(attenderDraft) : '存在しません'
    });
    
    // セッションストレージの確認
    const temporaryFormData = sessionStorage.getItem('tempFormData');
    
    logMessage('💾 セッションストレージ:', 'info');
    console.log({
      temporaryFormData: temporaryFormData ? JSON.parse(temporaryFormData) : '存在しません'
    });
    
    logMessage('診断完了', 'success');
  } catch (error) {
    logMessage('ストレージ診断中にエラーが発生しました', 'error');
    console.error(error);
  }
}

/**
 * ユーザーのアテンダーステータスを設定
 */
export function setUserAttenderStatus(isAttender: boolean): void {
  try {
    const userProfileKey = 'userProfile';
    const userProfile = localStorage.getItem(userProfileKey);
    
    if (!userProfile) {
      logMessage('ユーザープロフィールが見つかりません', 'error');
      return;
    }
    
    const profileData = JSON.parse(userProfile);
    
    // アテンダーステータスを更新
    profileData.isAttender = isAttender;
    
    if (isAttender && !profileData.attenderId) {
      profileData.attenderId = `att_${Date.now()}`;
    }
    
    // 更新したプロフィールを保存
    localStorage.setItem(userProfileKey, JSON.stringify(profileData));
    
    logMessage(`ユーザーのアテンダーステータスを ${isAttender ? '有効' : '無効'} に設定しました`, 'success');
    console.log('更新後のプロフィール:', profileData);
    
    // ページのリロードを提案
    logMessage('変更を適用するにはページをリロードしてください', 'info');
  } catch (error) {
    logMessage('アテンダーステータス変更中にエラーが発生しました', 'error');
    console.error(error);
  }
}

/**
 * アテンダープロフィールの修復
 */
export function repairAttenderProfile(): void {
  try {
    // ユーザープロフィールを取得
    const userProfileKey = 'userProfile';
    const userProfile = localStorage.getItem(userProfileKey);
    
    if (!userProfile) {
      logMessage('ユーザープロフィールが見つかりません', 'error');
      return;
    }
    
    const profileData = JSON.parse(userProfile);
    
    // アテンダープロフィールを取得
    const attenderProfileKey = 'attenderProfile';
    let attenderProfile = localStorage.getItem(attenderProfileKey);
    
    // アテンダープロフィールが存在しない場合は新規作成
    if (!attenderProfile) {
      const newAttenderId = `att_${Date.now()}`;
      
      const newAttenderProfile = {
        id: newAttenderId,
        userId: profileData.id,
        name: profileData.name || 'テストアテンダー',
        profileImage: profileData.profileImage,
        email: profileData.email,
        biography: '',
        specialties: [],
        languages: [{ language: 'ja', proficiency: 'native' }],
        expertise: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // アテンダープロフィールを保存
      localStorage.setItem(attenderProfileKey, JSON.stringify(newAttenderProfile));
      
      // ユーザープロフィールにアテンダーIDを追加
      profileData.isAttender = true;
      profileData.attenderId = newAttenderId;
      localStorage.setItem(userProfileKey, JSON.stringify(profileData));
      
      logMessage('新しいアテンダープロフィールを作成しました', 'success');
      console.log('新しいアテンダープロフィール:', newAttenderProfile);
    } else {
      // 既存のアテンダープロフィールを修復
      const attenderData = JSON.parse(attenderProfile);
      
      // ユーザープロフィールとの一貫性を確保
      profileData.isAttender = true;
      profileData.attenderId = attenderData.id;
      localStorage.setItem(userProfileKey, JSON.stringify(profileData));
      
      logMessage('アテンダープロフィールを修復しました', 'success');
      console.log('修復後のアテンダープロフィール:', attenderData);
    }
    
    // ページのリロードを提案
    logMessage('変更を適用するにはページをリロードしてください', 'info');
  } catch (error) {
    logMessage('アテンダープロフィール修復中にエラーが発生しました', 'error');
    console.error(error);
  }
}

/**
 * プロフィール完成度テスト
 */
export async function testProfileScore(): Promise<ProfileDiagnosisResult | null> {
  try {
    logMessage('プロフィール完成度診断を開始...', 'info');
    
    // アテンダープロフィールを取得
    const attenderProfileKey = 'attenderProfile';
    const attenderProfile = localStorage.getItem(attenderProfileKey);
    
    if (!attenderProfile) {
      logMessage('アテンダープロフィールが見つかりません', 'error');
      return null;
    }
    
    const profileData = JSON.parse(attenderProfile);
    
    // プロフィール完成度を計算
    const { score, completedSections, incompleteSections, suggestions } = calculateProfileCompletionScore(profileData);
    
    // スコアに基づいてステータスを判定
    let status: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
    if (score >= 90) {
      status = 'excellent';
    } else if (score >= 70) {
      status = 'good';
    } else if (score >= 40) {
      status = 'fair';
    }
    
    // 診断結果を作成
    const result: ProfileDiagnosisResult = {
      score,
      status,
      suggestions,
      completedSections,
      incompleteSections,
      timestamp: new Date().toISOString()
    };
    
    // 結果を表示
    logMessage(`プロフィール完成度: ${score}%`, score >= 70 ? 'success' : score >= 40 ? 'warning' : 'error');
    console.log({
      status,
      completedSections,
      incompleteSections,
      suggestions
    });
    
    return result;
  } catch (error) {
    logMessage('プロフィール診断中にエラーが発生しました', 'error');
    console.error(error);
    return null;
  }
}

/**
 * 画像アップロードテスト
 */
export async function testUpload(attenderId: string): Promise<void> {
  try {
    logMessage('画像アップロードテストを開始...', 'info');
    
    // テスト用のダミー画像を作成
    const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const byteString = atob(base64Data.split(',')[1]);
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], 'test-image.png', { type: 'image/png' });
    
    // アップロード進捗を表示する関数
    const progressCallback = (progress: number) => {
      logMessage(`アップロード進捗: ${progress}%`, 'info');
    };
    
    // 画像をアップロード
    logMessage('画像をアップロード中...', 'info');
    const response = await api.uploadFile(
      ENDPOINTS.UPLOAD.PROFILE_PHOTO,
      file,
      'profilePhoto',
      { attenderId },
      {},
      progressCallback
    );
    
    if (response.success && response.data) {
      logMessage('画像アップロード成功', 'success');
      console.log('アップロード結果:', response.data);
      
      // プロフィール更新テスト
      logMessage('プロフィール写真URLを更新中...', 'info');
      
      const profileUpdateResponse = await api.patch(
        ENDPOINTS.ATTENDER.UPDATE_PROFILE(attenderId),
        {
          profileImage: response.data.url
        }
      );
      
      if (profileUpdateResponse.success) {
        logMessage('プロフィール更新成功', 'success');
        
        // ローカルストレージのプロフィールも更新
        const attenderProfileKey = 'attenderProfile';
        const attenderProfile = localStorage.getItem(attenderProfileKey);
        
        if (attenderProfile) {
          const profileData = JSON.parse(attenderProfile);
          profileData.profileImage = response.data.url;
          localStorage.setItem(attenderProfileKey, JSON.stringify(profileData));
          
          logMessage('ローカルストレージのプロフィールも更新しました', 'success');
        }
      } else {
        logMessage('プロフィール更新失敗', 'error');
        console.error('エラー:', profileUpdateResponse.error);
      }
    } else {
      logMessage('画像アップロード失敗', 'error');
      console.error('エラー:', response.error);
    }
  } catch (error) {
    logMessage('画像アップロードテスト中にエラーが発生しました', 'error');
    console.error(error);
  }
}

/**
 * プロフィール改善シミュレーション
 */
export async function simulateProfileImprovements(): Promise<void> {
  try {
    logMessage('プロフィール改善シミュレーションを開始...', 'info');
    
    // アテンダープロフィールを取得
    const attenderProfileKey = 'attenderProfile';
    const attenderProfile = localStorage.getItem(attenderProfileKey);
    
    if (!attenderProfile) {
      logMessage('アテンダープロフィールが見つかりません', 'error');
      return;
    }
    
    const profileData = JSON.parse(attenderProfile);
    
    // 現在のスコアを計算
    const initialAssessment = calculateProfileCompletionScore(profileData);
    logMessage(`現在のプロフィール完成度: ${initialAssessment.score}%`, 'info');
    
    // 改善ステップのシミュレーション
    const improvementSteps = [];
    
    // ステップ1: 基本情報の追加
    if (!profileData.biography || profileData.biography.length < 100) {
      profileData.biography = '私は地元の文化に精通したガイドです。5年間にわたり、この地域の歴史と伝統を研究してきました。特に、地元の芸術と料理に関する知識を共有することに情熱を持っています。訪問者に本物の体験を提供することを目指しています。';
      improvementSteps.push({
        action: '自己紹介文を充実させる',
        scoreBefore: initialAssessment.score,
        scoreAfter: calculateProfileCompletionScore(profileData).score
      });
    }
    
    // ステップ2: 専門分野の追加
    if (!profileData.specialties || profileData.specialties.length < 3) {
      profileData.specialties = ['伝統文化', '地元料理', '歴史散策', 'アート鑑賞'];
      improvementSteps.push({
        action: '専門分野を追加する',
        scoreBefore: calculateProfileCompletionScore(profileData).score - 1, // 前のステップのスコア
        scoreAfter: calculateProfileCompletionScore(profileData).score
      });
    }
    
    // ステップ3: 言語スキルの追加
    if (!profileData.languages || profileData.languages.length < 2) {
      profileData.languages = [
        { language: 'ja', proficiency: 'native' },
        { language: 'en', proficiency: 'intermediate' }
      ];
      improvementSteps.push({
        action: '言語スキルを追加する',
        scoreBefore: calculateProfileCompletionScore(profileData).score - 1,
        scoreAfter: calculateProfileCompletionScore(profileData).score
      });
    }
    
    // ステップ4: 専門知識の詳細追加
    if (!profileData.expertise || profileData.expertise.length === 0) {
      profileData.expertise = [
        {
          category: '伝統文化',
          subcategories: ['祭り', '工芸'],
          yearsOfExperience: 5,
          description: '地元の伝統的な祭りと工芸品について詳しく解説できます。'
        },
        {
          category: '地元料理',
          subcategories: ['郷土料理', '市場探訪'],
          yearsOfExperience: 3,
          description: '地元の食材を使った料理の知識があり、隠れた名店をご案内します。'
        }
      ];
      improvementSteps.push({
        action: '専門知識の詳細を追加する',
        scoreBefore: calculateProfileCompletionScore(profileData).score - 1,
        scoreAfter: calculateProfileCompletionScore(profileData).score
      });
    }
    
    // ステップ5: ソーシャルメディアリンクの追加
    if (!profileData.socialMediaLinks) {
      profileData.socialMediaLinks = {
        instagram: 'https://instagram.com/echoguide',
        twitter: 'https://twitter.com/echoguide'
      };
      improvementSteps.push({
        action: 'ソーシャルメディアリンクを追加する',
        scoreBefore: calculateProfileCompletionScore(profileData).score - 1,
        scoreAfter: calculateProfileCompletionScore(profileData).score
      });
    }
    
    // 改善結果を表示
    const finalScore = calculateProfileCompletionScore(profileData).score;
    logMessage(`改善後のプロフィール完成度: ${finalScore}%`, 'success');
    
    console.table(improvementSteps);
    
    // 更新されたプロフィールを保存するか確認
    logMessage('この改善をローカルストレージに適用しますか？ applyImprovements() を実行してください', 'info');
    
    // グローバルに関数を追加
    (window as any).applyImprovements = () => {
      localStorage.setItem(attenderProfileKey, JSON.stringify(profileData));
      logMessage('改善されたプロフィールを保存しました。ページをリロードしてください', 'success');
    };
  } catch (error) {
    logMessage('プロフィール改善シミュレーション中にエラーが発生しました', 'error');
    console.error(error);
  }
}

/**
 * 新しい画像アップロードテスト
 * AttenderServiceの新機能を使用
 */
export async function testNewUpload(attenderId: string): Promise<void> {
  try {
    logMessage('新しい画像アップロードテストを開始...', 'info');
    
    // 新しい進捗表示用UIの生成
    const progressId = `progress_${Date.now()}`;
    logMessage('アップロード進捗: 0%', 'info');
    
    // AttenderServiceの新しい画像アップロード関数を使用
    const imageUrl = await testNewUploadFeature(attenderId);
    
    if (imageUrl) {
      logMessage(`画像アップロード成功: ${imageUrl}`, 'success');
      
      // ローカルストレージのプロフィール更新確認
      const attenderProfileKey = 'attenderProfile';
      const attenderProfile = localStorage.getItem(attenderProfileKey);
      
      if (attenderProfile) {
        const profileData = JSON.parse(attenderProfile);
        
        if (profileData.profileImage !== imageUrl) {
          // プロフィール画像URLを更新
          profileData.profileImage = imageUrl;
          localStorage.setItem(attenderProfileKey, JSON.stringify(profileData));
          logMessage('ローカルストレージのプロフィールを更新しました', 'success');
        } else {
          logMessage('プロフィール画像は既に最新です', 'info');
        }
      }
    } else {
      logMessage('画像アップロード失敗', 'error');
    }
  } catch (error) {
    logMessage('新しい画像アップロードテスト中にエラーが発生しました', 'error');
    console.error(error);
  }
}

// 開発環境でのみグローバルに関数を公開
if (isDevelopment()) {
  // 開発者ツールをグローバルに追加
  (window as any).echoDevTools = {
    checkStorage,
    setUserAttenderStatus,
    repairAttenderProfile,
    testProfileScore,
    testUpload,
    testNewUpload,
    simulateProfileImprovements,
    test: {
      newUpload: testNewUpload
    },
    helpers: {
      logMessage,
      testNewUpload: testNewUploadFeature
    }
  };
  
  // repairAttender関数を短縮名でも提供
  (window as any).repairAttender = repairAttenderProfile;
  
  // 開発者向けメッセージを表示
  console.log('%cEcho Dev Tools が利用可能です', 'color: #3498db; font-size: 14px; font-weight: bold;');
  console.log('利用方法: window.echoDevTools または window.repairAttender()');
}

export default {
  checkStorage,
  setUserAttenderStatus,
  repairAttenderProfile,
  testProfileScore,
  testUpload,
  testNewUpload,
  simulateProfileImprovements
};
