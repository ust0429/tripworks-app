// src/utils/websocketService.ts
import { Message, MessageAttachment } from '../types';

/**
 * WebSocketの接続状態を表す列挙型
 */
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * WebSocketイベントタイプの列挙型
 */
export enum WebSocketEvent {
  MESSAGE = 'message',
  TYPING = 'typing',
  READ = 'read',
  GROUP_CREATED = 'group_created',
  GROUP_UPDATED = 'group_updated',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  USER_LEFT = 'user_left'
}

/**
 * WebSocket接続を管理するサービスクラス
 * リアルタイムメッセージングを実現するために使用
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageListeners: ((message: Message) => void)[] = [];
  private connectionListeners: ((status: ConnectionStatus) => void)[] = [];
  private typingEventListeners: Record<string, ((userId: string, isTyping: boolean) => void)[]> = {};
  private readStatusListeners: Record<string, ((messageIds: string[]) => void)[]> = {};
  private groupUpdateListeners: Record<string, ((event: WebSocketEvent, data: any) => void)[]> = {};
  private eventListeners: Record<WebSocketEvent, ((data: any) => void)[]> = {
    [WebSocketEvent.MESSAGE]: [],
    [WebSocketEvent.TYPING]: [],
    [WebSocketEvent.READ]: [],
    [WebSocketEvent.GROUP_CREATED]: [],
    [WebSocketEvent.GROUP_UPDATED]: [],
    [WebSocketEvent.MEMBER_ADDED]: [],
    [WebSocketEvent.MEMBER_REMOVED]: [],
    [WebSocketEvent.USER_LEFT]: []
  };
  
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 2000; // 初期再接続間隔（ミリ秒）
  private reconnectTimer: NodeJS.Timeout | null = null;
  private url: string = '';
  private userId: string = '';
  private token: string = '';
  private messageQueue: Array<{type: string, data: any}> = [];
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;

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
    this.setStatus(ConnectionStatus.CONNECTING);

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
      this.setStatus(ConnectionStatus.ERROR);
      this.scheduleReconnect();
    }
  }

  /**
   * WebSocketサーバーへの切断
   */
  disconnect() {
    this.clearReconnectTimer();

    if (this.socket) {
      // デバッグログ
      console.log('WebSocket切断中...');
      this.socket.close();
      this.socket = null;
    }

    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * メッセージを送信
   * @param message 送信するメッセージ
   * @returns 送信が成功したかどうか
   */
  sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) {
    return this.send({
      type: WebSocketEvent.MESSAGE,
      data: message
    });
  }

  /**
   * タイピング状態を送信
   * @param conversationId 会話ID
   * @param isTyping タイピング中かどうか
   * @returns 送信が成功したかどうか
   */
  sendTypingEvent(conversationId: string, isTyping: boolean) {
    return this.send({
      type: WebSocketEvent.TYPING,
      data: {
        conversationId,
        isTyping
      }
    });
  }

  /**
   * 既読状態を送信
   * @param messageIds 既読にするメッセージIDの配列
   * @returns 送信が成功したかどうか
   */
  sendReadStatus(messageIds: string[]) {
    return this.send({
      type: WebSocketEvent.READ,
      data: {
        messageIds
      }
    });
  }

  /**
   * グループ会話作成イベントの送信
   * @param participants 参加者IDの配列
   * @param name グループ名
   * @returns 送信が成功したかどうか
   */
  createGroupConversation(participants: string[], name: string) {
    return this.send({
      type: WebSocketEvent.GROUP_CREATED,
      data: {
        participants,
        name
      }
    });
  }

  /**
   * グループメンバー追加イベントの送信
   * @param conversationId 会話ID
   * @param memberIds 追加するメンバーIDの配列
   * @returns 送信が成功したかどうか
   */
  addGroupMembers(conversationId: string, memberIds: string[]) {
    return this.send({
      type: WebSocketEvent.MEMBER_ADDED,
      data: {
        conversationId,
        memberIds
      }
    });
  }

  /**
   * グループメンバー削除イベントの送信
   * @param conversationId 会話ID
   * @param memberId 削除するメンバーID
   * @returns 送信が成功したかどうか
   */
  removeGroupMember(conversationId: string, memberId: string) {
    return this.send({
      type: WebSocketEvent.MEMBER_REMOVED,
      data: {
        conversationId,
        memberId
      }
    });
  }

  /**
   * グループ退出イベントの送信
   * @param conversationId 会話ID
   * @returns 送信が成功したかどうか
   */
  leaveGroup(conversationId: string) {
    return this.send({
      type: WebSocketEvent.USER_LEFT,
      data: {
        conversationId
      }
    });
  }

  /**
   * データ送信の共通メソッド
   * @param data 送信するデータ
   * @param queueIfOffline オフライン時にキューに追加するかどうか
   * @returns 送信が成功したかどうか
   */
  private send(data: {type: string, data: any}, queueIfOffline = true): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('メッセージ送信エラー:', error);
        if (queueIfOffline) {
          this.messageQueue.push(data);
          console.log('メッセージがキューに追加されました');
        }
        return false;
      }
    } else if (queueIfOffline) {
      // 接続されていない場合はキューに追加
      this.messageQueue.push(data);
      console.log('メッセージがキューに追加されました');
      return true;
    }
    return false;
  }

  /**
   * キューに溜まったメッセージを送信
   */
  private flushMessageQueue() {
    console.log(`キューにあるメッセージ数: ${this.messageQueue.length}`);
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const queueCopy = [...this.messageQueue];
      this.messageQueue = [];
      
      queueCopy.forEach(msg => {
        try {
          this.socket?.send(JSON.stringify(msg));
          console.log('キューからメッセージを送信しました');
        } catch (error) {
          console.error('キューメッセージの送信エラー:', error);
          this.messageQueue.push(msg);
        }
      });
    }
  }

  /**
   * 接続状態を変更
   */
  private setStatus(status: ConnectionStatus) {
    if (this.status !== status) {
      console.log(`WebSocket状態変更: ${this.status} -> ${status}`);
      this.status = status;
      this.notifyConnectionStatus();
    }
  }

  /**
   * WebSocket接続が開いたときのハンドラー
   */
  private handleOpen() {
    console.log('WebSocket接続成功');
    this.setStatus(ConnectionStatus.CONNECTED);
    this.reconnectAttempts = 0;
    this.flushMessageQueue();
  }

  /**
   * WebSocketからメッセージを受信したときのハンドラー
   */
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const { type, data: payload } = data;
      
      switch (type) {
        case WebSocketEvent.MESSAGE:
          this.handleIncomingMessage(payload);
          break;
        
        case WebSocketEvent.TYPING:
          this.handleTypingEvent(payload);
          break;
        
        case WebSocketEvent.READ:
          this.handleReadStatus(payload);
          break;
        
        // グループ関連イベントの処理
        case WebSocketEvent.GROUP_CREATED:
        case WebSocketEvent.GROUP_UPDATED:
        case WebSocketEvent.MEMBER_ADDED:
        case WebSocketEvent.MEMBER_REMOVED:
        case WebSocketEvent.USER_LEFT:
          this.handleGroupEvent(type, payload);
          break;
        
        default:
          console.warn('不明なWebSocketイベントタイプ:', type);
      }
    } catch (error) {
      console.error('メッセージ解析エラー:', error);
    }
  }

  /**
   * 受信したメッセージを処理
   */
  private handleIncomingMessage(message: Message) {
    // メッセージリスナーに通知
    this.messageListeners.forEach(listener => listener(message));
    
    // イベントリスナーにも通知
    this.eventListeners[WebSocketEvent.MESSAGE].forEach(listener => listener(message));
  }

  /**
   * タイピングイベントを処理
   */
  private handleTypingEvent(data: {conversationId: string, userId: string, isTyping: boolean}) {
    const { conversationId, userId, isTyping } = data;
    
    // 会話ごとのタイピングリスナーに通知
    if (this.typingEventListeners[conversationId]) {
      this.typingEventListeners[conversationId].forEach(listener => 
        listener(userId, isTyping)
      );
    }
    
    // イベントリスナーにも通知
    this.eventListeners[WebSocketEvent.TYPING].forEach(listener => listener(data));
  }

  /**
   * 既読状態を処理
   */
  private handleReadStatus(data: {conversationId: string, messageIds: string[]}) {
    const { conversationId, messageIds } = data;
    
    // 会話ごとの既読リスナーに通知
    if (this.readStatusListeners[conversationId]) {
      this.readStatusListeners[conversationId].forEach(listener => 
        listener(messageIds)
      );
    }
    
    // イベントリスナーにも通知
    this.eventListeners[WebSocketEvent.READ].forEach(listener => listener(data));
  }

  /**
   * グループ関連イベントを処理
   */
  private handleGroupEvent(type: WebSocketEvent, data: any) {
    const conversationId = data.conversationId;
    
    // 会話ごとのグループリスナーに通知
    if (conversationId && this.groupUpdateListeners[conversationId]) {
      this.groupUpdateListeners[conversationId].forEach(listener => 
        listener(type, data)
      );
    }
    
    // イベントリスナーにも通知
    this.eventListeners[type].forEach(listener => listener(data));
  }

  /**
   * WebSocket接続が閉じたときのハンドラー
   */
  private handleClose(event: CloseEvent) {
    console.log(`WebSocket接続が閉じられました: コード=${event.code}, 理由=${event.reason}`);
    
    // 正常なクローズでなければ再接続
    if (event.code !== 1000) {
      this.setStatus(ConnectionStatus.DISCONNECTED);
      this.scheduleReconnect();
    } else {
      this.setStatus(ConnectionStatus.DISCONNECTED);
    }
  }

  /**
   * WebSocket接続でエラーが発生したときのハンドラー
   */
  private handleError(error: Event) {
    console.error('WebSocketエラー:', error);
    this.setStatus(ConnectionStatus.ERROR);
  }

  /**
   * 再接続タイマーをクリア
   */
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 再接続をスケジュール
   */
  private scheduleReconnect() {
    this.clearReconnectTimer();
    
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId && this.token) {
      const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts), 30000);
      this.reconnectAttempts++;
      
      console.log(`再接続を${delay}ミリ秒後に実行します（試行回数:${this.reconnectAttempts}/${this.maxReconnectAttempts}）`);
      this.setStatus(ConnectionStatus.RECONNECTING);
      
      this.reconnectTimer = setTimeout(() => {
        console.log(`再接続を試みています（試行回数:${this.reconnectAttempts}/${this.maxReconnectAttempts}）`);
        this.connect(this.userId, this.token);
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('最大再接続回数に達しました。再接続を停止します。');
      this.setStatus(ConnectionStatus.ERROR);
    }
  }

  /**
   * 接続状態をリスナーに通知
   */
  private notifyConnectionStatus() {
    this.connectionListeners.forEach(listener => listener(this.status));
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
  addConnectionListener(listener: (status: ConnectionStatus) => void) {
    this.connectionListeners.push(listener);
    // 現在の状態を即座に通知
    listener(this.status);
    
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }

  /**
   * タイピングイベントリスナーを追加
   * @param conversationId 会話ID
   * @param listener タイピング状態を受け取るコールバック関数
   * @returns リスナー解除用の関数
   */
  subscribeToTypingEvent(
    conversationId: string,
    listener: (userId: string, isTyping: boolean) => void
  ) {
    if (!this.typingEventListeners[conversationId]) {
      this.typingEventListeners[conversationId] = [];
    }
    
    this.typingEventListeners[conversationId].push(listener);
    
    return () => {
      if (this.typingEventListeners[conversationId]) {
        this.typingEventListeners[conversationId] = 
          this.typingEventListeners[conversationId].filter(l => l !== listener);
      }
    };
  }

  /**
   * 既読状態リスナーを追加
   * @param conversationId 会話ID
   * @param listener 既読状態を受け取るコールバック関数
   * @returns リスナー解除用の関数
   */
  subscribeToReadStatus(
    conversationId: string,
    listener: (messageIds: string[]) => void
  ) {
    if (!this.readStatusListeners[conversationId]) {
      this.readStatusListeners[conversationId] = [];
    }
    
    this.readStatusListeners[conversationId].push(listener);
    
    return () => {
      if (this.readStatusListeners[conversationId]) {
        this.readStatusListeners[conversationId] = 
          this.readStatusListeners[conversationId].filter(l => l !== listener);
      }
    };
  }

  /**
   * グループ更新イベントリスナーを追加
   * @param conversationId 会話ID
   * @param listener グループ更新イベントを受け取るコールバック関数
   * @returns リスナー解除用の関数
   */
  subscribeToGroupUpdates(
    conversationId: string,
    listener: (event: WebSocketEvent, data: any) => void
  ) {
    if (!this.groupUpdateListeners[conversationId]) {
      this.groupUpdateListeners[conversationId] = [];
    }
    
    this.groupUpdateListeners[conversationId].push(listener);
    
    return () => {
      if (this.groupUpdateListeners[conversationId]) {
        this.groupUpdateListeners[conversationId] = 
          this.groupUpdateListeners[conversationId].filter(l => l !== listener);
      }
    };
  }

  /**
   * 特定のイベントタイプへのリスナーを追加
   * @param eventType イベントタイプ
   * @param listener イベントデータを受け取るコールバック関数
   * @returns リスナー解除用の関数
   */
  subscribeToEvent(
    eventType: WebSocketEvent,
    listener: (data: any) => void
  ) {
    this.eventListeners[eventType].push(listener);
    
    return () => {
      this.eventListeners[eventType] = 
        this.eventListeners[eventType].filter(l => l !== listener);
    };
  }

  /**
   * 現在の接続状態を取得
   */
  getConnectionStatus(): ConnectionStatus {
    return this.status;
  }
}

// シングルトンインスタンスを作成してエクスポート
export const webSocketService = new WebSocketService();
