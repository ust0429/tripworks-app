import axios from '../mocks/axiosMock';
import { AttenderProfile } from '../types/attender/profile';
import { AttenderProfileService } from './AttenderProfileService';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.echo-app.jp/v1';

/**
 * アテンダープロフィールを取得する
 * @param attenderId アテンダーID
 */
export const getAttenderProfile = async (attenderId: string): Promise<AttenderProfile> => {
  try {
    // 開発環境ではローカルサービスを使用
    return await AttenderProfileService.getProfile(attenderId);
    
    // 本番環境ではAPIを使用
    // const response = await axios.get(`${API_URL}/attenders/${attenderId}/profile`);
    // return response.data;
  } catch (error) {
    console.error('アテンダープロフィールの取得に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダープロフィールを更新する
 * @param profile アテンダープロフィール
 * @param updateData 更新データ（オプション）
 */
export const updateAttenderProfile = async (profile: AttenderProfile, updateData?: Partial<AttenderProfile>): Promise<AttenderProfile> => {
  try {
    // 更新データがあればマージ
    const dataToUpdate = updateData ? { ...profile, ...updateData } : profile;
    
    // 開発環境ではローカルサービスを使用
    return await AttenderProfileService.updateProfile(dataToUpdate);
    
    // 本番環境ではAPIを使用
    // const response = await axios.put(`${API_URL}/attenders/${profile.id}/profile`, dataToUpdate);
    // return response.data;
  } catch (error) {
    console.error('アテンダープロフィールの更新に失敗しました:', error);
    throw error;
  }
};

/**
 * 体験プランを作成する
 * @param attenderId アテンダーID
 * @param experienceData 体験プランデータ
 */
export const createExperience = async (attenderId: string, experienceData: any): Promise<any> => {
  try {
    // 本番環境ではAPIを使用
    // const response = await axios.post(`${API_URL}/attenders/${attenderId}/experiences`, experienceData);
    // return response.data;
    
    // 開発環境ではモックデータを返す
    return {
      id: `exp_${Date.now()}`,
      ...experienceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('体験プランの作成に失敗しました:', error);
    throw error;
  }
};

/**
 * 体験プラン一覧を取得する
 * @param attenderId アテンダーID
 */
export const getExperiences = async (attenderId: string): Promise<any[]> => {
  try {
    // 本番環境ではAPIを使用
    // const response = await axios.get(`${API_URL}/attenders/${attenderId}/experiences`);
    // return response.data;
    
    // 開発環境では現在のアテンダープロフィールからサンプルを取得
    const profile = await getAttenderProfile(attenderId);
    return profile.experienceSamples || [];
  } catch (error) {
    console.error('体験プラン一覧の取得に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダー申請を提出する
 * @param applicationData 申請データ
 */
export const submitAttenderApplication = async (applicationData: any): Promise<string> => {
  try {
    // 本番環境ではAPIを使用
    // const response = await axios.post(`${API_URL}/attender-applications`, applicationData);
    // return response.data.applicationId;
    
    // 開発環境ではモックデータを返す
    return `app_${Date.now()}`;
  } catch (error) {
    console.error('アテンダー申請の提出に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダー申請状況を取得する
 * @param userId ユーザーID
 */
export const getAttenderApplicationStatus = async (userId: string): Promise<any> => {
  try {
    // 本番環境ではAPIを使用
    // const response = await axios.get(`${API_URL}/users/${userId}/attender-application-status`);
    // return response.data;
    
    // 開発環境ではモックデータを返す
    return {
      status: 'pending', // 'pending', 'approved', 'rejected'
      applicationId: `app_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      expectedCompletionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5日後
    };
  } catch (error) {
    console.error('アテンダー申請状況の取得に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダー申請のドラフトを保存する
 * @param userId ユーザーID
 * @param applicationData 申請データ
 */
export const saveDraftApplication = async (userId: string, applicationData: any): Promise<string> => {
  try {
    // 本番環境ではAPIを使用
    // const response = await axios.post(`${API_URL}/users/${userId}/attender-applications/draft`, applicationData);
    // return response.data.applicationId;
    
    // 開発環境ではローカルストレージに保存
    localStorage.setItem(`draft_attender_application_${userId}`, JSON.stringify(applicationData));
    return `draft_${Date.now()}`;
  } catch (error) {
    console.error('アテンダー申請のドラフト保存に失敗しました:', error);
    throw error;
  }
};
