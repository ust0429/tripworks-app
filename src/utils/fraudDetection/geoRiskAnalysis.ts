/**
 * 地理的情報に基づく不正リスク分析
 * 
 * ユーザーの現在地と登録地を比較し、不正リスクを評価します。
 */

/**
 * 地理的情報
 */
export interface GeoLocation {
  country: string;
  region?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  asn?: number;
  asnOrg?: string;
  ipAddress?: string;
}

/**
 * 高リスク地域の設定情報
 */
export interface GeoRiskConfig {
  highRiskCountries: string[];
  mediumRiskCountries: string[];
  maximumExpectedDistance: number; // km単位
}

/**
 * 地理リスク分析の結果
 */
export interface GeoRiskResult {
  riskLevel: 'high' | 'medium' | 'low';
  reasons: string[];
  score: number; // 0-1
  distanceFromRegistration?: number; // km単位
  countryMatch: boolean;
  regionMatch: boolean;
  cityMatch: boolean;
}

// デフォルトの高リスク地域設定
const DEFAULT_GEO_RISK_CONFIG: GeoRiskConfig = {
  // 実際の本番環境では、データに基づいて調整が必要
  highRiskCountries: ['XX', 'YY', 'ZZ'],
  mediumRiskCountries: ['AA', 'BB', 'CC'],
  maximumExpectedDistance: 300 // km
};

/**
 * 二点間の距離を計算 (Haversine formula)
 * 
 * @param lat1 地点1の緯度
 * @param lon1 地点1の経度
 * @param lat2 地点2の緯度
 * @param lon2 地点2の経度
 * @returns 距離 (km)
 */
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // 地球の半径 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * 地理的位置情報に基づいてリスクを評価
 * 
 * @param currentLocation 現在の地理的位置
 * @param registrationLocation 登録時の地理的位置
 * @param config リスク設定
 * @returns リスク評価結果
 */
export function analyzeGeoRisk(
  currentLocation: GeoLocation,
  registrationLocation?: GeoLocation,
  config: GeoRiskConfig = DEFAULT_GEO_RISK_CONFIG
): GeoRiskResult {
  const reasons: string[] = [];
  let score = 0;
  
  // 国のリスクチェック
  const isHighRiskCountry = config.highRiskCountries.includes(currentLocation.country);
  const isMediumRiskCountry = config.mediumRiskCountries.includes(currentLocation.country);
  
  if (isHighRiskCountry) {
    reasons.push(`高リスク国からのアクセス: ${currentLocation.country}`);
    score += 0.5;
  } else if (isMediumRiskCountry) {
    reasons.push(`中リスク国からのアクセス: ${currentLocation.country}`);
    score += 0.3;
  }
  
  let countryMatch = true;
  let regionMatch = true;
  let cityMatch = true;
  let distanceFromRegistration: number | undefined;
  
  // 登録情報との比較（登録情報がある場合）
  if (registrationLocation) {
    // 国の一致確認
    if (currentLocation.country !== registrationLocation.country) {
      reasons.push('登録国と現在地の国が一致しません');
      score += 0.4;
      countryMatch = false;
    }
    
    // 地域の一致確認
    if (currentLocation.region && 
        registrationLocation.region && 
        currentLocation.region !== registrationLocation.region) {
      reasons.push('登録地域と現在地の地域が一致しません');
      score += 0.2;
      regionMatch = false;
    }
    
    // 都市の一致確認
    if (currentLocation.city && 
        registrationLocation.city && 
        currentLocation.city !== registrationLocation.city) {
      reasons.push('登録都市と現在地の都市が一致しません');
      score += 0.1;
      cityMatch = false;
    }
    
    // 距離の計算（座標情報がある場合）
    if (currentLocation.latitude !== undefined && 
        currentLocation.longitude !== undefined && 
        registrationLocation.latitude !== undefined && 
        registrationLocation.longitude !== undefined) {
      
      distanceFromRegistration = calculateDistance(
        currentLocation.latitude, currentLocation.longitude,
        registrationLocation.latitude, registrationLocation.longitude
      );
      
      if (distanceFromRegistration > config.maximumExpectedDistance) {
        reasons.push(`登録地から${distanceFromRegistration.toFixed(0)}km離れた場所からのアクセス`);
        
        // 距離に応じてスコアを加算（最大0.5）
        const distanceScore = Math.min(0.5, distanceFromRegistration / (config.maximumExpectedDistance * 2));
        score += distanceScore;
      }
    }
  } else {
    // 登録情報がない場合
    reasons.push('登録地情報がありません');
    score += 0.1;
  }
  
  // ISP/ASNのチェック（実際の実装では、既知の不審なISPリストとの照合が必要）
  
  // 最終スコアと結果のまとめ
  score = Math.min(score, 1); // 1.0を上限とする
  
  const riskLevel = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low';
  
  return {
    riskLevel,
    reasons,
    score,
    distanceFromRegistration,
    countryMatch,
    regionMatch,
    cityMatch
  };
}

/**
 * IPアドレスから位置情報を取得（モック実装）
 * 
 * 実際の実装では、IPジオロケーションAPIサービスを使用します。
 * 
 * @param ipAddress IPアドレス
 * @returns 位置情報
 */
export async function getLocationFromIP(ipAddress: string): Promise<GeoLocation> {
  // モック実装 - 実際の実装ではAPI呼び出しを行う
  return new Promise((resolve) => {
    setTimeout(() => {
      // ランダムな地域情報を生成（デモ用）
      const countries = ['JP', 'US', 'GB', 'FR', 'DE', 'AU'];
      const regions = ['Tokyo', 'California', 'London', 'Paris', 'Berlin', 'Sydney'];
      const cities = ['Shinjuku', 'Los Angeles', 'Westminster', 'Saint-Denis', 'Mitte', 'Bondi'];
      
      const randomIndex = Math.floor(Math.random() * countries.length);
      
      resolve({
        country: countries[randomIndex],
        region: regions[randomIndex],
        city: cities[randomIndex],
        postalCode: '123456',
        latitude: 35.6895 + (Math.random() - 0.5) * 10,
        longitude: 139.6917 + (Math.random() - 0.5) * 10,
        timezone: 'Asia/Tokyo',
        isp: 'Example ISP',
        asn: 12345,
        asnOrg: 'Example Org',
        ipAddress
      });
    }, 500); // 実際のAPIコールを模倣するための遅延
  });
}

/**
 * 現在のIPアドレスを取得（モック実装）
 * 
 * 実際の実装では、IPアドレス取得サービスを使用します。
 * 
 * @returns IPアドレス
 */
export async function getCurrentIP(): Promise<string> {
  // モック実装 - 実際の実装ではAPI呼び出しを行う
  return new Promise((resolve) => {
    setTimeout(() => {
      // ランダムなIPアドレスを生成（デモ用）
      const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      resolve(ip);
    }, 300);
  });
}

/**
 * 現在位置を取得（ブラウザのGeolocation API使用）
 * 
 * @returns 位置情報のPromise
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}

/**
 * ブラウザのGeolocation APIから得た位置情報を変換
 * 
 * @param position Geolocation APIからの位置情報
 * @returns GeoLocation形式の位置情報
 */
export async function convertBrowserLocationToGeoLocation(
  position: GeolocationPosition
): Promise<GeoLocation> {
  const { latitude, longitude } = position.coords;
  
  // 実際の実装では、逆ジオコーディングAPIを使用して詳細情報を取得
  // ここではモック実装
  return {
    country: 'JP',
    region: 'Tokyo',
    city: 'Shinjuku',
    latitude,
    longitude,
    timezone: 'Asia/Tokyo'
  };
}
