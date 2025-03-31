import api from '../api';
const cloudRunAttenderService = api.attenderService;
import axios from '../mocks/axiosMock';
import { AttenderProfile, LanguageSkill, ExpertiseArea, AvailabilityTimeSlot } from '../types/attender/profile';
import { isDevelopment, isDebugMode } from '../config/env';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.echo-app.jp/v1';
const USE_CLOUD_RUN_API = process.env.REACT_APP_USE_CLOUD_RUN_API === 'true';

// 開発用のモックデータ使用設定
// モックデータを強制的に使用する場合はこれをtrueに設定
// localStorageに保存された設定を優先
// USE_MOCKフラグは開発中のデバッグに使用する
// ローカルストレージに保存された設定がない場合はデフォルトでtrue
const getUseMockSetting = (): boolean => {
  try {
    const savedSetting = localStorage.getItem('echo_use_mock_data');
    if (savedSetting !== null) {
      return savedSetting === 'true';
    }
  } catch (e) {
    console.warn('Failed to read mock setting from localStorage:', e);
  }
  return true; // デフォルトでモックデータを使用
};

let USE_MOCK = getUseMockSetting();

// デバッグ用ユーティリティ関数
// 開発用にモック切り替えを設定する
// windowオブジェクトに開発者ツールを追加
export const setupDevTools = () => {
  if (isDevelopment() || isDebugMode()) {
    // グローバルな開発者ツールを設定
    const devTools = {
      // モックデータ設定変更
      setUseMock: (useMock: boolean) => {
        USE_MOCK = useMock;
        try {
          localStorage.setItem('echo_use_mock_data', String(useMock));
        } catch (e) {
          console.warn('Failed to save mock setting to localStorage:', e);
        }
        console.info(`Mock data mode ${useMock ? 'enabled' : 'disabled'}`);
        return useMock;
      },
      // 現在の設定を取得
      getUseMock: () => USE_MOCK,
      // アテンダー状態を切り替え
      setUserAttenderStatus: async (isAttender: boolean) => {
        try {
          // ユーザープロフィールのアテンダーフラグを変更
          await axios.put(`${API_URL}/users/profile`, { isAttender });
          console.info(`User attender status set to ${isAttender}`);
          return true;
        } catch (error) {
          console.error('Failed to update attender status:', error);
          return false;
        }
      },
      // ストレージの確認
      checkStorage: () => {
        try {
          const user = localStorage.getItem('echo_user');
          const parsedUser = user ? JSON.parse(user) : null;
          
          const currentUser = localStorage.getItem('echo_currentUser');
          const parsedCurrentUser = currentUser ? JSON.parse(currentUser) : null;
          
          console.info('Storage check:', {
            user: parsedUser,
            currentUser: parsedCurrentUser,
            useMock: USE_MOCK
          });
          
          return {
            user: parsedUser,
            currentUser: parsedCurrentUser,
            useMock: USE_MOCK
          };
        } catch (e) {
          console.error('Storage check failed:', e);
          return { error: e };
        }
      },
      // アテンダープロフィールの試験的読み込み
      testGetAttenderProfile: async (attenderId: string) => {
        try {
          console.info('Testing attender profile fetch for:', attenderId);
          const useMock = USE_MOCK;
          
          // 通常のAPI呼び出し
          USE_MOCK = false;
          console.info('Using real API...');
          let apiResult: AttenderProfile | null = null;
          let apiError: any = null;
          try {
            apiResult = await getAttenderProfile(attenderId);
          } catch (err) {
            apiError = err;
          }
          
          // モックAPI呼び出し
          USE_MOCK = true;
          console.info('Using mock API...');
          let mockResult: AttenderProfile | null = null;
          let mockError: any = null;
          try {
            mockResult = await getAttenderProfile(attenderId);
          } catch (err) {
            mockError = err;
          }
          
          // 元の設定に戻す
          USE_MOCK = useMock;
          
          return {
            apiResult,
            apiError,
            mockResult,
            mockError
          };
        } catch (e) {
          console.error('Test fetch failed:', e);
          return { error: e };
        }
      },
      // アテンダープロフィールを修復する
      repairAttenderProfile: async (attenderId: string) => {
        try {
          // ユーザーがアテンダーかどうかを確認
          const userData = await axios.get(`${API_URL}/users/profile`);
          if (!userData.data.isAttender) {
            // アテンダーでない場合はフラグを設定
            console.info('Setting user as attender...');
            await axios.put(`${API_URL}/users/profile`, { isAttender: true });
          }
          
          // モックデータでアテンダープロフィールを取得
          console.info('Creating mock attender profile...');
          const mockProfile = await axios.get(`${API_URL}/attenders/${attenderId}`);
          
          console.info('Repair completed successfully');
          return { success: true, profile: mockProfile.data };
        } catch (e) {
          console.error('Repair failed:', e);
          return { success: false, error: e };
        }
      }
    };
    
    // グローバルオブジェクトに追加
    (window as any).echoDevTools = devTools;
    console.info('Developer tools initialized. Access via window.echoDevTools');
  }
};

