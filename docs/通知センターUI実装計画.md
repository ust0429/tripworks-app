# Echo アプリ 通知センターUI実装計画

## 概要

通知システムのバックエンド側の実装が完了し、Firestoreに通知が保存される状態になっています。次のステップとして、ユーザーがアプリ内で通知を確認できるUI部分を実装します。この実装計画では、通知センターUIの設計と実装について詳細を説明します。

## 実装目標

1. **通知ドロップダウンメニュー** - ヘッダーからアクセス可能な通知一覧
2. **通知カウントバッジ** - 未読通知の数を示すバッジ
3. **既読/未読の視覚的区別** - 未読通知を視覚的に強調
4. **通知のアクション** - 通知をクリックすると関連ページへ移動
5. **一括既読機能** - すべての通知を一括で既読にする機能

## UIコンポーネント設計

### 1. 通知アイコンとバッジ

**場所**: アプリのヘッダーバー
**コンポーネント名**: `NotificationIcon.tsx`

```typescript
interface NotificationIconProps {
  unreadCount: number;
  onClick: () => void;
}
```

- ベル型アイコンを表示
- 未読通知がある場合、右上に数字入りの赤いバッジを表示
- クリックで通知ドロップダウンを開閉

### 2. 通知ドロップダウンメニュー

**場所**: ヘッダーの通知アイコンから展開
**コンポーネント名**: `NotificationDropdown.tsx`

```typescript
interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
}
```

- 通知一覧を表示（最新の10件）
- スクロール可能なリスト
- 「すべて見る」リンク
- 「すべて既読にする」ボタン
- 通知がない場合の表示

### 3. 通知リストアイテム

**場所**: 通知ドロップダウン内、および通知一覧ページ
**コンポーネント名**: `NotificationItem.tsx`

```typescript
interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}
```

- 通知アイコン（タイプに応じて異なるアイコン）
- 通知タイトルと簡略メッセージ
- タイムスタンプ（相対時間表示「3分前」など）
- 未読の場合は背景色や左側のバーで視覚的に区別
- クリック可能な領域（関連ページへ移動）

### 4. 通知一覧ページ

**場所**: 独立したページ
**コンポーネント名**: `NotificationsPage.tsx`

- すべての通知を表示（ページネーション付き）
- フィルター機能（すべて / 未読のみ / タイプ別）
- タブでカテゴリ分け（予約 / レビュー / システム）
- 通知ごとのアクション（既読にする / 削除）
- 一括アクション（すべて既読にする / 選択した通知を削除）

## データフロー

### 1. リアルタイム通知取得

Firebase Firestoreのリアルタイムリスナーを使用して通知を取得します。

```typescript
// NotificationContext.tsx
const fetchNotifications = useCallback(() => {
  if (!user) return;

  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const newNotifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.isRead).length);
  });

  return () => unsubscribe();
}, [user]);
```

### 2. 通知の既読マーク

通知をクリックしたときや「すべて既読にする」ボタンを押したときに実行します。

```typescript
// NotificationService.ts
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read', error);
    return false;
  }
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Failed to mark all notifications as read', error);
    return false;
  }
}
```

### 3. 通知のナビゲーション

通知をクリックしたときに関連ページへ移動します。

```typescript
// NotificationContext.tsx
const handleNotificationClick = useCallback(async (notification: Notification) => {
  // 既読にする
  await markAsRead(notification.id);
  
  // 関連ページへ移動
  if (notification.resourceType === 'booking' && notification.resourceId) {
    navigate(`/bookings/${notification.resourceId}`);
  } else if (notification.resourceType === 'review' && notification.resourceId) {
    navigate(`/reviews/${notification.resourceId}`);
  } else if (notification.type === 'system') {
    navigate('/notifications');
  }
}, [navigate]);
```

## スタイリング

### 1. 未読と既読の視覚的な区別

- 未読通知: 左側に青いバー、背景色を薄い青、太字のタイトル
- 既読通知: 標準の背景色、標準のフォントウェイト

### 2. 通知タイプによるアイコン

- 予約通知: カレンダーアイコン
- レビュー通知: 星アイコン
- システム通知: お知らせアイコン
- サブタイプ（確認、キャンセルなど）によっても異なるカラーまたはアイコンを使用

### 3. カラーコード

- 未読通知のバー: #3b82f6 (青)
- 未読通知の背景: #eff6ff (薄い青)
- エラー通知: #ef4444 (赤)
- 成功通知: #10b981 (緑)
- 警告通知: #f59e0b (オレンジ)
- 情報通知: #3b82f6 (青)

## 実装ステップ

1. **NotificationContext** の作成
   - 通知の状態管理
   - リアルタイムリスナーの設定
   - 既読機能の実装

2. **基本コンポーネント** の実装
   - NotificationIcon
   - NotificationDropdown
   - NotificationItem

3. **ヘッダーへの統合**
   - ヘッダーコンポーネントに通知アイコンを追加
   - ドロップダウンの開閉ロジックの実装

4. **通知一覧ページ** の実装
   - フルページの通知一覧
   - フィルタリングと並べ替え機能
   - ページネーション

5. **通知設定ページ** の実装 (オプション)
   - 通知のオン/オフ設定
   - 通知種類ごとの設定
   - メール通知の設定

## テスト計画

1. **ユニットテスト**
   - 各通知コンポーネントのレンダリングテスト
   - 通知サービスの関数テスト

2. **統合テスト**
   - 通知の表示と既読マーキングのフロー
   - 通知クリックから関連ページへのナビゲーション

3. **ユーザーテスト**
   - 通知を受け取った時のUI動作確認
   - 複数の通知が同時に来た場合の挙動
   - 未読→既読への状態変化の視認性

## 次のステップ

この通知センターUIの実装後、以下の機能拡張が考えられます：

1. **Firebase Cloud Messaging** による通知
   - ブラウザのプッシュ通知
   - モバイルアプリのプッシュ通知

2. **通知設定の詳細化**
   - 通知の頻度設定
   - 通知タイプごとの詳細設定
   - 時間帯による通知制御

3. **インタラクティブな通知**
   - 通知内での直接アクション（予約の承認/拒否など）
   - リッチコンテンツを含む通知（画像、ボタンなど）

## 完了基準

通知センターUI実装は以下の条件が満たされた時点で完了とします：

1. ユーザーがヘッダーから通知にアクセスできる
2. 未読通知数がバッジで表示される
3. 通知一覧で未読/既読が視覚的に区別できる
4. 通知をクリックすると関連ページに移動する
5. すべての通知を一括で既読にできる
6. 通知一覧ページで全通知履歴が閲覧できる
