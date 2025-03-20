/**
 * デバイスフィンガープリントの生成と検証ユーティリティ
 * 
 * デバイスの特徴を収集し、一意の識別子を生成します。
 * これにより同一ユーザーが異なるデバイスを使用するなどの不審な動作を検出できます。
 */

/**
 * デバイスフィンガープリント情報
 */
export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  colorDepth: number;
  screenResolution: string;
  timezoneOffset: number;
  sessionStorage: boolean;
  localStorage: boolean;
  cpuClass?: string;
  platform: string;
  doNotTrack?: string;
  webglFingerprint?: string;
  canvasFingerprint?: string;
  installedFonts?: string[];
  installedPlugins?: string[];
  touchSupport: boolean;
  colorGamut?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  battery?: {
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;
  };
  audioFingerprint?: string;
  videoFormats?: {
    ogg: boolean;
    h264: boolean;
    webm: boolean;
    vp9: boolean;
    hls: boolean;
    dash: boolean;
  };
}

/**
 * ブラウザやデバイスから情報を収集し、フィンガープリントを生成
 * 
 * @returns フィンガープリント情報
 */
export async function collectDeviceFingerprint(): Promise<DeviceFingerprint> {
  const fingerprint: DeviceFingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    colorDepth: window.screen.colorDepth,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezoneOffset: new Date().getTimezoneOffset(),
    sessionStorage: !!window.sessionStorage,
    localStorage: !!window.localStorage,
    platform: navigator.platform,
    touchSupport: 'ontouchstart' in window || 
                  navigator.maxTouchPoints > 0 ||
                  (navigator as any).msMaxTouchPoints > 0
  };

  // CPU情報 (非推奨・廃止予定の機能だが、まだ利用可能な場合)
  if ('cpuClass' in navigator) {
    fingerprint.cpuClass = (navigator as any).cpuClass;
  }
  
  // DoNotTrackの設定
  fingerprint.doNotTrack = navigator.doNotTrack || 
                          (window as any).doNotTrack || 
                          (navigator as any).msDoNotTrack;
  
  // ハードウェア情報
  if ('hardwareConcurrency' in navigator) {
    fingerprint.hardwareConcurrency = navigator.hardwareConcurrency;
  }
  
  // デバイスメモリ情報
  if ((navigator as any).deviceMemory) {
    fingerprint.deviceMemory = (navigator as any).deviceMemory;
  }
  
  // WebGLフィンガープリント
  try {
    fingerprint.webglFingerprint = await generateWebGLFingerprint();
  } catch (e) {
    console.error('WebGLフィンガープリントの生成に失敗:', e);
  }
  
  // Canvasフィンガープリント
  try {
    fingerprint.canvasFingerprint = generateCanvasFingerprint();
  } catch (e) {
    console.error('Canvasフィンガープリントの生成に失敗:', e);
  }
  
  // オーディオフィンガープリント（簡易版）
  try {
    fingerprint.audioFingerprint = await generateAudioFingerprint();
  } catch (e) {
    console.error('オーディオフィンガープリントの生成に失敗:', e);
  }
  
  // バッテリー情報
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      fingerprint.battery = {
        charging: battery.charging,
        level: battery.level,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    }
  } catch (e) {
    console.error('バッテリー情報の取得に失敗:', e);
  }
  
  // ビデオフォーマットサポート
  const videoEl = document.createElement('video');
  fingerprint.videoFormats = {
    ogg: !!videoEl.canPlayType('video/ogg; codecs="theora"'),
    h264: !!videoEl.canPlayType('video/mp4; codecs="avc1.42E01E"'),
    webm: !!videoEl.canPlayType('video/webm; codecs="vp8, vorbis"'),
    vp9: !!videoEl.canPlayType('video/webm; codecs="vp9"'),
    hls: !!videoEl.canPlayType('application/vnd.apple.mpegURL'),
    dash: !!videoEl.canPlayType('application/dash+xml')
  };
  
  return fingerprint;
}

/**
 * WebGLによるフィンガープリントを生成
 * 
 * @returns WebGLフィンガープリント（ハッシュ文字列）
 */
