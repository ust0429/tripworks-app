/**
 * モバイルデバイス特定のユーティリティ
 * ApplePay/GooglePay対応およびモバイル特定のフィンガープリント収集用
 */

/**
 * デバイスがモバイルかどうかを検出
 * @returns モバイルデバイスの場合はtrue
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // 一般的なモバイルユーザーエージェントパターン
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent);
};

/**
 * Apple Payが利用可能かどうかを確認
 * @returns 利用可能な場合はtrue
 */
export const isApplePayAvailable = (): boolean => {
  // ApplePayAPIが存在するかチェック
  const applePayApiExists = 
    'ApplePaySession' in window && 
    typeof (window as any).ApplePaySession?.canMakePayments === 'function';
  
  // iOSデバイスかどうかをチェック
  const isIosDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  return !!applePayApiExists && isIosDevice;
};

/**
 * Google Payが利用可能かどうかを確認
 * @returns 利用可能な場合はtrue
 */
export const isGooglePayAvailable = async (): Promise<boolean> => {
  // モック実装（実際にはGoogle Pay APIを使用）
  const isAndroidDevice = /Android/i.test(navigator.userAgent);
  
  // Androidデバイスでないと利用不可
  if (!isAndroidDevice) {
    return false;
  }
  
  try {
    // 実際の実装では、Google Pay APIを使用して可用性を確認
    // const paymentsClient = getGooglePaymentsClient();
    // const response = await paymentsClient.isReadyToPay({...});
    // return response.result;
    
    // モック実装: Androidデバイスであれば50%の確率で利用可能と判定
    return Math.random() > 0.5;
  } catch (error) {
    console.error('Google Pay 可用性確認エラー:', error);
    return false;
  }
};

/**
 * テレビ・コンソールデバイスかどうかを検出
 * @returns テレビ・コンソールデバイスの場合はtrue
 */
export const isTvDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // 一般的なスマートTV、ゲームコンソールのパターン
  return (
    userAgent.includes('smart-tv') ||
    userAgent.includes('smarttv') ||
    userAgent.includes('appletv') ||
    userAgent.includes('googletv') ||
    userAgent.includes('hdmi') ||
    userAgent.includes('netcast') ||
    userAgent.includes('nintendo') ||
    userAgent.includes('playstation') ||
    userAgent.includes('xbox')
  );
};

/**
 * デバイスのタイプを特定
 * @returns デバイスタイプの文字列
 */
export const getDeviceType = (): string => {
  if (isTvDevice()) {
    return 'tv';
  }
  
  if (isMobileDevice()) {
    // タブレット vs スマートフォンの判別
    const userAgent = navigator.userAgent;
    const isTablet = 
      /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent);
    
    return isTablet ? 'tablet' : 'smartphone';
  }
  
  return 'desktop';
};

/**
 * モバイル特有のデバイス情報を収集
 * @returns モバイルデバイスの特性情報
 */
export const collectMobileDeviceInfo = (): Record<string, any> => {
  const deviceType = getDeviceType();
  
  // 基本情報
  const info: Record<string, any> = {
    deviceType,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    vendor: navigator.vendor
  };
  
  // 画面情報
  info.screen = {
    width: window.screen.width,
    height: window.screen.height,
    orientation: window.screen.orientation 
      ? window.screen.orientation.type 
      : 'unknown'
  };
  
  // タッチスクリーン情報
  info.touchScreen = {
    available: 'ontouchstart' in window || 
              navigator.maxTouchPoints > 0 || 
              (navigator as any).msMaxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0
  };
  
  // モバイル支払い方法の利用可能性
  info.paymentMethods = {
    applePayAvailable: isApplePayAvailable(),
    // Google Payは非同期なので、ここでは含めない
  };
  
  // バッテリー情報（利用可能な場合）
  if ('getBattery' in navigator) {
    const batteryPromise = (navigator as any).getBattery();
    if (batteryPromise) {
      batteryPromise.then((battery: any) => {
        info.battery = {
          level: battery.level,
          charging: battery.charging
        };
      }).catch(() => {
        // エラーが発生した場合は何もしない
      });
    }
  }
  
  return info;
};

/**
 * デバイスの接続タイプを取得（WiFi/データなど）
 * @returns 接続タイプの情報
 */
export const getConnectionType = (): string => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType) {
      return connection.effectiveType; // 'slow-2g', '2g', '3g', '4g'
    }
  }
  return 'unknown';
};

/**
 * モバイルデバイスのリスクスコアを計算
 * @param deviceInfo デバイス情報
 * @returns リスクスコア（高いほど危険）
 */
export const calculateMobileRiskScore = (deviceInfo: Record<string, any>): number => {
  let riskScore = 0;
  
  // エミュレータやシミュレータの検出
  const userAgent = deviceInfo.userAgent.toLowerCase();
  if (
    userAgent.includes('emulator') ||
    userAgent.includes('simulator') ||
    userAgent.includes('android sdk') ||
    userAgent.includes('google_sdk')
  ) {
    riskScore += 30;
  }
  
  // ルート化またはジェイルブレイク検出
  // 注: これは簡易的な検出で、100%信頼性はありません
  if (
    ('window' in window && 'webkit' in window) ||
    ('cydia' in window) ||
    userAgent.includes('cydia')
  ) {
    riskScore += 25;
  }
  
  // 画面サイズの検証（一般的でない値はリスク上昇）
  const screenWidth = deviceInfo.screen.width;
  const screenHeight = deviceInfo.screen.height;
  const validResolutions = [
    [1080, 1920], [1440, 2560], [720, 1280],
    [750, 1334], [1080, 1920], [1125, 2436],
    [1242, 2688], [828, 1792]
  ];
  
  const hasValidResolution = validResolutions.some(
    res => (
      (res[0] === screenWidth && res[1] === screenHeight) ||
      (res[0] === screenHeight && res[1] === screenWidth)
    )
  );
  
  if (!hasValidResolution) {
    riskScore += 10;
  }
  
  // モバイル接続タイプが利用可能かどうか
  if (getConnectionType() === 'unknown') {
    riskScore += 5;
  }
  
  // タッチポイントがモバイルデバイスとして適切か
  if (
    deviceInfo.deviceType === 'smartphone' && 
    deviceInfo.touchScreen.maxTouchPoints < 1
  ) {
    riskScore += 20;
  }
  
  return Math.min(riskScore, 100);
};
