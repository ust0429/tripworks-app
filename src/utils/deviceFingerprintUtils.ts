/**
 * デバイスフィンガープリント関連のユーティリティ
 * 3Dセキュア認証用のブラウザ/デバイス情報を収集
 */

import { ThreeDSecureClientMetadata } from '../types/payment';

/**
 * ブラウザフィンガープリント情報を収集する
 * 3Dセキュア2.0 (EMV 3DS)の要件に基づく情報を収集
 * 
 * @returns 3Dセキュア用のクライアントメタデータ
 */
export const collectBrowserFingerprint = (): ThreeDSecureClientMetadata => {
  // 基本的なブラウザ情報
  const browserInfo = {
    acceptHeader: navigator.userAgent,
    browserLanguage: navigator.language,
    screenHeight: window.screen.height,
    screenWidth: window.screen.width,
    timeZone: new Date().getTimezoneOffset(),
    userAgent: navigator.userAgent,
    javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
    colorDepth: window.screen.colorDepth,
  };

  // デバイス情報
  const deviceInfo = {
    deviceChannel: 'browser',
    // IPアドレスはサーバーサイドで取得するため、ここではnullを設定
    ipAddress: undefined,
    // デバイスIDはローカルストレージから取得するか、新たに生成
    deviceId: getOrCreateDeviceId(),
  };

  return {
    browserInfo,
    deviceInfo,
  };
};

/**
 * デバイスIDを取得または生成する
 * ローカルストレージに保存し、再訪問時に同じIDを使用
 * 
 * @returns デバイスID（UUID v4形式）
 */
const getOrCreateDeviceId = (): string => {
  const storageKey = 'echo_device_fingerprint_id';
  
  // ローカルストレージからIDを取得
  let deviceId = localStorage.getItem(storageKey);
  
  // 存在しない場合は新しいIDを生成
  if (!deviceId) {
    deviceId = generateUUID();
    // ローカルストレージに保存
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
};

/**
 * UUID v4を生成する
 * 
 * @returns UUIDv4形式の文字列
 */
const generateUUID = (): string => {
  // UUID v4フォーマットに基づいてランダムな文字列を生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 高度なデバイス特性情報を収集する（リスク評価用）
 * この関数は法的・プライバシー上の理由からごく基本的な情報のみ収集する
 * 
 * @returns デバイス特性情報
 */
export const collectAdvancedDeviceCharacteristics = (): Record<string, any> => {
  return {
    screenInfo: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
    },
    navigatorInfo: {
      deviceMemory: 'deviceMemory' in navigator ? (navigator as any).deviceMemory : undefined,
      hardwareConcurrency: navigator.hardwareConcurrency,
      platform: navigator.platform,
      vendor: navigator.vendor,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
    },
    // 利用可能なフォントリストなどの追加情報は、
    // プライバシーの懸念があるため収集しない
  };
};

/**
 * デバイスリスクスコアを概算する（サンプル実装）
 * 実際の実装では、より高度なリスク評価アルゴリズムを使用
 * 
 * @returns 0-100のリスクスコア（値が大きいほどリスク高）
 */
export const calculateDeviceRiskScore = (
  metadata: ThreeDSecureClientMetadata,
  additionalData: Record<string, any>
): number => {
  // これは単なるサンプル実装。実際のリスク評価はより複雑
  let riskScore = 0;
  
  // ブラウザ言語と時間帯が日本に一致するかチェック
  if (!metadata.browserInfo.browserLanguage.startsWith('ja')) {
    riskScore += 5;
  }
  
  if (Math.abs(metadata.browserInfo.timeZone) !== 540) { // 日本のUTC+9は-540分オフセット
    riskScore += 5;
  }
  
  // 画面解像度が一般的なものか
  const standardResolutions = [
    [1920, 1080], [1366, 768], [1536, 864], [1440, 900],
    [1280, 720], [2560, 1440], [3840, 2160]
  ];
  
  const resolution = [
    metadata.browserInfo.screenWidth,
    metadata.browserInfo.screenHeight
  ];
  
  const hasStandardResolution = standardResolutions.some(
    std => (std[0] === resolution[0] && std[1] === resolution[1]) ||
          (std[0] === resolution[1] && std[1] === resolution[0])
  );
  
  if (!hasStandardResolution) {
    riskScore += 10;
  }
  
  // JavaScriptが有効かどうか（現在のコードが実行されているなら常に有効）
  if (!metadata.browserInfo.javaEnabled) {
    riskScore += 5;
  }
  
  // ハードウェア並列処理のコア数が異常に少ないか
  if (additionalData.navigatorInfo.hardwareConcurrency < 2) {
    riskScore += 10;
  }
  
  // デバイスメモリが異常に少ないか
  if (
    additionalData.navigatorInfo.deviceMemory !== undefined && 
    additionalData.navigatorInfo.deviceMemory < 2
  ) {
    riskScore += 10;
  }
  
  // 注: 実際のリスク評価ではIPアドレスの変化、過去の行動パターン、
  // セッション特性などの要素も考慮する
  
  return Math.min(riskScore, 100);
};
