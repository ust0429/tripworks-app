/**
 * アテンダー関連のサービス
 */

import api from '../api';
const cloudRunAttenderService = api.attenderService;
import axios from '../mocks/axiosMock';
import { AttenderProfile, LanguageSkill, ExpertiseArea, AvailabilityTimeSlot } from '../types/attender/profile';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.echo-app.jp/v1';

// 環境変数から実際のAPIを使用するかどうかを取得
const USE_CLOUD_RUN_API = process.env.REACT_APP_USE_CLOUD_RUN_API === 'true';

/**
 * API用のAttenderとAttenderProfileとの型変換関数
 */

// Cloud Run API AttenderからAttenderProfileへの変換
const mapToAttenderProfile = (apiAttender: any): AttenderProfile => {
  // 型変換のためのデフォルト値
  const defaultLanguageSkills: LanguageSkill[] = apiAttender.languages?.map((lang: any) => ({
    language: lang.language || '',
    proficiency: lang.proficiency || 'intermediate'
  })) || [];

  const defaultExpertise: ExpertiseArea[] = apiAttender.expertise?.map((exp: any) => ({
    category: exp.category || '',
    subcategories: exp.subcategories || [],
    yearsOfExperience: exp.yearsOfExperience,
    description: exp.description
  })) || [];

  const defaultAvailableTimes: AvailabilityTimeSlot[] = apiAttender.availableTimes?.map((time: any) => ({
    dayOfWeek: time.dayOfWeek || 0,
    startTime: time.startTime || '09:00',
    endTime: time.endTime || '17:00',
    isAvailable: time.isAvailable || false
  })) || [];

  return {
    id: apiAttender.id,
    name: apiAttender.name,
    bio: apiAttender.description || '',
    location: apiAttender.location,
    specialties: apiAttender.specialties || [],
    imageUrl: apiAttender.profilePhoto, // profilePhotoをimageUrlにマッピング
    experienceSamples: [], // 別途取得が必要
    languages: defaultLanguageSkills,
    isLocalResident: apiAttender.isLocalResident || false,
    isMigrant: apiAttender.isMigrant || false,
    yearsMoved: apiAttender.yearsMoved,
    previousLocation: apiAttender.previousLocation,
    expertise: defaultExpertise,
    availableTimes: defaultAvailableTimes,
    rating: apiAttender.rating || 0, // 代替属性
    reviewCount: apiAttender.reviewCount || 0,
    createdAt: apiAttender.createdAt,
    updatedAt: apiAttender.updatedAt,
  };
};

// AttenderProfileからCloud Run API Attenderへの変換
const mapFromAttenderProfile = (profile: AttenderProfile): any => {
  return {
    id: profile.id,
    name: profile.name,
    description: profile.bio,
    location: profile.location,
    specialties: profile.specialties,
    profilePhoto: profile.imageUrl, // imageUrlをprofilePhotoにマッピング
    isLocalResident: profile.isLocalResident,
    isMigrant: profile.isMigrant,
    yearsMoved: profile.yearsMoved,
    previousLocation: profile.previousLocation,
    expertise: profile.expertise,
    availableTimes: profile.availableTimes,
    languages: profile.languages,
    // APIモデルにはexperienceSamplesが含まれていない場合がある
  };
};

/**
 * アテンダープロフィールを取得する
 * @param attenderId アテンダーID
 */
