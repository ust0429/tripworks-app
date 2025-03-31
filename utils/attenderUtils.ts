import api from './apiClientEnhanced';
import { ENDPOINTS } from '../config/api';
import { isDevelopment, isDebugMode } from '../config/env';

export async function uploadAttenderProfilePhoto(
  attenderId: string,
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('画像ファイルのみアップロード可能です');
    }
    
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('画像サイズは5MB以下にしてください');
    }
    
    if (isDevelopment()) {
      if (progressCallback) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          progressCallback(progress);
          if (progress >= 100) clearInterval(interval);
        }, 300);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `https://example.com/profiles/${attenderId}/${file.name}?t=${Date.now()}`;
    }
    
    const additionalData = { attenderId };
    
    const response = await api.uploadFile(
      ENDPOINTS.UPLOAD.PROFILE_PHOTO,
      file,
      'profilePhoto',
      additionalData,
      {},
      progressCallback
    );
    
    if (response.success && response.data && response.data.url) {
      return response.data.url;
    }
    
    throw new Error(response.error?.message || 'アップロード失敗');
  } catch (error) {
    console.error('プロフィール写真アップロードエラー:', error);
    throw error;
  }
}

export async function updateProfileWithPhoto(
  attenderId: string,
  profile: any, 
  imageUrl: string
): Promise<boolean> {
  try {
    await api.patch(
      ENDPOINTS.ATTENDER.UPDATE_PROFILE(attenderId),
      {
        profileImage: imageUrl,
        imageUrl: imageUrl
      }
    );
    
    if (isDevelopment()) {
      try {
        const attenderProfileKey = 'attenderProfile';
        const storedProfile = localStorage.getItem(attenderProfileKey);
        
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          profileData.profileImage = imageUrl;
          profileData.imageUrl = imageUrl;
          localStorage.setItem(attenderProfileKey, JSON.stringify(profileData));
        }
      } catch (e) {
        console.warn('ローカルストレージ更新エラー:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return false;
  }
}

export async function uploadAndUpdateProfilePhoto(
  attenderId: string,
  file: File,
  profile: any,
  progressCallback?: (progress: number) => void
): Promise<string> {
  const imageUrl = await uploadAttenderProfilePhoto(attenderId, file, progressCallback);
  await updateProfileWithPhoto(attenderId, profile, imageUrl);
  return imageUrl;
}

export function repairAttenderProfile(): boolean {
  try {
    const userProfileKey = 'userProfile';
    const userProfile = localStorage.getItem(userProfileKey);
    
    if (!userProfile) return false;
    
    const profileData = JSON.parse(userProfile);
    
    const attenderProfileKey = 'attenderProfile';
    let attenderProfile = localStorage.getItem(attenderProfileKey);
    
    if (!attenderProfile) {
      const newAttenderId = `att_${Date.now()}`;
      
      const newAttenderProfile = {
        id: newAttenderId,
        userId: profileData.id || 'user_' + Date.now(),
        name: profileData.name || 'テストアテンダー',
        profileImage: profileData.profileImage || '',
        email: profileData.email || '',
        biography: '',
        specialties: [],
        languages: [{ language: 'ja', proficiency: 'native' }],
        expertise: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(attenderProfileKey, JSON.stringify(newAttenderProfile));
      
      profileData.isAttender = true;
      profileData.attenderId = newAttenderId;
      localStorage.setItem(userProfileKey, JSON.stringify(profileData));
      
      return true;
    } else {
      const attenderData = JSON.parse(attenderProfile);
      
      profileData.isAttender = true;
      profileData.attenderId = attenderData.id;
      localStorage.setItem(userProfileKey, JSON.stringify(profileData));
      
      return true;
    }
  } catch (error) {
    console.error('アテンダープロフィール修復失敗:', error);
    return false;
  }
}

export default {
  uploadAttenderProfilePhoto,
  updateProfileWithPhoto,
  uploadAndUpdateProfilePhoto,
  repairAttenderProfile
};