async function generateWebGLFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    return 'WebGL not supported';
  }
  
  // WebGLコンテキストを明示的に型定義
  const webglContext = gl as WebGLRenderingContext;
  
  const info = {
    vendor: webglContext.getParameter(webglContext.VENDOR),
    renderer: webglContext.getParameter(webglContext.RENDERER),
    version: webglContext.getParameter(webglContext.VERSION),
    shadingLanguageVersion: webglContext.getParameter(webglContext.SHADING_LANGUAGE_VERSION),
    extensions: webglContext.getSupportedExtensions()
  };
  
  // 簡易ハッシュ生成（実際のプロダクションでは暗号学的に安全なハッシュを使用すべき）
  const infoString = JSON.stringify(info);
  
  // Web Crypto APIを使用してSHA-256ハッシュを生成
  const msgBuffer = new TextEncoder().encode(infoString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Canvasによるフィンガープリントを生成
 * 
 * @returns Canvasフィンガープリント（ハッシュ文字列）
 */
function generateCanvasFingerprint(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return 'Canvas not supported';
  }
  
  // テキストを描画して特徴を抽出
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('echo fingerprint', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('echo fingerprint', 4, 17);
  
  // 描画結果を文字列化
  let dataURL;
  try {
    dataURL = canvas.toDataURL();
  } catch (e) {
    return 'Cannot get canvas data';
  }
  
  // DataURLから単純なハッシュを生成
  let hash = 0;
  for (let i = 0; i < dataURL.length; i++) {
    hash = ((hash << 5) - hash) + dataURL.charCodeAt(i);
    hash |= 0; // 32bit整数に変換
  }
  
  return hash.toString(16);
}

/**
 * オーディオコンテキストを使用したフィンガープリントを生成
 * 
 * @returns オーディオフィンガープリント
 */
async function generateAudioFingerprint(): Promise<string> {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const oscillator = audioCtx.createOscillator();
    const dynamicsCompressor = audioCtx.createDynamicsCompressor();
    
    // パラメータ設定
    analyser.fftSize = 2048;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    
    dynamicsCompressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    dynamicsCompressor.knee.setValueAtTime(40, audioCtx.currentTime);
    dynamicsCompressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    dynamicsCompressor.attack.setValueAtTime(0, audioCtx.currentTime);
    dynamicsCompressor.release.setValueAtTime(0.25, audioCtx.currentTime);
    
    // 接続
    oscillator.connect(dynamicsCompressor);
    dynamicsCompressor.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    // 再生と分析
    oscillator.start(0);
    
    // 少し待ってから周波数データを取得
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // 停止
    oscillator.stop();
    audioCtx.close();
    
    // 簡易ハッシュ生成
    let hash = 0;
    for (let i = 0; i < dataArray.length; i += 4) {
      hash = ((hash << 5) - hash) + dataArray[i];
      hash |= 0;
    }
    
    return hash.toString(16);
  } catch (e) {
    console.error('オーディオフィンガープリント生成エラー:', e);
    return 'audio_fingerprint_failed';
  }
}

/**
 * デバイスフィンガープリントからハッシュIDを生成
 * 
 * @param fingerprint デバイスフィンガープリント
 * @returns ハッシュID
 */
export async function generateDeviceId(fingerprint: DeviceFingerprint): Promise<string> {
  // 主要な特徴を選択してIDを生成
  const components = [
    fingerprint.userAgent,
    fingerprint.language,
    fingerprint.colorDepth,
    fingerprint.screenResolution,
    fingerprint.timezoneOffset,
    fingerprint.platform,
    fingerprint.webglFingerprint || '',
    fingerprint.canvasFingerprint || '',
    fingerprint.hardwareConcurrency || '',
    fingerprint.deviceMemory || '',
    fingerprint.audioFingerprint || ''
  ];
  
  const componentString = components.join(':::|:::');
  
  // Web Crypto APIを使用してSHA-256ハッシュを生成
  const msgBuffer = new TextEncoder().encode(componentString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * デバイスIDを保存する
 * 
 * @param deviceId デバイスID
 */
export function storeDeviceId(deviceId: string): void {
  try {
    localStorage.setItem('echo_device_id', deviceId);
    
    // Cookieにも保存（HTTPOnly不可）
    document.cookie = `echo_device_id=${deviceId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Strict`;
  } catch (e) {
    console.error('デバイスIDの保存に失敗:', e);
  }
}

/**
 * 保存されているデバイスIDを取得
 * 
 * @returns デバイスID（存在しない場合はnull）
 */
export function getStoredDeviceId(): string | null {
  try {
    // ローカルストレージから取得
    const deviceId = localStorage.getItem('echo_device_id');
    if (deviceId) {
      return deviceId;
    }
    
    // Cookieから取得
    const cookieMatch = document.cookie.match(/echo_device_id=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1];
    }
    
    return null;
  } catch (e) {
    console.error('デバイスIDの取得に失敗:', e);
    return null;
  }
}