export const getAttenderProfile = async (attenderId: string): Promise<AttenderProfile> => {
  // CloudRunAttenderServiceからの応答を型変換するメソッド
  const handleCloudRunResponse = (response: any) => {
    const isApiResponse = response && ('success' in response);
    if (isApiResponse) {
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'APIリクエストが失敗しました');
      }
    }
    return response; // そのままAttenderProfileとして返す
  };

  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      const response = await cloudRunAttenderService.getAttenderProfile(attenderId);
      const data = handleCloudRunResponse(response);
      return mapToAttenderProfile(data);
    } else {
      // 従来のモックサービスを使用
      const response = await axios.get(`/api/attenders/${attenderId}/profile`);
      return response.data;
    }
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
  // CloudRunAttenderServiceからの応答を型変換するメソッド
  const handleCloudRunResponse = (response: any) => {
    const isApiResponse = response && ('success' in response);
    if (isApiResponse) {
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'APIリクエストが失敗しました');
      }
    }
    return response; // そのままAttenderProfileとして返す
  };
  
  try {
    // 更新データがあればマージ
    const dataToUpdate = updateData ? { ...profile, ...updateData } : profile;
    
    if (USE_CLOUD_RUN_API) {
      // 後ほど実装される予定のAPIメソッドのダミー文
      console.warn('Cloud Run APIで1つの実装が必要です：アテンダーの更新');
      
      // 後ほど実装予定の問題の対応策
      const mockResponse = {
        success: true,
        data: {
          ...mapFromAttenderProfile(dataToUpdate),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      };
      
      const data = handleCloudRunResponse(mockResponse);
      return mapToAttenderProfile(data);
    } else {
      // 従来のモックサービスを使用
      const response = await axios.put(`/api/attenders/${profile.id}/profile`, dataToUpdate);
      return response.data;
    }
  } catch (error) {
    console.error('アテンダープロフィールの更新に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダー一覧を取得する
 */
export const getAttenders = async (): Promise<AttenderProfile[]> => {
  // CloudRunAttenderServiceからの応答を型変換するメソッド
  const handleCloudRunResponse = (response: any[]) => {
    const isApiResponse = response && Array.isArray(response);
    if (isApiResponse) {
      return response;
    }
    return []; // エラー時は空配列を返す
  };
  
  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      const response = await cloudRunAttenderService.searchAttenders({});
      // 型変換して元の動作に合わせる
      const data = handleCloudRunResponse(response);
      return data.map(attender => mapToAttenderProfile(attender));
    } else {
      // 従来のモックサービスを使用
      const response = await axios.get('/api/attenders');
      return response.data;
    }
  } catch (error) {
    console.error('アテンダー一覧の取得に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダーを検索する
 * @param searchParams 検索条件
 */
export const searchAttenders = async (searchParams: Partial<{
  location: string;
  specialty: string;
  language: string;
  rating: number;
  availability: string; // ISO日付文字列
  page: number;
  limit: number;
}>): Promise<AttenderProfile[]> => {
  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      try {
        const response = await cloudRunAttenderService.searchAttenders(searchParams);
        return response.map(attender => mapToAttenderProfile(attender));
      } catch (error) {
        console.error('アテンダー検索中のエラー:', error);
        return [];
      }
    } else {
      // 従来のモックサービスを使用
      const response = await axios.get('/api/attenders/search', { params: searchParams });
      return response.data;
    }
  } catch (error) {
    console.error('アテンダー検索に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダープロフィール画像をアップロードする
 * @param attenderId アテンダーID
 * @param file ファイル
 * @param onProgress 進行状況コールバック
 */
export const uploadAttenderProfilePhoto = async (
  attenderId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      // uploadAttenderProfilePhotoがない場合、別のメソッドを使用
const formData = new FormData();
formData.append('file', file);
formData.append('attenderId', attenderId);

const response = await api.client.uploadFile(
  `/api/attenders/${attenderId}/profile-photo`,
  file,
  'file',
  { attenderId },
  {},
  onProgress
);
      
      if (response.success && response.data) {
        return response.data.photoUrl;
      } else {
        throw new Error(response.error?.message || 'プロフィール画像のアップロードに失敗しました');
      }
    } else {
      // 開発環境ではモックデータを返す
      // 実際のファイルアップロードをシミュレート
      return new Promise((resolve) => {
        // 進行状況をシミュレート
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (onProgress) onProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            // ダミーのURLを返す
            resolve(`https://example.com/dummy-profile-${attenderId}-${Date.now()}.jpg`);
          }
        }, 300);
      });
    }
  } catch (error) {
    console.error('プロフィール画像のアップロードに失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダーのプロフィールを削除する
 * @param attenderId アテンダーID
 */
export const deleteAttenderProfile = async (attenderId: string): Promise<boolean> => {
  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      // メソッド名が異なる可能性があるので代替方法を使用
const response = await api.client.delete(`/api/attenders/${attenderId}`);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.error?.message || 'アテンダープロフィールの削除に失敗しました');
      }
    } else {
      // 従来のモックサービスを使用
      await axios.delete(`/api/attenders/${attenderId}`);
      return true;
    }
  } catch (error) {
    console.error('アテンダープロフィールの削除に失敗しました:', error);
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
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      // Cloud Run APIでエンドポイントが実装された場合は以下のコードを使用
      // 現在このメソッドはAPIで実装されていないため、代替策を使用します
      const response = await api.client.post<{ success: boolean; data: any; }>(
        `/api/attenders/${attenderId}/experiences`,
        experienceData
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || '体験プランの作成に失敗しました');
      }
    } else {
      // 開発環境ではモックデータを返す
      return {
        id: `exp_${Date.now()}`,
        ...experienceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
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
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      // メソッド名が異なる可能性があるので代替方法を使用
const response = await api.client.get(`/api/attenders/${attenderId}/experiences`);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || '体験プラン一覧の取得に失敗しました');
      }
    } else {
      // 開発環境では現在のアテンダープロフィールからサンプルを取得
      const profile = await getAttenderProfile(attenderId);
      return profile.experienceSamples || [];
    }
  } catch (error) {
    console.error('体験プラン一覧の取得に失敗しました:', error);
    throw error;
  }
};

