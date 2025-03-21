import { NotificationType } from '../../types/notification';

// FCM (Firebase Cloud Messaging) のインターフェース
interface FCMPayload {
  notification: {
    title: string;
    body: string;
    icon?: string;
    clickAction?: string;
  };
  data?: Record<string, string>;
  token: string;
}

// APNs (Apple Push Notification service) のインターフェース
interface APNsPayload {
  aps: {
    alert: {
      title: string;
      body: string;
    };
    badge?: number;
    sound?: string;
    "content-available"?: number;
  };
  data?: Record<string, string>;
  token: string;
}

// デバイストークンの型
interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: string;
  lastUsedAt: string;
}

class PushNotificationService {
  private apiBaseUrl: string = process.env.REACT_APP_API_URL || '';
  
  // FCMサーバーへ通知を送信
  private async sendToFCM(payload: FCMPayload): Promise<boolean> {
    // 実際の実装では、バックエンドAPIを呼び出してFCMに通知を送信します
    // ここではモックの実装をします
    console.log('Sending FCM notification:', payload);
    
    try {
      // モック: 成功したと仮定
      return true;
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      return false;
    }
  }
  
  // APNsサーバーへ通知を送信
  private async sendToAPNs(payload: APNsPayload): Promise<boolean> {
    // 実際の実装では、バックエンドAPIを呼び出してAPNsに通知を送信します
    // ここではモックの実装をします
    console.log('Sending APNs notification:', payload);
    
    try {
      // モック: 成功したと仮定
      return true;
    } catch (error) {
      console.error('Error sending APNs notification:', error);
      return false;
    }
  }
  
  // ユーザーのすべてのデバイストークンを取得
  private async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    // 実際の実装では、バックエンドAPIからデバイストークンを取得します
    // ここではモックデータを返します
    return [
      {
        id: 'device-token-1',
        userId,
        token: 'fcm-token-example-123',
        platform: 'android',
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString()
      },
      {
        id: 'device-token-2',
        userId,
        token: 'apns-token-example-456',
        platform: 'ios',
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString()
      }
    ];
  }
  
  // クライアント側でのデバイストークン登録処理
  async registerDeviceToken(userId: string, token: string, platform: 'ios' | 'android' | 'web'): Promise<boolean> {
    // 実際の実装では、バックエンドAPIを呼び出してトークンを登録します
    console.log(`Registering device token for user ${userId}:`, { token, platform });
    
    try {
      // 実際はここでAPIリクエストを送信
      /*
      const response = await fetch(`${this.apiBaseUrl}/api/device-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          userId,
          token,
          platform
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to register device token: ${response.status}`);
      }
      
      return true;
      */
      
      // モック: 成功したと仮定
      return true;
    } catch (error) {
      console.error('Error registering device token:', error);
      return false;
    }
  }
  
  // プッシュ通知を送信
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, string>
  ): Promise<{ success: boolean; deviceCount: number }> {
    try {
      // ユーザーのデバイストークンを取得
      const deviceTokens = await this.getUserDeviceTokens(userId);
      
      if (deviceTokens.length === 0) {
        console.log(`No device tokens found for user ${userId}`);
        return { success: true, deviceCount: 0 };
      }
      
      // 各デバイスに通知を送信
      const sendPromises = deviceTokens.map(async (device) => {
        const stringifiedData = data 
          ? Object.keys(data).reduce((acc, key) => {
              acc[key] = String(data[key]);
              return acc;
            }, {} as Record<string, string>)
          : {};
          
        // FCM (Android, Web)
        if (device.platform === 'android' || device.platform === 'web') {
          const fcmPayload: FCMPayload = {
            notification: {
              title,
              body,
              icon: 'notification_icon', // アプリのアイコン名
              clickAction: 'OPEN_ACTIVITY_1' // アプリ内の特定画面を開くアクション
            },
            data: {
              ...stringifiedData,
              notificationType: type,
            },
            token: device.token
          };
          
          return this.sendToFCM(fcmPayload);
        }
        
        // APNs (iOS)
        if (device.platform === 'ios') {
          const apnsPayload: APNsPayload = {
            aps: {
              alert: {
                title,
                body
              },
              badge: 1,
              sound: 'default',
              "content-available": 1
            },
            data: {
              ...stringifiedData,
              notificationType: type,
            },
            token: device.token
          };
          
          return this.sendToAPNs(apnsPayload);
        }
        
        return false;
      });
      
      const results = await Promise.all(sendPromises);
      const successCount = results.filter(Boolean).length;
      
      return {
        success: successCount > 0,
        deviceCount: successCount
      };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return {
        success: false,
        deviceCount: 0
      };
    }
  }
  
  // WebPush登録用の公開鍵を取得
  async getVapidPublicKey(): Promise<string> {
    // 実際の実装では、バックエンドAPIから公開鍵を取得します
    // ここではモックの公開鍵を返します
    return 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
  }

  // ブラウザでのプッシュ通知の許可をリクエスト
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // サービスワーカーの登録
  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers are not supported by this browser');
      return false;
    }

    try {
      // アプリのルートディレクトリにある service-worker.js を登録
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful with scope:', registration.scope);
      return true;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
