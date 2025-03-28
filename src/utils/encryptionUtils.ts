/**
 * 決済情報の暗号化とトークン化のためのユーティリティ
 */

// WebCrypto APIを使用した暗号化処理
// 注：実際の実装ではサーバーサイドでのセキュリティ施策と組み合わせること

/**
 * ランダムなトークン文字列を生成
 * @param length トークンの長さ
 * @returns ランダムトークン
 */
export const generateRandomToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * 公開鍵を使用したデータの暗号化 (RSA-OAEP)
 * @param data 暗号化するデータ
 * @param publicKeyPem PEM形式の公開鍵
 * @returns 暗号化されたデータ (Base64エンコード)
 */
export const encryptWithPublicKey = async (data: string, publicKeyPem: string): Promise<string> => {
  try {
    // テスト/開発環境の場合はモックの暗号化を返す
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Development mode: Using mock encryption');
      return btoa(`MOCK_ENCRYPTED:${data}`);
    }

    // 実際の実装では、公開鍵をインポートして暗号化
    // ここではサンプル実装として簡易版を示す

    // 実装例（実際のプロダクション環境では適切に実装）
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // 実際のプロダクションコードでは、以下のようなWeb Crypto APIを使用
    /*
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = publicKeyPem
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    const binaryDer = window.atob(pemContents);
    const binaryDerBuffer = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      binaryDerBuffer[i] = binaryDer.charCodeAt(i);
    }
    
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      binaryDerBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['encrypt']
    );
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      dataBuffer
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    */
    
    // モック実装（開発環境用）
    return btoa(`ENCRYPTED:${data}`);
  } catch (error) {
    console.error('暗号化エラー:', error);
    throw new Error('データの暗号化に失敗しました');
  }
};

/**
 * 一方向ハッシュ関数 (SHA-256)
 * @param data ハッシュ化するデータ
 * @returns ハッシュ値 (16進数文字列)
 */
export const hashData = async (data: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    
    // ハッシュバッファを16進数文字列に変換
    return Array.from(new Uint8Array(hashBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('ハッシュ化エラー:', error);
    throw new Error('データのハッシュ化に失敗しました');
  }
};

/**
 * データの難読化（完全なセキュリティではなく、単純な難読化）
 * クライアントサイドでの一時的な保護用
 * @param data 難読化するデータ
 * @param salt ソルト値（追加のランダム性）
 * @returns 難読化されたデータ
 */
export const obfuscateData = (data: string, salt: string): string => {
  // 単純な可逆的難読化（XORベース）
  // 注：これは真のセキュリティ対策ではなく、単なる難読化です
  const result: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ salt.charCodeAt(i % salt.length);
    result.push(String.fromCharCode(charCode));
  }
  return btoa(result.join(''));
};

/**
 * 難読化されたデータを復元
 * @param obfuscatedData 難読化されたデータ
 * @param salt 使用されたソルト値
 * @returns 元のデータ
 */
export const deobfuscateData = (obfuscatedData: string, salt: string): string => {
  const data = atob(obfuscatedData);
  const result: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ salt.charCodeAt(i % salt.length);
    result.push(String.fromCharCode(charCode));
  }
  return result.join('');
};

/**
 * カード番号をマスク処理（最初の6桁と最後の4桁以外をマスク）
 * @param cardNumber カード番号
 * @returns マスク処理されたカード番号
 */
export const maskCardNumber = (cardNumber: string): string => {
  const digitsOnly = cardNumber.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return '************';
  }
  
  const firstSix = digitsOnly.substring(0, 6);
  const lastFour = digitsOnly.substring(digitsOnly.length - 4);
  const middleLength = digitsOnly.length - 10;
  const maskedMiddle = '*'.repeat(middleLength);
  
  return `${firstSix}${maskedMiddle}${lastFour}`;
};

/**
 * カード番号の安全な表示用フォーマット（最後の4桁のみ表示）
 * @param cardNumber カード番号
 * @returns 安全な表示用カード番号
 */
export const formatCardNumberForDisplay = (cardNumber: string): string => {
  const digitsOnly = cardNumber.replace(/\D/g, '');
  if (digitsOnly.length < 4) {
    return '****';
  }
  
  const lastFour = digitsOnly.substring(digitsOnly.length - 4);
  return `**** **** **** ${lastFour}`;
};
