import { AttenderProfileData, ExperienceSample } from '@/types/attender/profile';
import { userService } from './userService';
import { convertApplicationToProfile } from '@/types/attender/profile';

// ローカルストレージのキー
const STORAGE_KEY = 'attender_profile_data';

// デモ用モックデータ（開発環境用）
const MOCK_PROFILE: AttenderProfileData = {
  id: 'att-123456',
  name: '山田 太郎',
  email: 'yamada@example.com',
  phoneNumber: '090-1234-5678',
  address: '東京都渋谷区代々木1-2-3',
  bio: '東京で10年以上暮らしている地元ガイドです。特に渋谷・原宿のカルチャーに詳しく、アートやファッションの視点から街を案内します。また、都内の隠れた名店や、観光客があまり行かない地元の人たちに人気のスポットをご紹介します。',
  profileImage: '/images/profile-placeholder.jpg',
  headerImage: '/images/header-placeholder.jpg',
  expertise: ['local-culture', 'art', 'food', 'photography'],
  languages: ['日本語', '英語'],
  experienceSamples: [
    {
      id: 'exp-001',
      title: '裏原宿アートスポット巡り',
      description: '観光客には知られていない原宿の裏通りにあるギャラリーや、若手アーティストの活動拠点を巡ります。',
      imageUrl: '/images/experience-1.jpg',
      duration: '3時間',
      price: 5000
    },
    {
      id: 'exp-002',
      title: '夜の渋谷フードツアー',
      description: '地元の人だけが知る美味しい居酒屋や深夜営業の名店を巡り、東京の食文化を体験します。',
      imageUrl: '/images/experience-2.jpg',
      duration: '4時間',
      price: 8000
    }
  ],
  socialMediaLinks: [
    { platform: 'Instagram', url: 'https://instagram.com/yamada_taro' },
    { platform: 'Twitter', url: 'https://twitter.com/yamada_taro' }
  ],
  availability: {
    'monday': { available: true, startTime: '18:00', endTime: '22:00' },
    'tuesday': { available: false },
    'wednesday': { available: true, startTime: '18:00', endTime: '22:00' },
    'thursday': { available: true, startTime: '18:00', endTime: '22:00' },
    'friday': { available: true, startTime: '18:00', endTime: '22:00' },
    'saturday': { available: true, startTime: '10:00', endTime: '22:00' },
    'sunday': { available: true, startTime: '10:00', endTime: '18:00' }
  },
  rating: 4.8,
  reviewCount: 23,
  status: 'active',
  joinedDate: '2023-05-15T00:00:00Z',
  verificationStatus: 'verified',
  achievementBadges: ['top-rated', 'quick-responder', 'experienced-host']
};

/**
 * アテンダープロフィールを取得
 * 本番環境ではAPIエンドポイントから取得する想定
 */
export const getAttenderProfile = async (profileId?: string): Promise<AttenderProfileData> => {
  try {
    // 開発環境はローカルストレージをチェック
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData) as AttenderProfileData;
      }
    }
    
    // プロフィールIDが指定されていない場合は現在のユーザーのプロフィールを取得
    if (!profileId && typeof window !== 'undefined') {
      try {
        // 現在のユーザーIDの取得を試みる
        const currentUser = await userService.getCurrentUser();
        if (currentUser?.id) {
          profileId = currentUser.id;
        }
      } catch (error) {
        console.warn('現在のユーザー情報の取得に失敗しました', error);
      }
    }
    
    // 本番環境ではAPIに接続
    // TODO: 本番環境では以下のコメントを解除
    /*
    const response = await fetch(`/api/attenders/${profileId || 'me'}/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`プロフィール取得エラー: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    */
    
    // 開発用：APIリクエストの模擬 (1秒待機)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 開発環境ではモックデータを返す
    return MOCK_PROFILE;
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    throw error;
  }
};

/**
 * アテンダープロフィールを更新
 * 本番環境ではAPIエンドポイントに送信する想定
 */
export const updateAttenderProfile = async (profileData: Partial<AttenderProfileData>): Promise<boolean> => {
  try {
    // 現在のプロフィールを取得
    const currentProfile = await getAttenderProfile();
    
    // 更新されたプロフィール
    const updatedProfile = {
      ...currentProfile,
      ...profileData,
      // 更新日時を自動的に設定
      updatedAt: new Date().toISOString()
    };
    
    // 本番環境ではAPIに接続
    // TODO: 本番環境では以下のコメントを解除
    /*
    const response = await fetch(`/api/attenders/${updatedProfile.id || 'me'}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updatedProfile),
    });
    
    if (!response.ok) {
      throw new Error(`プロフィール更新エラー: ${response.status}`);
    }
    
    return true;
    */
    
    // APIリクエストの模擬 (1秒待機)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 開発環境ではローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    }
    
    return true;
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    throw error;
  }
};

/**
 * 体験サンプルを追加
 */
export const addExperienceSample = async (
  profileId: string,
  sample: Omit<ExperienceSample, 'id'>
): Promise<ExperienceSample> => {
  try {
    const currentProfile = await getAttenderProfile(profileId);
    
    // 新しいIDを生成
    const newId = `exp-${Date.now()}`;
    
    // 新しいサンプルを作成
    const newSample: ExperienceSample = {
      ...sample,
      id: newId
    };
    
    // プロフィールを更新
    const updatedSamples = [...currentProfile.experienceSamples, newSample];
    await updateAttenderProfile({ experienceSamples: updatedSamples });
    
    return newSample;
  } catch (error) {
    console.error('体験サンプル追加エラー:', error);
    throw error;
  }
};

/**
 * 体験サンプルを削除
 */
export const removeExperienceSample = async (
  profileId: string,
  sampleId: string
): Promise<boolean> => {
  try {
    const currentProfile = await getAttenderProfile(profileId);
    
    // サンプルをフィルタリング
    const updatedSamples = currentProfile.experienceSamples.filter(
      sample => sample.id !== sampleId
    );
    
    // サンプル数が変わらなければ該当するサンプルがない
    if (updatedSamples.length === currentProfile.experienceSamples.length) {
      return false;
    }
    
    // プロフィールを更新
    await updateAttenderProfile({ experienceSamples: updatedSamples });
    
    return true;
  } catch (error) {
    console.error('体験サンプル削除エラー:', error);
    throw error;
  }
};

/**
 * 体験サンプルを更新
 */
export const updateExperienceSample = async (
  profileId: string,
  sampleId: string,
  updates: Partial<ExperienceSample>
): Promise<ExperienceSample | null> => {
  try {
    const currentProfile = await getAttenderProfile(profileId);
    
    // 更新対象のサンプルを検索
    const sampleIndex = currentProfile.experienceSamples.findIndex(
      sample => sample.id === sampleId
    );
    
    // サンプルが見つからなければnullを返す
    if (sampleIndex === -1) {
      return null;
    }
    
    // サンプルを更新
    const updatedSample = {
      ...currentProfile.experienceSamples[sampleIndex],
      ...updates
    };
    
    // プロフィールを更新
    const updatedSamples = [...currentProfile.experienceSamples];
    updatedSamples[sampleIndex] = updatedSample;
    await updateAttenderProfile({ experienceSamples: updatedSamples });
    
    return updatedSample;
  } catch (error) {
    console.error('体験サンプル更新エラー:', error);
    throw error;
  }
};
