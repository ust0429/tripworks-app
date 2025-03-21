import { NotificationType } from '../../types/notification';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
}

interface SendEmailParams {
  userId: string;
  templateId: string;
  data: Record<string, any>;
}

class EmailNotificationService {
  private apiBaseUrl: string = process.env.REACT_APP_API_URL || '';
  
  // 利用可能なメールテンプレート
  private emailTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'ウェルカムメール',
      subject: 'echoへようこそ！',
      description: '新規登録したユーザーに送信される歓迎メール'
    },
    {
      id: 'new-message',
      name: '新着メッセージ通知',
      subject: '【echo】新しいメッセージが届いています',
      description: '新しいメッセージが届いたときに送信される通知'
    },
    {
      id: 'reservation-confirmation',
      name: '予約確認',
      subject: '【echo】予約が確定しました',
      description: '予約が確定したときに送信される通知'
    },
    {
      id: 'reservation-reminder',
      name: '予約リマインダー',
      subject: '【echo】明日の予約のお知らせ',
      description: '予約の前日に送信されるリマインダー'
    },
    {
      id: 'new-review',
      name: '新着レビュー通知',
      subject: '【echo】新しいレビューが投稿されました',
      description: '新しいレビューが投稿されたときに送信される通知'
    },
    {
      id: 'payment-confirmation',
      name: '支払い確認',
      subject: '【echo】お支払いが完了しました',
      description: '支払いが完了したときに送信される通知'
    }
  ];
  
  // 利用可能なメールテンプレートを取得
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    // 実際の実装では、バックエンドAPIからテンプレート一覧を取得します
    // ここではモックデータを返します
    return this.emailTemplates;
  }
  
  // メール送信
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    const { userId, templateId, data } = params;
    
    console.log('Sending email notification:', {
      userId,
      templateId,
      data
    });
    
    try {
      // 実際の実装では、バックエンドAPIを呼び出してメール送信をリクエストします
      /*
      const response = await fetch(`${this.apiBaseUrl}/api/email-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          userId,
          templateId,
          data
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status}`);
      }
      
      return true;
      */
      
      // モック: 成功したと仮定
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }
  
  // 通知タイプに基づいてメール送信
  async sendNotificationEmail(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data: Record<string, any> = {}
  ): Promise<boolean> {
    // 通知タイプに対応するメールテンプレートIDをマッピング
    const templateMapping: Record<NotificationType, string> = {
      [NotificationType.MESSAGE]: 'new-message',
      [NotificationType.RESERVATION]: 'reservation-confirmation',
      [NotificationType.REVIEW]: 'new-review',
      [NotificationType.PAYMENT]: 'payment-confirmation',
      [NotificationType.SYSTEM]: 'welcome',
      [NotificationType.MARKETING]: 'marketing'
    };
    
    const templateId = templateMapping[type];
    
    // テンプレートが見つからない場合はエラー
    if (!templateId) {
      console.error(`No email template found for notification type: ${type}`);
      return false;
    }
    
    return this.sendEmail({
      userId,
      templateId,
      data: {
        ...data,
        title,
        message
      }
    });
  }
  
  // メール配信設定状態の確認
  async getEmailPreferences(userId: string): Promise<Record<NotificationType, boolean>> {
    // 実際の実装では、バックエンドAPIからユーザーのメール配信設定を取得します
    // ここではモックデータを返します
    return {
      [NotificationType.SYSTEM]: true,
      [NotificationType.MESSAGE]: true,
      [NotificationType.RESERVATION]: true,
      [NotificationType.REVIEW]: true,
      [NotificationType.PAYMENT]: true,
      [NotificationType.MARKETING]: false
    };
  }
  
  // メール配信設定の更新
  async updateEmailPreferences(
    userId: string,
    preferences: Partial<Record<NotificationType, boolean>>
  ): Promise<boolean> {
    console.log('Updating email preferences:', {
      userId,
      preferences
    });
    
    try {
      // 実際の実装では、バックエンドAPIを呼び出して設定を更新します
      /*
      const response = await fetch(`${this.apiBaseUrl}/api/users/${userId}/email-preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update email preferences: ${response.status}`);
      }
      
      return true;
      */
      
      // モック: 成功したと仮定
      return true;
    } catch (error) {
      console.error('Error updating email preferences:', error);
      return false;
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;
