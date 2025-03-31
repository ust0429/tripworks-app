/**
 * API接続監視
 * 
 * APIとの接続状態を監視し、問題が発生した場合に再接続を試みます。
 */
import apiClient from './apiClientEnhanced';
import { ENDPOINTS } from '../config/api';
import { isDevelopment, isDebugMode } from '../config/env';

// 接続状態
type ConnectionStatus = 'unknown' | 'connected' | 'disconnected' | 'reconnecting';

// 監視設定
interface MonitorConfig {
  interval: number;        // 接続確認間隔（ミリ秒）
  maxRetries: number;      // 最大再試行回数
  retryDelay: number;      // 再試行の遅延時間（ミリ秒）
  onStatusChange?: (status: ConnectionStatus) => void; // 状態変更時のコールバック
}

// デフォルト設定
const defaultConfig: MonitorConfig = {
  interval: 60000,        // 1分ごとにチェック
  maxRetries: 3,          // 最大3回再試行
  retryDelay: 3000        // 3秒後に再試行
};

class ApiMonitor {
  private status: ConnectionStatus = 'unknown';
  private config: MonitorConfig;
  private intervalId: number | null = null;
  private retryCount: number = 0;
  private lastCheck: number = 0;
  
  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  /**
   * 監視を開始
   */
  public start(): void {
    if (this.intervalId) return; // 既に実行中の場合は何もしない
    
    console.info('API接続監視を開始します');
    this.check(); // 初回チェック
    
    // 定期的なチェックを設定
    this.intervalId = window.setInterval(() => {
      this.check();
    }, this.config.interval);
  }
  
  /**
   * 監視を停止
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.info('API接続監視を停止しました');
    }
  }
  
  /**
   * 接続状態を取得
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }
  
  /**
   * 接続確認を実施
   */
  private async check(): Promise<void> {
    // 短時間に複数回呼ばれるのを防止
    const now = Date.now();
    if (now - this.lastCheck < 5000) return;
    this.lastCheck = now;
    
    try {
      if (isDevelopment() || isDebugMode()) {
        console.debug('API接続状態を確認中...');
      }
      
      // 軽量なエンドポイントでAPIの応答を確認
      const response = await apiClient.get(ENDPOINTS.ATTENDER.LIST, { limit: 1 });
      
      if (response.success) {
        if (this.status !== 'connected') {
          this.updateStatus('connected');
          console.info('API接続確認: 接続済み');
        }
        this.retryCount = 0; // 成功したらリトライカウントをリセット
      } else {
        console.warn('API接続確認: 異常', response.error);
        this.handleConnectionFailure();
      }
    } catch (error) {
      console.error('API接続確認中にエラーが発生:', error);
      this.handleConnectionFailure();
    }
  }
  
  /**
   * 接続失敗時の処理
   */
  private handleConnectionFailure(): void {
    if (this.status === 'reconnecting') {
      // 既に再接続試行中
      this.retryCount++;
      
      if (this.retryCount > this.config.maxRetries) {
        this.updateStatus('disconnected');
        console.error(`API再接続失敗: 最大試行回数(${this.config.maxRetries}回)を超えました`);
        this.retryCount = 0; // 次回のために再設定
      }
    } else {
      this.updateStatus('reconnecting');
      this.retryCount = 1;
      
      // 一定時間後に再試行
      setTimeout(() => {
        console.info('API再接続を試みます...');
        this.check();
      }, this.config.retryDelay);
    }
  }
  
  /**
   * 状態を更新し、コールバックを実行
   */
  private updateStatus(newStatus: ConnectionStatus): void {
    if (this.status === newStatus) return;
    
    const oldStatus = this.status;
    this.status = newStatus;
    
    if (this.config.onStatusChange) {
      this.config.onStatusChange(newStatus);
    }
    
    // 接続状態の変化をログに記録
    console.info(`API接続状態変更: ${oldStatus} → ${newStatus}`);
    
    // UIで通知が必要な場合はここで処理
    if (newStatus === 'disconnected') {
      // 例: 切断を通知する処理
      if (typeof window !== 'undefined') {
        // ブラウザで実行されている場合のみ
        const event = new CustomEvent('api-disconnect', { detail: { timestamp: Date.now() } });
        window.dispatchEvent(event);
      }
    } else if (oldStatus === 'disconnected' && newStatus === 'connected') {
      // 例: 再接続を通知する処理
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('api-reconnect', { detail: { timestamp: Date.now() } });
        window.dispatchEvent(event);
      }
    }
  }
  
  /**
   * 明示的に接続確認を実行
   */
  public async forceCheck(): Promise<ConnectionStatus> {
    await this.check();
    return this.status;
  }
}

// シングルトンインスタンス
const apiMonitor = new ApiMonitor();

// ブラウザ環境での自動開始
if (typeof window !== 'undefined') {
  // ページの完全読み込み後に開始
  window.addEventListener('load', () => {
    setTimeout(() => {
      apiMonitor.start();
    }, 2000);
  });
  
  // ページがアクティブになった時に接続確認
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      apiMonitor.forceCheck();
    }
  });
}

export default apiMonitor;
