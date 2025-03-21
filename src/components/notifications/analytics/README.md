# 通知分析ダッシュボード

## 必要なライブラリのインストール

このコンポーネントを正常に動作させるには、以下のライブラリをインストールする必要があります：

```bash
npm install recharts @types/recharts
```

または

```bash
yarn add recharts @types/recharts
```

## 概要

通知分析ダッシュボードは以下のコンポーネントで構成されています：

1. `NotificationAnalyticsDashboard` - メインダッシュボードコンポーネント
2. `NotificationMetricsCard` - 数値メトリクスを表示するカード
3. `NotificationTrendsChart` - 送信・既読・クリック数の時系列グラフ
4. `NotificationTypeBreakdown` - 通知タイプ別の分析
5. `DeviceDistributionChart` - デバイス種類の分布表示
6. `TopPerformingCard` - 最もパフォーマンスが高い通知タイプの表示

## 使用方法

```tsx
import { NotificationAnalyticsDashboard } from './components/notifications/analytics';

// ユーザーIDを指定してダッシュボードを表示（管理者用）
const AdminDashboard = () => {
  return <NotificationAnalyticsDashboard userId="admin" />;
};
```

## 依存関係

このコンポーネントは以下のサービスやデータソースに依存しています：

- `notificationAnalyticsService` - 通知分析データの取得
- `notificationService` - 通知設定の管理
- タイプ定義：`NotificationAnalytics`, `NotificationMetrics`, `NotificationTrend`, `DeviceStats`

## 機能

- 日付範囲を選択して期間別データを表示
- 通知メトリクス（送信数、既読率、クリック率）の表示
- 時系列トレンドの可視化
- 通知タイプ別の詳細分析（数値 / 割合の切り替え）
- デバイス分布の円グラフ表示
- 最もパフォーマンスの高い通知タイプの特定

## 今後の拡張予定

- ユーザーセグメント別の分析
- A/Bテスト結果の可視化
- エクスポート機能（CSV, Excel, PDF）
- カスタム期間の分析
- リアルタイム通知統計