// アプリ起動時にデバッグツールをセットアップ
setupDevTools();

const mapToAttenderProfile = (apiAttender: any): AttenderProfile => {
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
    imageUrl: apiAttender.profilePhoto,
    experienceSamples: [],
    languages: defaultLanguageSkills,
    isLocalResident: apiAttender.isLocalResident || false,
    isMigrant: apiAttender.isMigrant || false,
    yearsMoved: apiAttender.yearsMoved,
    previousLocation: apiAttender.previousLocation,
    expertise: defaultExpertise,
    availableTimes: defaultAvailableTimes,
    rating: apiAttender.rating || 0,
    reviewCount: apiAttender.reviewCount || 0,
    createdAt: apiAttender.createdAt,
    updatedAt: apiAttender.updatedAt,
  };
};

const mapFromAttenderProfile = (profile: AttenderProfile): any => {
  return {
    id: profile.id,
    name: profile.name,
    description: profile.bio,
    location: profile.location,
    specialties: profile.specialties,
    profilePhoto: profile.imageUrl,
    isLocalResident: profile.isLocalResident,
    isMigrant: profile.isMigrant,
    yearsMoved: profile.yearsMoved,
    previousLocation: profile.previousLocation,
    expertise: profile.expertise,
    availableTimes: profile.availableTimes,
    languages: profile.languages,
  };
};

export const getAttenderProfile = async (attenderId: string): Promise<AttenderProfile> => {
  const handleCloudRunResponse = (response: any) => {
    const isApiResponse = response && ('success' in response);
    if (isApiResponse) {
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'APIリクエストが失敗しました');
      }
    }
    return response;
  };

  try {
    console.info(`アテンダープロフィール取得: ${attenderId}, モード: ${USE_MOCK ? 'モック' : 'API'}`);
    
    // モックデータ使用の場合はaxiosモックを使用
    if (USE_MOCK) {
      try {
        console.info('モックデータを使用してアテンダープロフィールを取得...');
        const response = await axios.get(`${API_URL}/attenders/${attenderId}`);
        console.info('モックアテンダープロフィール取得成功');
        return response.data;
      } catch (mockError) {
        console.error('モックアテンダープロフィール取得エラー:', mockError);
        throw mockError;
      }
    } 
    
    // APIを使用
    if (USE_CLOUD_RUN_API) {
      console.info('Cloud Run APIを使用してアテンダープロフィールを取得...');
      const response = await cloudRunAttenderService.getAttenderProfile(attenderId);
      const data = handleCloudRunResponse(response);
      return mapToAttenderProfile(data);
    } else {
      console.info('通常APIを使用してアテンダープロフィールを取得...');
      const response = await axios.get(`/api/attenders/${attenderId}/profile`);
      return response.data;
    }
  } catch (error) {
    console.error('アテンダープロフィールの取得に失敗しました:', error);
    throw error;
  }
};

