import React, { useEffect, useState } from 'react';
import { AttenderProfile } from '../../../types/attender/profile';
import { IAttenderProfile, IAvailabilityDay } from '../../../types/attender';

/**
 * 新型 AttenderProfile を旧型 IAttenderProfile に変換するアダプター
 */
interface ProfileAdapterProps {
  profile: AttenderProfile;
  children: (adaptedProfile: IAttenderProfile) => React.ReactNode;
}

const ProfileAdapter: React.FC<ProfileAdapterProps> = ({ profile, children }) => {
  // 旧型フォーマットに変換したプロフィール
  const [adaptedProfile, setAdaptedProfile] = useState<IAttenderProfile>({
    id: '',
    userId: '',
    displayName: '',
    bio: '',
    location: '',
    languages: [],
    expertise: [],
    experiences: [],
    availability: {},
    profileImage: '',
    rating: 0,
    reviewCount: 0,
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  useEffect(() => {
    // 新型から旧型への変換ロジック
    const convertProfile = () => {
      // 利用可能時間の変換
      const availabilityMap: Record<string, IAvailabilityDay> = {};
      if (Array.isArray(profile.availability)) {
        profile.availability.forEach(day => {
          // 曜日を数値から文字列に変換
          const dayString = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][day.dayOfWeek];
          
          // 時間枠から時間範囲を計算
          let startHour = 9; // デフォルト値
          let endHour = 17; // デフォルト値
          
          if (day.timeSlots && day.timeSlots.length > 0) {
            // 最初のスロットの開始時間を取得
            const firstSlot = day.timeSlots[0];
            if (firstSlot.startTime) {
              const startTimeParts = firstSlot.startTime.split(':');
              if (startTimeParts.length > 0) {
                startHour = parseInt(startTimeParts[0], 10);
              }
            }
            
            // 最後のスロットの終了時間を取得
            const lastSlot = day.timeSlots[day.timeSlots.length - 1];
            if (lastSlot.endTime) {
              const endTimeParts = lastSlot.endTime.split(':');
              if (endTimeParts.length > 0) {
                endHour = parseInt(endTimeParts[0], 10);
              }
            }
          }
          
          availabilityMap[dayString] = {
            available: day.isAvailable,
            timeRange: [startHour, endHour]
          };
        });
      }
      
      // 体験サンプルの変換
      const experiences = (profile.experienceSamples || []).map(sample => ({
        id: sample.id || '',
        title: sample.title,
        description: sample.description,
        imageUrl: sample.images && sample.images.length > 0 ? sample.images[0] : '',
        duration: sample.estimatedDuration || 60,
        price: sample.price || 0,
        category: sample.category
      }));
      
      // 変換済みのプロフィールを設定
      setAdaptedProfile({
        id: profile.id,
        userId: profile.id, // 互換性のため
        displayName: profile.name,
        bio: profile.bio || '',
        location: profile.location || '',
        languages: [], // 互換性のため空配列
        expertise: profile.specialties || [],
        experiences,
        availability: availabilityMap,
        profileImage: profile.imageUrl || '',
        rating: profile.rating || 0,
        reviewCount: profile.reviewCount || 0,
        verified: profile.verified || false,
        createdAt: profile.joinedAt ? new Date(profile.joinedAt) : new Date(),
        updatedAt: profile.lastActive ? new Date(profile.lastActive) : new Date()
      });
    };
    
    convertProfile();
  }, [profile]);

  // 子要素に変換済みのプロフィールを渡す
  return <>{children(adaptedProfile)}</>;
};

export default ProfileAdapter;
