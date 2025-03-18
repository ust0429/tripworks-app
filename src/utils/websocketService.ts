// src/utils/websocketService.ts
import { Message } from '../types';

/**
 * WebSocket接続を管理するサービスクラス
 * リアルタイムメッセージングを実現するために使用
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageListeners: ((message: Message) => void)[] = [];
  private connectionListeners: ((status: 'connected' | 'disconnected' | 'error') => void)[] = [];
  private reconnectInterval: number = 5000; // 再接続の間隔（ミリ秒）
  private reconnectTimer: NodeJS.Timeout | null = null;
  private url: string = '';
  private userId: string = '';
  private token: string = '';

  /**
   * WebSocketサーバーに接続
   * @param userId ユーザーID
   * @param token 認証トークン
   */
  connect(userId: string, token: string) {
    // 既に接続が存在する場合は切断
    if (this.socket) {
      this.disconnect();
    }

    this.userId = userId;
    this.token = token;
    this.url = `wss://api.example.com/ws?userId=${userId}&token=${token}`;

    // 実際のサーバーで使用する場合はこのURLを環境変数から取得するなどする
    // モック開発用に現在はダミーURLを使用
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket接続エラー:', error);
      this.notifyConnectionStatus('error');
      this.scheduleReconnect();
    }
  }

  /**
   * メッセージを送信
   * @param message 送信するメッセージ
   * @returns 送信が成功したかどうか
   */
  sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({
          type: 'message',
          data: message
        }));
        return true;
      } catch (error) {
        console.error('メッセージ送信エラー:', error);
        return false;
      }
    }
    // 接続されていない場合はfalseを返す
    return false;
  }

  /**
   * WebSocketサーバーへの切断
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * メッセージリスナーを追加
   * @param listener メッセージを受け取るコールバック関数
   * @returns リスナー解除用の関数
   */
  addMessageListener(listener: (message: Message) => void) {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  /**
   * 接続状態リスナーを追加
   * @param listener 接続状態を受け取るコールバック関数
   * @returns リスナー解除用の関数
   */
  addConnectionListener(listener: (status: 'connected' | 'disconnected' | 'error') => void) {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }

  /**
   * WebSocket接続が開いたときのハンドラー
   */
  private handleOpen() {
    console.log('WebSocket接続成功');
    this.notifyConnectionStatus('connected');
  }

  /**
   * WebSocketからメッセージを受信したときのハンドラー
   */
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        const message = data.data as Message;
        this.notifyMessageListeners(message);
      }
    } catch (error) {
      console.error('メッセージ解析エラー:', error);
    }
  }

  /**
   * WebSocket接続が閉じたときのハンドラー
   */
  private handleClose() {
    console.log('WebSocket接続が閉じられました');
    this.notifyConnectionStatus('disconnected');
    this.scheduleReconnect();
  }

  /**
   * WebSocket接続でエラーが発生したときのハンドラー
   */
  private handleError(error: Event) {
    console.error('WebSocketエラー:', error);
    this.notifyConnectionStatus('error');
  }

  /**
   * 再接続をスケジュール
   */
  private scheduleReconnect() {
    if (!this.reconnectTimer && this.userId && this.token) {
      this.reconnectTimer = setTimeout(() => {
        console.log('WebSocket再接続を試みます...');
        this.connect(this.userId, this.token);
        this.reconnectTimer = null;
      }, this.reconnectInterval);
    }
  }

  /**
   * 接続状態をリスナーに通知
   */
  private notifyConnectionStatus(status: 'connected' | 'disconnected' | 'error') {
    this.connectionListeners.forEach(listener => listener(status));
  }

  /**
   * メッセージをリスナーに通知
   */
  private notifyMessageListeners(message: Message) {
    this.messageListeners.forEach(listener => listener(message));
  }
}

// シングルトンインスタンスを作成してエクスポート
export const webSocketService = new WebSocketService();
