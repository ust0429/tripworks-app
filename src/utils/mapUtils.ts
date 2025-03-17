// src/utils/mapUtils.ts
import { AttenderType } from '../types';

// アテンダーの位置情報を拡張した型
export interface AttenderWithLocation extends AttenderType {
  longitude: number;
  latitude: number;
  distanceKm?: number;
}

// 現在地周辺のアテンダーを取得する
export const getNearbyAttenders = (
  attendersWithLocation: AttenderWithLocation[],
  currentLocation: [number, number], // [longitude, latitude]
  radiusKm: number = 5
): AttenderWithLocation[] => {
  // 現在地からの距離を計算して追加
  const attendersWithDistance = attendersWithLocation.map(attender => {
    // 簡易的なハーバーサイン公式による距離計算（実際はTurfやジオライブラリを使用）
    const distance = calculateDistance(
      currentLocation[1], 
      currentLocation[0], 
      attender.latitude, 
      attender.longitude
    );
    
    return {
      ...attender,
      distanceKm: distance,
      // 表示用の距離文字列を更新（例：2.3km先 → 実際の距離）
      distance: distance < 1 
        ? `${Math.round(distance * 1000)}m先` 
        : `${distance.toFixed(1)}km先`
    };
  });
  
  // 指定された半径内のアテンダーをフィルタリング
  const nearbyAttenders = attendersWithDistance
    .filter(attender => (attender.distanceKm || 0) <= radiusKm)
    // 距離順にソート
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    
  return nearbyAttenders;
};

// ハーバーサイン公式による2点間の距離計算（km単位）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球の半径（km）
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // km単位の距離
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// 現在地取得のためのユーティリティ
export const getCurrentLocation = (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        resolve([longitude, latitude]);
      },
      (error) => {
        console.error('Geolocation error:', error);
        // エラー時はデフォルトの東京の座標を返す
        resolve([139.7690, 35.6804]);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

// 住所から座標を取得する（実際のアプリではAPI連携）
export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  // モック実装（実際はMapbox Geocoding APIなどを使用）
  return new Promise((resolve) => {
    setTimeout(() => {
      // 東京のさまざまな地域の座標をモックで返す
      const mockCoordinates: Record<string, [number, number]> = {
        '東京': [139.7690, 35.6804],
        '新宿': [139.7030, 35.6938],
        '渋谷': [139.7010, 35.6580],
        '池袋': [139.7087, 35.7295],
        '銀座': [139.7673, 35.6721],
        '浅草': [139.7966, 35.7147],
        '秋葉原': [139.7730, 35.7021],
        '下北沢': [139.6674, 35.6614]
      };
      
      // 住所にキーワードが含まれるか確認
      for (const [key, coords] of Object.entries(mockCoordinates)) {
        if (address.includes(key)) {
          return resolve(coords);
        }
      }
      
      // デフォルトでは東京の座標を返す
      resolve([139.7690, 35.6804]);
    }, 500); // モックの通信遅延
  });
};