export const updateAttenderProfile = async (profile: AttenderProfile, updateData?: Partial<AttenderProfile>): Promise<AttenderProfile> => {
  const handleCloudRunResponse = (response: any) => {
    const isApiResponse = response && ('success' in response);
    if (isApiResponse) {
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'APIリクエストが失敗しました');
      }
    }
    return response;
  };
  
  try {
    const dataToUpdate = updateData ? { ...profile, ...updateData } : profile;
    const now = new Date().toISOString();
    dataToUpdate.updatedAt = now;
    
    if (isDevelopment() || isDebugMode()) {
      console.info('プロフィール更新リクエスト:', { 
        profileId: profile.id, 
        fields: updateData ? Object.keys(updateData) : 'all'
      });
    }
    
    if (USE_CLOUD_RUN_API) {
      const apiData = mapFromAttenderProfile(dataToUpdate);
      const response = await api.client.put<{ success: boolean; data: any; }>(
        `/api/attenders/${profile.id}/profile`, 
        apiData
      );
      
      if (response.success && response.data) {
        return mapToAttenderProfile(response.data);
      } else {
        throw new Error(response.error?.message || 'アテンダープロフィールの更新に失敗しました');
      }
    } else {
      const response = await axios.put(`/api/attenders/${profile.id}/profile`, dataToUpdate);
      return response.data;
    }
  } catch (error) {
    console.error('アテンダープロフィールの更新に失敗しました:', error);
    throw error;
  }
};

export const getAttenders = async (): Promise<AttenderProfile[]> => {
  const handleCloudRunResponse = (response: any[]) => {
    const isApiResponse = response && Array.isArray(response);
    if (isApiResponse) {
      return response;
    }
    return [];
  };
  
  try {
    if (USE_CLOUD_RUN_API) {
      const response = await cloudRunAttenderService.searchAttenders({});
      const data = handleCloudRunResponse(response);
      return data.map(attender => mapToAttenderProfile(attender));
    } else {
      const response = await axios.get('/api/attenders');
      return response.data;
    }
  } catch (error) {
    console.error('アテンダー一覧の取得に失敗しました:', error);
    throw error;
  }
};

export const searchAttenders = async (searchParams: Partial<{
  location: string;
  specialty: string;
  language: string;
  rating: number;
  availability: string;
  page: number;
  limit: number;
}>): Promise<AttenderProfile[]> => {
  try {
    if (USE_CLOUD_RUN_API) {
      try {
        const response = await cloudRunAttenderService.searchAttenders(searchParams);
        return response.map(attender => mapToAttenderProfile(attender));
      } catch (error) {
        console.error('アテンダー検索中のエラー:', error);
        return [];
      }
    } else {
      const response = await axios.get('/api/attenders/search', { params: searchParams });
      return response.data;
    }
  } catch (error) {
    console.error('アテンダー検索に失敗しました:', error);
    throw error;
  }
};

export const uploadAttenderProfilePhoto = async (
  attenderId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      throw new Error('サポートされていないファイル形式です。JPEG, PNG, GIF, WebP形式の画像をアップロードしてください。');
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('画像サイズが大きすぎます。上限は5MBです。');
    }
    
    console.info(`プロフィール画像アップロード開始:`, {
      attenderId,
      fileName: file.name,
      fileType: file.type,
      fileSize: `${(file.size / 1024).toFixed(2)}KB`
    });

    if (USE_CLOUD_RUN_API) {
      try {
        const metadata = {
          attenderId,
          contentType: file.type,
          fileName: file.name.replace(/[^a-zA-Z0-9_.]/g, '_'),
          timestamp: Date.now()
        };

        if (isDevelopment() || isDebugMode()) {
          console.info('プロフィール画像アップロードリクエスト:', metadata);
        }
        
        const response = await api.client.uploadFile(
          `/api/attenders/${attenderId}/profile-photo`,
          file,
          'file',
          metadata,
          {},
          onProgress
        );
        
        if (response.success && response.data) {
          const photoUrl = response.data.photoUrl || response.data.url || response.data.imageUrl;
          console.info('プロフィール画像アップロード成功:', { photoUrl });
          return photoUrl;
        } else {
          console.error('プロフィール画像アップロード失敗:', response.error);
          throw new Error(response.error?.message || 'プロフィール画像のアップロードに失敗しました');
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('Network') || error.message.includes('network')) {
            throw new Error('ネットワークエラー: インターネット接続を確認してください');
          } else if (error.message.includes('timeout')) {
            throw new Error('タイムアウト: ファイルが大きすぎるか、接続が過負荷です。後ほど再試行してください');
          }
        }
        throw error;
      }
    } else {
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (onProgress) onProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            const dummyUrl = `https://example.com/dummy-profile-${attenderId}-${Date.now()}.jpg`;
            console.info('開発環境: プロフィール画像アップロードシミュレーション成功', { dummyUrl });
            resolve(dummyUrl);
          }
        }, 300);
      });
    }
  } catch (error) {
    console.error('プロフィール画像のアップロードに失敗しました:', error);
    throw error;
  }
};