/**
 * 体験プランを更新する
 * @param experienceId 体験プランID
 * @param experienceData 体験プランデータ
 */
export const updateExperience = async (experienceId: string, experienceData: any): Promise<any> => {
  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      // 現状ではcloudRunAttenderServiceに体験プラン更新用のメソッドがないので、
      // 必要に応じてexperienceServiceなどを使用する必要がある
      console.warn('Cloud RunにupdateExperienceのエンドポイントはまだ実装されていません');
      
      // デバッグ用コメント: システム拡張時に使用するエンドポイント
      // return cloudRunExperienceService.updateExperience(experienceId, experienceData);
    }
    
    // 開発環境ではモックデータを返す
    return {
      id: experienceId,
      ...experienceData,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('体験プランの更新に失敗しました:', error);
    throw error;
  }
};

/**
 * 体験プランを削除する
 * @param experienceId 体験プランID
 */
export const deleteExperience = async (experienceId: string): Promise<boolean> => {
  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      console.warn('Cloud RunにdeleteExperienceのエンドポイントはまだ実装されていません');
      
      // デバッグ用コメント: システム拡張時に使用するエンドポイント
      // return cloudRunExperienceService.deleteExperience(experienceId);
    }
    
    // 開発環境では成功をシミュレート
    return true;
  } catch (error) {
    console.error('体験プランの削除に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダーの予約一覧を取得する
 * @param attenderId アテンダーID
 * @param status フィルターするステータス (空の場合は全て)
 */
export const getAttenderBookings = async (attenderId: string, status?: string): Promise<any[]> => {
  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      console.warn('Cloud RunにgetAttenderBookingsのエンドポイントはまだ実装されていません');
      
      // 将来的に実装予定のエンドポイント
      // const params = status ? { status } : {};
      // return cloudRunApiClient.get(`/api/attenders/${attenderId}/bookings`, { params });
    }
    
    // 開発環境ではモックデータを返す
    const mockStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const filteredStatuses = status ? [status] : mockStatuses;
    
    return Array.from({ length: 10 }, (_, i) => {
      const randomStatus = filteredStatuses[Math.floor(Math.random() * filteredStatuses.length)];
      const mockDate = new Date();
      mockDate.setDate(mockDate.getDate() + Math.floor(Math.random() * 30) - 15);
      
      return {
        id: `booking_${Date.now()}_${i}`,
        date: mockDate.toISOString(),
        time: `${Math.floor(Math.random() * 12) + 9}:00`,
        duration: `${Math.floor(Math.random() * 3) + 1}時間`,
        location: '東京都渋谷区',
        status: randomStatus,
        experience: {
          id: `exp_${Date.now()}_${i}`,
          title: `仮の体験プラン ${i + 1}`,
        },
        user: {
          id: `user_${Date.now()}_${i}`,
          name: `仮のユーザー ${i + 1}`,
          avatarUrl: null
        },
        price: Math.floor(Math.random() * 5000) + 3000,
        paymentStatus: randomStatus === 'cancelled' ? 'refunded' : (randomStatus === 'pending' ? 'pending' : 'paid'),
        createdAt: new Date(Date.now() - 86400000 * (i + 1)).toISOString()
      };
    }).filter(booking => {
      // ステータスに基づいて予約をソートする
      return status ? booking.status === status : true;
    });
  } catch (error) {
    console.error('アテンダー予約一覧の取得に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダーのダッシュボード用統計情報を取得する
 * @param attenderId アテンダーID
 */
export const getAttenderStats = async (attenderId: string): Promise<any> => {
  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      console.warn('Cloud RunにgetAttenderStatsのエンドポイントはまだ実装されていません');
      
      // 将来的に実装予定のエンドポイント
      // return cloudRunApiClient.get(`/api/attenders/${attenderId}/stats`);
    }
    
    // 開発環境ではモックデータを返す
    const currentMonth = new Date().getMonth();
    const monthLabels = [
      '1月', '2月', '3月', '4月', '5月',
      '6月', '7月', '8月', '9月', '10月',
      '11月', '12月'
    ];
    
    // 直近の6ヶ月のラベルを生成
    const recentMonths = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - 5 + i + 12) % 12;
      return monthLabels[monthIndex];
    });
    
    return {
      totalExperiences: Math.floor(Math.random() * 20) + 5,
      totalBookings: Math.floor(Math.random() * 40) + 10,
      averageRating: (Math.random() * 1.5 + 3.5).toFixed(1),
      reviewCount: Math.floor(Math.random() * 30) + 5,
      totalRevenue: Math.floor(Math.random() * 200000) + 50000,
      completionRate: Math.floor(Math.random() * 20) + 80,
      bookingStats: {
        labels: recentMonths,
        data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 10) + 1)
      },
      revenueStats: {
        labels: recentMonths,
        data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 50000) + 5000)
      },
      popularExperiences: Array.from({ length: 3 }, (_, i) => ({
        id: `exp_${Date.now()}_${i}`,
        title: `仮の体験プラン ${i + 1}`,
        bookingCount: Math.floor(Math.random() * 15) + 5,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      }))
    };
  } catch (error) {
    console.error('アテンダー統計情報の取得に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダー申請を提出する
 * @param applicationData 申請データ
 */
export const submitAttenderApplication = async (applicationData: any): Promise<string> => {
  try {
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      // Cloud Run APIでエンドポイントが実装された場合は以下のコードを使用
      // 現在このメソッドはAPIで実装されていないため、代替策を使用します
      const response = await api.client.post<{ success: boolean; data: any; }>(
        `/api/attenders/application`,
        applicationData
      );
      if (response.success && response.data) {
        // 型アサーションを行って安全にアクセス
        const responseData = response.data as any;
        return responseData.id || responseData.applicationId || 'app_' + Date.now();
      } else {
        throw new Error(response.error?.message || 'アテンダー申請の提出に失敗しました');
      }
    } else {
      // 開発環境ではモックデータを返す
      return `app_${Date.now()}`;
    }
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
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      // 本来はユーザーIDに基づいて申請状況を取得するエンドポイントを用意すべき
      // ここでは単純化のため既存のモックを維持する
      console.warn('Cloud RunにgetAttenderApplicationStatusのエンドポイントはまだ実装されていません');
    }
    
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
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      // 本来はドラフト保存用のエンドポイントを用意すべき
      // ここでは単純化のため既存の機能を維持する
      console.warn('Cloud RunにsaveDraftApplicationのエンドポイントはまだ実装されていません');
    }
    
    // 開発環境ではローカルストレージに保存
    localStorage.setItem(`draft_attender_application_${userId}`, JSON.stringify(applicationData));
    return `draft_${Date.now()}`;
  } catch (error) {
    console.error('アテンダー申請のドラフト保存に失敗しました:', error);
    throw error;
  }
};

