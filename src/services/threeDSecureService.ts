/**
 * 3Dセキュア認証サービス
 * カード発行会社の認証システムとの連携を管理
 */

import { 
  ThreeDSecureData, 
  ThreeDSecureStatus, 
  ThreeDSecureClientMetadata,
  CreditCardData
} from '../types/payment';
import { collectBrowserFingerprint, calculateDeviceRiskScore, collectAdvancedDeviceCharacteristics } from '../utils/deviceFingerprintUtils';

/**
 * 3Dセキュア認証を開始する
 * @param cardData クレジットカード情報
 * @param amount 支払金額
 * @param orderId 注文ID
 * @returns 3Dセキュア認証データ
 */
export const initiate3DSecure = async (
  cardData: CreditCardData,
  amount: number,
  orderId: string
): Promise<ThreeDSecureData> => {
  try {
    // ブラウザフィンガープリント情報を取得
    const clientMetadata = collectBrowserFingerprint();
    const advancedCharacteristics = collectAdvancedDeviceCharacteristics();
    
    // リスクスコアを計算
    const riskScore = calculateDeviceRiskScore(clientMetadata, advancedCharacteristics);

    // 通常はここでAPIにリクエストを送るが、現在はモック実装
    // 実際のAPI呼び出し例:
    // const response = await api.post('/payment/3dsecure/initiate', {
    //   cardData: sanitizeCardData(cardData),
    //   amount,
    //   orderId,
    //   clientMetadata,
    //   riskScore
    // });
    
    // 代わりにモックレスポンスを生成
    const mockResponse = await mockThreeDSecureInitiation(cardData, riskScore);
    
    return {
      ...mockResponse,
      fingerprint: generateFingerprint(clientMetadata),
      clientMetadata
    } as ThreeDSecureData;
  } catch (error) {
    console.error('3Dセキュア初期化エラー:', error);
    throw new Error('3Dセキュア認証の初期化に失敗しました');
  }
};

/**
 * 3Dセキュア認証状態を確認する
 * @param threeDSecureId 3Dセキュア認証ID
 * @returns 認証の現在の状態
 */
export const check3DSecureStatus = async (
  threeDSecureId: string
): Promise<ThreeDSecureStatus> => {
  try {
    // 実際のAPI呼び出し例:
    // const response = await api.get(`/payment/3dsecure/status/${threeDSecureId}`);
    // return response.data.status;
    
    // モック実装
    // ランダムに成功または保留状態を返す（デモ用）
    if (Math.random() > 0.2) {
      return 'success';
    }
    return 'pending';
  } catch (error) {
    console.error('3Dセキュア状態確認エラー:', error);
    return 'failed';
  }
};

/**
 * 3Dセキュア認証を完了する
 * カード発行会社の認証完了後に呼び出される
 * @param threeDSecureId 3Dセキュア認証ID
 * @param callbackParams コールバックパラメータ（カード発行会社から返される）
 * @returns 認証結果
 */
export const complete3DSecure = async (
  threeDSecureId: string,
  callbackParams: Record<string, string>
): Promise<{
  success: boolean;
  status: ThreeDSecureStatus;
  transactionId?: string;
}> => {
  try {
    // 実際のAPI呼び出し例:
    // const response = await api.post('/payment/3dsecure/complete', {
    //   threeDSecureId,
    //   callbackParams
    // });
    
    // モック実装
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = Math.random() > 0.1; // 90%の確率で成功
    return {
      success,
      status: success ? 'success' : 'failed',
      transactionId: success ? `3DS-${Date.now().toString().substr(-6)}` : undefined
    };
  } catch (error) {
    console.error('3Dセキュア完了エラー:', error);
    return {
      success: false,
      status: 'failed'
    };
  }
};

/**
 * クライアントデータから一意のフィンガープリントを生成
 * @param metadata クライアントメタデータ
 * @returns フィンガープリント文字列
 */
const generateFingerprint = (metadata: ThreeDSecureClientMetadata): string => {
  // 実際の実装では、より安全なハッシュアルゴリズムを使用
  const dataString = JSON.stringify({
    ua: metadata.browserInfo.userAgent,
    lang: metadata.browserInfo.browserLanguage,
    screen: `${metadata.browserInfo.screenWidth}x${metadata.browserInfo.screenHeight}`,
    depth: metadata.browserInfo.colorDepth,
    tz: metadata.browserInfo.timeZone,
    device: metadata.deviceInfo?.deviceId || 'unknown'
  });
  
  // 簡易的なハッシュ（本番環境では適切なハッシュライブラリを使用）
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  
  return `fp-${Math.abs(hash).toString(16)}`;
};

/**
 * カード情報を安全に処理するためにサニタイズ
 * @param cardData クレジットカード情報
 * @returns サニタイズされたカード情報
 */