export const uploadAndUpdateProfilePhoto = async (
  attenderId: string,
  file: File,
  profile?: AttenderProfile | null,
  onProgress?: (progress: number) => void,
  autoSave: boolean = true
): Promise<string> => {
  try {
    if (!attenderId) {
      throw new Error('アテンダーIDが必要です');
    }
    
    if (!file) {
      throw new Error('アップロードするファイルが必要です');
    }

    console.info('プロフィール画像アップロード開始');
    const imageUrl = await uploadAttenderProfilePhoto(attenderId, file, onProgress);
    
    if (profile && autoSave) {
      console.info('プロフィール画像の更新と自動保存を開始');
      
      const updatedProfile = { 
        ...profile,
        imageUrl,
        profilePhoto: imageUrl,
        profileImage: imageUrl
      };
      
      try {
        await saveProfile(updatedProfile);
        console.info('プロフィール画像の更新と保存が成功しました');
      } catch (error) {
        console.warn('画像はアップロードされましたが、プロフィールの保存に失敗しました:', error);
      }
    }
    
    return imageUrl;
  } catch (error) {
    console.error('画像アップロードとプロフィール更新に失敗しました:', error);
    throw error;
  }
};

export const deleteAttenderProfile = async (attenderId: string): Promise<boolean> => {
  try {
    if (USE_CLOUD_RUN_API) {
      const response = await api.client.delete(`/api/attenders/${attenderId}`);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.error?.message || 'アテンダープロフィールの削除に失敗しました');
      }
    } else {
      await axios.delete(`/api/attenders/${attenderId}`);
      return true;
    }
  } catch (error) {
    console.error('アテンダープロフィールの削除に失敗しました:', error);
    throw error;
  }
};