/**
 * アテンダープロフィールをバックエンドに保存する
 * @param profile アテンダープロフィール
 * @returns 保存の成否
 */
export const saveProfile = async (profile: AttenderProfile): Promise<boolean> => {
  try {
    console.info(`アテンダープロフィール[${profile.id}]を保存中...`);
    
    const attenderId = profile.id;
    if (!attenderId) {
      throw new Error('アテンダーIDが見つかりません');
    }
    
    if (USE_CLOUD_RUN_API) {
      // Cloud Run APIを使用
      try {
        // 後に実装予定の場合は以下のコードを使用
        const response = await api.client.patch(
          `/api/attenders/${attenderId}/profile`,
          {
            name: profile.name,
            description: profile.bio || profile.biography,
            specialties: profile.specialties,
            languages: profile.languages,
            expertise: profile.expertise,
            profilePhoto: profile.profilePhoto || profile.imageUrl
          }
        );
        
        if (response.success) {
          console.info('プロフィールが正常に保存されました');
          return true;
        } else {
          console.error('プロフィール保存エラー:', response.error);
          return false;
        }
      } catch (error) {
        console.error('プロフィール保存APIエラー:', error);
        return false;
      }
    } else {
      // 開発環境ではモックデータを使用
      // updateAttenderProfileを使用する
      try {
        await updateAttenderProfile(profile, {
          name: profile.name,
          bio: profile.bio,
          specialties: profile.specialties,
          languages: profile.languages,
          expertise: profile.expertise
        });
        console.info('プロフィールが正常に保存されました');
        return true;
      } catch (error) {
        console.error('プロフィール保存エラー:', error);
        return false;
      }
    }
  } catch (error) {
    console.error('プロフィール保存エラー:', error);
    return false;
  }
};

export default {
  getAttenderProfile,
  updateAttenderProfile,
  getAttenders,
  searchAttenders,
  uploadAttenderProfilePhoto,
  deleteAttenderProfile,
  createExperience,
  getExperiences,
  updateExperience,
  deleteExperience,
  getAttenderBookings,
  getAttenderStats,
  submitAttenderApplication,
  getAttenderApplicationStatus,
  saveDraftApplication,
  saveProfile
};