const sanitizeCardData = (cardData: CreditCardData): Partial<CreditCardData> => {
  // 必要最小限の情報のみを取得し、カード番号は最初の6桁と最後の4桁のみ保持
  const { cardNumber, expiryMonth, expiryYear } = cardData;
  const first6 = cardNumber.replace(/\D/g, '').substring(0, 6);
  const last4 = cardNumber.replace(/\D/g, '').slice(-4);
  
  return {
    cardNumber: `${first6}******${last4}`,
    expiryMonth,
    expiryYear,
    // CVCは送信しない
  };
};

/**
 * モック用の3Dセキュア初期化レスポンスを生成
 * @param cardData クレジットカード情報
 * @param riskScore リスクスコア
 * @returns モックの3Dセキュアデータ
 */
const mockThreeDSecureInitiation = async (
  cardData: CreditCardData,
  riskScore: number
): Promise<Partial<ThreeDSecureData>> => {
  // 遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // カード番号の下4桁を取得
  const lastFour = cardData.cardNumber.replace(/\D/g, '').slice(-4);
  
  // リスクスコアが低い場合や特定の条件を満たす場合は認証をスキップ
  const shouldSkip = riskScore < 15 || lastFour === '0000';
  
  if (shouldSkip) {
    // 認証スキップ（フリクションレス認証）
    return {
      id: `3ds-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'success',
    };
  }
  
  // 認証が必要な場合
  return {
    id: `3ds-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'pending',
    authenticationUrl: `https://echo-3dsecure-demo.example.com/auth?id=${Date.now()}`,
  };
};

/**
 * 3Dセキュア認証用のiframeを作成
 * @param url 認証URL
 * @param onComplete 完了時のコールバック
 * @returns iframe要素
 */
export const create3DSecureIframe = (
  url: string,
  onComplete: (result: { success: boolean; params: Record<string, string> }) => void
): HTMLIFrameElement => {
  // iframe要素を作成
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.width = '100%';
  iframe.style.height = '400px';
  iframe.style.border = 'none';
  
  // メッセージイベントリスナーを設定
  // 認証完了時にiframeからメッセージを受け取る
  const messageHandler = (event: MessageEvent) => {
    // オリジン検証（本番環境ではドメインを厳密に検証）
    if (!event.origin.includes('example.com')) {
      return;
    }
    
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      
      // 3Dセキュア認証の結果を処理
      if (data && data.type === '3ds-complete') {
        // イベントリスナーを削除
        window.removeEventListener('message', messageHandler);
        
        // コールバックを呼び出す
        onComplete({
          success: data.success || false,
          params: data.params || {}
        });
      }
    } catch (error) {
      console.error('3Dセキュアメッセージ処理エラー:', error);
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  return iframe;
};

/**
 * 3Dセキュア認証モーダルを表示
 * @param url 認証URL
 * @returns 認証結果のPromise
 */
export const show3DSecureModal = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // モーダルコンテナを作成
    const modalContainer = document.createElement('div');
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '1000';
    
    // モーダルコンテンツを作成
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '500px';
    
    // ヘッダーを作成
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';
    
    const title = document.createElement('h3');
    title.textContent = 'カード発行会社による認証';
    title.style.margin = '0';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      document.body.removeChild(modalContainer);
      resolve(false); // キャンセルとして扱う
    };
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // 説明テキストを追加
    const description = document.createElement('p');
    description.textContent = 'お使いのカード発行会社による追加認証が必要です。表示された認証画面で手続きを完了してください。';
    description.style.marginBottom = '20px';
    
    // iframeを作成
    const iframe = create3DSecureIframe(url, (result) => {
      document.body.removeChild(modalContainer);
      resolve(result.success);
    });
    
    // 要素を組み立てる
    modalContent.appendChild(header);
    modalContent.appendChild(description);
    modalContent.appendChild(iframe);
    modalContainer.appendChild(modalContent);
    
    // ページに追加
    document.body.appendChild(modalContainer);
    
    // モック用: 実際のAPIの代わりにデモ目的でタイマーを設定
    // 30秒後に自動的に認証成功とみなす（本番環境では削除）
    setTimeout(() => {
      if (document.body.contains(modalContainer)) {
        document.body.removeChild(modalContainer);
        resolve(true);
      }
    }, 30000);
  });
};

/**
 * リスクレベルに基づいて3Dセキュア認証が必要かどうかを判断
 * @param cardData クレジットカード情報
 * @param amount 金額
 * @returns 必要かどうかのフラグ
 */
export const shouldRequire3DSecure = (
  cardData: CreditCardData,
  amount: number
): boolean => {
  // テスト用のスキップパターン
  if (cardData.cardNumber.replace(/\D/g, '').endsWith('0000')) {
    return false;
  }
  
  // 金額が一定以上の場合は常に認証
  if (amount >= 15000) {
    return true;
  }
  
  // その他のリスク判断（例: 新しいデバイスからの支払い、通常と異なる購入パターンなど）
  // ここでは50%の確率で認証を要求（デモ用）
  return Math.random() < 0.5;
};