export const createExperience = async (attenderId: string, experienceData: any): Promise<any> => {
  try {
    if (USE_CLOUD_RUN_API) {
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

export const getExperiences = async (attenderId: string): Promise<any[]> => {
  try {
    if (USE_CLOUD_RUN_API) {
      const response = await api.client.get(`/api/attenders/${attenderId}/experiences`);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || '体験プラン一覧の取得に失敗しました');
      }
    } else {
      const profile = await getAttenderProfile(attenderId);
      return profile.experienceSamples || [];
    }
  } catch (error) {
    console.error('体験プラン一覧の取得に失敗しました:', error);
    throw error;
  }
};

export const updateExperience = async (experienceId: string, experienceData: any): Promise<any> => {
  try {
    if (USE_CLOUD_RUN_API) {
      console.warn('Cloud RunにupdateExperienceのエンドポイントはまだ実装されていません');
    }
    
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

export const deleteExperience = async (experienceId: string): Promise<boolean> => {
  try {
    if (USE_CLOUD_RUN_API) {
      console.warn('Cloud RunにdeleteExperienceのエンドポイントはまだ実装されていません');
    }
    
    return true;
  } catch (error) {
    console.error('体験プランの削除に失敗しました:', error);
    throw error;
  }
};

export const getAttenderBookings = async (attenderId: string, status?: string): Promise<any[]> => {
  try {
    if (USE_CLOUD_RUN_API) {
      console.warn('Cloud RunにgetAttenderBookingsのエンドポイントはまだ実装されていません');
    }
    
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
      return status ? booking.status === status : true;
    });
  } catch (error) {
    console.error('アテンダー予約一覧の取得に失敗しました:', error);
    throw error;
  }
};

export const getAttenderStats = async (attenderId: string): Promise<any> => {
  try {
    if (USE_CLOUD_RUN_API) {
      console.warn('Cloud RunにgetAttenderStatsのエンドポイントはまだ実装されていません');
    }
    
    const currentMonth = new Date().getMonth();
    const monthLabels = [
      '1月', '2月', '3月', '4月', '5月',
      '6月', '7月', '8月', '9月', '10月',
      '11月', '12月'
    ];
    
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

export const submitAttenderApplication = async (applicationData: any): Promise<string> => {
  try {
    if (USE_CLOUD_RUN_API) {
      const response = await api.client.post<{ success: boolean; data: any; }>(
        `/api/attenders/application`,
        applicationData
      );
      if (response.success && response.data) {
        const responseData = response.data as any;
        return responseData.id || responseData.applicationId || 'app_' + Date.now();
      } else {
        throw new Error(response.error?.message || 'アテンダー申請の提出に失敗しました');
      }
    } else {
      return `app_${Date.now()}`;
    }
  } catch (error) {
    console.error('アテンダー申請の提出に失敗しました:', error);
    throw error;
  }
};

export const getAttenderApplicationStatus = async (userId: string): Promise<any> => {
  try {
    if (USE_CLOUD_RUN_API) {
      console.warn('Cloud RunにgetAttenderApplicationStatusのエンドポイントはまだ実装されていません');
    }
    
    return {
      status: 'pending',
      applicationId: `app_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      expectedCompletionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error('アテンダー申請状況の取得に失敗しました:', error);
    throw error;
  }
};

export const saveDraftApplication = async (userId: string, applicationData: any): Promise<string> => {
  try {
    if (USE_CLOUD_RUN_API) {
      console.warn('Cloud RunにsaveDraftApplicationのエンドポイントはまだ実装されていません');
    }
    
    localStorage.setItem(`draft_attender_application_${userId}`, JSON.stringify(applicationData));
    return `draft_${Date.now()}`;
  } catch (error) {
    console.error('アテンダー申請のドラフト保存に失敗しました:', error);
    throw error;
  }
};

export const saveProfile = async (profile: AttenderProfile): Promise<boolean> => {
  try {
    console.info(`アテンダープロフィール[${profile.id}]を保存中...`);
    
    const attenderId = profile.id;
    if (!attenderId) {
      throw new Error('アテンダーIDが見つかりません');
    }
    
    const requiredFields = ['name', 'bio', 'location'];
    const missingFields = requiredFields.filter(field => !profile[field as keyof AttenderProfile]);
    
    if (missingFields.length > 0) {
      console.warn(`プロフィール保存警告: 必須フィールドが不足しています - ${missingFields.join(', ')}`);
    }
    
    if (USE_CLOUD_RUN_API) {
      try {
        const profileData: any = {
          name: profile.name,
          description: profile.bio || profile.biography,
          location: profile.location,
          specialties: profile.specialties || [],
          languages: profile.languages || [],
          expertise: profile.expertise || [],
          isLocalResident: profile.isLocalResident || false,
          isMigrant: profile.isMigrant || false,
          profilePhoto: profile.profilePhoto || profile.imageUrl
        };
        
        if ('yearsMoved' in profile && profile.yearsMoved) profileData.yearsMoved = profile.yearsMoved;
        if ('previousLocation' in profile && profile.previousLocation) profileData.previousLocation = profile.previousLocation;
        
        if (isDevelopment() || isDebugMode()) {
          console.info('プロフィール保存リクエスト:', { attenderId, profileData });
        }
        
        const response = await api.client.patch(
          `/api/attenders/${attenderId}/profile`,
          profileData
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
      try {
        const updatedProfile = await updateAttenderProfile(profile, {
          name: profile.name,
          bio: profile.bio,
          location: profile.location,
          specialties: profile.specialties,
          languages: profile.languages,
          expertise: profile.expertise,
          isLocalResident: profile.isLocalResident,
          isMigrant: profile.isMigrant
        });
        
        console.info('プロフィールが正常に保存されました:', updatedProfile.id);
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
  saveProfile,
  uploadAndUpdateProfilePhoto
};