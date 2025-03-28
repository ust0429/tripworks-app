import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// テスト通知を追加する関数
export async function addTestNotifications(userId: string) {
  try {
    const notificationsRef = collection(db, 'notifications');

    // 予約通知の例
    await addDoc(notificationsRef, {
      userId: userId,
      title: '予約が確認されました',
      message: '鈴木アキラさんとの予約が確認されました。7月15日 14:00に新宿駅東口で会う予定です。',
      type: 'booking',
      subType: 'success',
      isRead: false,
      createdAt: serverTimestamp(),
      resourceType: 'booking',
      resourceId: '123456'
    });

    // レビュー通知の例
    await addDoc(notificationsRef, {
      userId: userId,
      title: 'レビューが投稿されました',
      message: '山田ユカリさんがあなたの体験にレビューを投稿しました。「とても楽しい時間を過ごせました！」',
      type: 'review',
      isRead: false,
      createdAt: serverTimestamp(),
      resourceType: 'review',
      resourceId: '789012'
    });

    // システム通知の例
    await addDoc(notificationsRef, {
      userId: userId,
      title: 'ウェルカムボーナス獲得！',
      message: '新規登録ありがとうございます。初回予約で使える500ポイントをプレゼントしました！',
      type: 'system',
      subType: 'info',
      isRead: false,
      createdAt: serverTimestamp()
    });

    // 警告通知の例
    await addDoc(notificationsRef, {
      userId: userId,
      title: '予約変更のお知らせ',
      message: '佐藤ケンジさんとの予約時間が変更されました。新しい時間は8月5日 16:00です。',
      type: 'booking',
      subType: 'warning',
      isRead: false,
      createdAt: serverTimestamp(),
      resourceType: 'booking',
      resourceId: '456789'
    });

    // エラー通知の例
    await addDoc(notificationsRef, {
      userId: userId,
      title: '予約キャンセルのお知らせ',
      message: '山田ユカリさんとの予約がキャンセルされました。理由: スケジュール変更のため',
      type: 'booking',
      subType: 'error',
      isRead: false,
      createdAt: serverTimestamp(),
      resourceType: 'booking',
      resourceId: '987654'
    });

    console.log('テスト通知が追加されました');
    return true;
  } catch (error) {
    console.error('テスト通知の追加に失敗しました:', error);
    return false;
  }
}

// 使用例:
// import { addTestNotifications } from './examples/addTestNotifications';
// 
// // ログインしているユーザーのIDを使用
// const user = auth.currentUser;
// if (user) {
//   addTestNotifications(user.uid)
//     .then(() => console.log('通知を追加しました'))
//     .catch(err => console.error('エラー:', err));
// }
