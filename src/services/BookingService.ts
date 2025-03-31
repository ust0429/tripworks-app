/**
 * 予約サービス
 *
 * 予約の作成、取得、キャンセルなどの機能を提供します。
 */

import { v4 as uuidv4 } from "uuid";
import api, {
  logApiRequest,
  logApiResponse,
  ApiOptions,
} from "../utils/apiClient";
import enhancedApi from "../utils/apiClient";
import { ENDPOINTS } from "../config/api";
import { isDevelopment } from "../config/env";

// Firebase AuthのインポートとFallback
let getAuth;
try {
  getAuth = require("firebase/auth").getAuth;
} catch (e) {
  // Firebaseが利用できない場合はモックを使用
  getAuth = () => ({
    currentUser: { uid: "mock-user-id" },
  });
}

// 予約の型定義
export interface Booking {
  id: string;
  userId: string;
  attenderId: string;
  experienceId?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

// 予約作成用データの型定義
export interface BookingCreateData {
  attenderId: string;
  experienceId: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  location: string;
  notes?: string;
}

// モックデータ（開発環境でのみ使用）
const MOCK_BOOKINGS: Record<string, Booking> = {
  bk_123: {
    id: "bk_123",
    userId: "user_789",
    attenderId: "att_123",
    experienceId: "exp_001",
    title: "京都陶芸体験",
    description: "伝統的な京都の陶芸を体験するツアーです。",
    date: "2025-04-15",
    time: "14:00",
    duration: "3時間",
    location: "京都市中京区",
    price: 12000,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2025-03-10T08:30:00Z",
    updatedAt: "2025-03-10T09:15:00Z",
  },
  bk_124: {
    id: "bk_124",
    userId: "user_789",
    attenderId: "att_456",
    experienceId: "exp_002",
    title: "大阪ストリートフード巡り",
    description: "大阪の美味しいストリートフードを地元の人と巡るツアー",
    date: "2025-04-20",
    time: "18:00",
    duration: "4時間",
    location: "大阪市中央区",
    price: 8000,
    status: "pending",
    paymentStatus: "pending",
    createdAt: "2025-03-15T10:30:00Z",
    updatedAt: "2025-03-15T10:30:00Z",
  },
};

// 使用するAPIクライアント
// 開発環境では既存のモックを使用し、本番環境ではclientプロパティを使用
const getApiClient = () => {
  return isDevelopment() ? api : enhancedApi.client;
};

/**
 * ユーザーの予約一覧を取得
 *
 * @param filters オプションのフィルター条件
 * @returns 予約一覧
 */
export async function getUserBookings(filters?: {
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  from?: string;
  to?: string;
}): Promise<Booking[]> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ユーザーがログインしていません");
    }

    const userId = user.uid;

    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // モックデータからこのユーザーの予約だけをフィルタリング
      let bookings = Object.values(MOCK_BOOKINGS).filter(
        (booking) => booking.userId === userId
      );

      // 追加のフィルタリング
      if (filters) {
        if (filters.status) {
          bookings = bookings.filter(
            (booking) => booking.status === filters.status
          );
        }

        if (filters.from) {
          const fromDate = new Date(filters.from);
          bookings = bookings.filter(
            (booking) => new Date(booking.date) >= fromDate
          );
        }

        if (filters.to) {
          const toDate = new Date(filters.to);
          bookings = bookings.filter(
            (booking) => new Date(booking.date) <= toDate
          );
        }
      }

      return bookings;
    }

    // 本番環境ではAPIを使用
    const options: ApiOptions = {
      headers: { "X-User-ID": userId },
      params: filters,
    };

    logApiRequest("GET", ENDPOINTS.BOOKING.USER_BOOKINGS, { ...filters });

    const response = await getApiClient().get<Booking[]>(
      ENDPOINTS.BOOKING.USER_BOOKINGS,
      options
    );

    logApiResponse("GET", ENDPOINTS.BOOKING.USER_BOOKINGS, response);

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error("予約一覧取得エラー:", error);
    return [];
  }
}

/**
 * アテンダーの予約一覧を取得（アテンダー専用）
 *
 * @param attenderId アテンダーID
 * @param filters オプションのフィルター条件
 * @returns 予約一覧
 */
export async function getAttenderBookings(
  attenderId: string,
  filters?: {
    status?: "pending" | "confirmed" | "completed" | "cancelled";
    from?: string;
    to?: string;
  }
): Promise<Booking[]> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // モックデータからこのアテンダーの予約だけをフィルタリング
      let bookings = Object.values(MOCK_BOOKINGS).filter(
        (booking) => booking.attenderId === attenderId
      );

      // 追加のフィルタリング
      if (filters) {
        if (filters.status) {
          bookings = bookings.filter(
            (booking) => booking.status === filters.status
          );
        }

        if (filters.from) {
          const fromDate = new Date(filters.from);
          bookings = bookings.filter(
            (booking) => new Date(booking.date) >= fromDate
          );
        }

        if (filters.to) {
          const toDate = new Date(filters.to);
          bookings = bookings.filter(
            (booking) => new Date(booking.date) <= toDate
          );
        }
      }

      return bookings;
    }

    // 本番環境ではAPIを使用
    const options: ApiOptions = {
      headers: { "X-Attender-ID": attenderId },
      params: filters,
    };

    logApiRequest("GET", ENDPOINTS.BOOKING.ATTENDER_BOOKINGS, {
      attenderId,
      ...filters,
    });

    const response = await getApiClient().get<Booking[]>(
      ENDPOINTS.BOOKING.ATTENDER_BOOKINGS,
      options
    );

    logApiResponse("GET", ENDPOINTS.BOOKING.ATTENDER_BOOKINGS, response);

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error("アテンダー予約一覧取得エラー:", error);
    return [];
  }
}

/**
 * 特定の予約の詳細を取得
 *
 * @param bookingId 予約ID
 * @returns 予約詳細、存在しない場合はnull
 */
export async function getBookingDetails(
  bookingId: string
): Promise<Booking | null> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment() && MOCK_BOOKINGS[bookingId]) {
      return MOCK_BOOKINGS[bookingId];
    }

    // 本番環境ではAPIを使用
    logApiRequest("GET", ENDPOINTS.BOOKING.DETAIL(bookingId), {});

    const response = await getApiClient().get<Booking>(
      ENDPOINTS.BOOKING.DETAIL(bookingId)
    );

    logApiResponse("GET", ENDPOINTS.BOOKING.DETAIL(bookingId), response);

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("予約詳細取得エラー:", error);
    return null;
  }
}

/**
 * 新規予約を作成
 *
 * @param bookingData 予約データ
 * @returns 成功時は予約ID、失敗時はエラーをスロー
 */
export async function createBooking(
  bookingData: BookingCreateData
): Promise<string> {
  try {
    // 現在のユーザーIDを取得
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ユーザーがログインしていません");
    }

    const userId = user.uid;

    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      // 模擬的に処理遅延を再現
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const bookingId = `bk_${uuidv4().substring(0, 8)}`;

      // 新しい予約データを作成
      MOCK_BOOKINGS[bookingId] = {
        id: bookingId,
        userId,
        attenderId: bookingData.attenderId,
        experienceId: bookingData.experienceId,
        title: "新規予約", // 実際の体験タイトルはバックエンドで設定
        description: "詳細説明", // 実際の説明はバックエンドで設定
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        location: bookingData.location,
        price: bookingData.price,
        notes: bookingData.notes,
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return bookingId;
    }

    // 本番環境ではAPIを使用
    const requestData = {
      userId,
      ...bookingData,
    };

    logApiRequest("POST", ENDPOINTS.BOOKING.CREATE, {
      dataSize: JSON.stringify(requestData).length,
    });

    const response = await getApiClient().post<{ id: string }>(
      ENDPOINTS.BOOKING.CREATE,
      requestData
    );

    logApiResponse("POST", ENDPOINTS.BOOKING.CREATE, response);

    if (response.success && response.data) {
      return response.data.id;
    }

    // エラーレスポンスの処理
    const errorMessage = response.error?.message || "予約の作成に失敗しました";
    throw new Error(errorMessage);
  } catch (error) {
    console.error("予約作成エラー:", error);
    throw error instanceof Error
      ? error
      : new Error("予約の作成中に予期せぬエラーが発生しました");
  }
}

/**
 * 予約をキャンセル
 *
 * @param bookingId 予約ID
 * @param reason キャンセル理由（オプション）
 * @returns 成功時はtrue、失敗時はエラーをスロー
 */
export async function cancelBooking(
  bookingId: string,
  reason?: string
): Promise<boolean> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const booking = MOCK_BOOKINGS[bookingId];
      if (!booking) {
        throw new Error("指定された予約が見つかりません");
      }

      // キャンセル済みの場合はエラー
      if (booking.status === "cancelled") {
        throw new Error("この予約はすでにキャンセルされています");
      }

      // 完了済みの場合はエラー
      if (booking.status === "completed") {
        throw new Error("完了済みの予約はキャンセルできません");
      }

      // 予約ステータスの更新
      booking.status = "cancelled";
      booking.cancelReason = reason;
      booking.updatedAt = new Date().toISOString();

      return true;
    }

    // 本番環境ではAPIを使用
    const requestData = {
      status: "cancelled",
      cancelReason: reason,
    };

    logApiRequest("PATCH", ENDPOINTS.BOOKING.CANCEL(bookingId), requestData);

    const response = await getApiClient().patch(
      ENDPOINTS.BOOKING.CANCEL(bookingId),
      requestData
    );

    logApiResponse("PATCH", ENDPOINTS.BOOKING.CANCEL(bookingId), response);

    if (response.success) {
      return true;
    }

    // エラーレスポンスの処理
    const errorMessage =
      response.error?.message || "予約のキャンセルに失敗しました";
    throw new Error(errorMessage);
  } catch (error) {
    console.error("予約キャンセルエラー:", error);
    throw error instanceof Error
      ? error
      : new Error("予約のキャンセル中に予期せぬエラーが発生しました");
  }
}

/**
 * 予約を確定（アテンダー専用）
 *
 * @param bookingId 予約ID
 * @returns 成功時はtrue、失敗時はエラーをスロー
 */
export async function confirmBooking(bookingId: string): Promise<boolean> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const booking = MOCK_BOOKINGS[bookingId];
      if (!booking) {
        throw new Error("指定された予約が見つかりません");
      }

      // すでに確定済みの場合は何もしない
      if (booking.status === "confirmed") {
        return true;
      }

      // キャンセル済みの場合はエラー
      if (booking.status === "cancelled") {
        throw new Error("キャンセル済みの予約は確定できません");
      }

      // 完了済みの場合はエラー
      if (booking.status === "completed") {
        throw new Error("完了済みの予約は再確定できません");
      }

      // 予約ステータスの更新
      booking.status = "confirmed";
      booking.updatedAt = new Date().toISOString();

      return true;
    }

    // 本番環境ではAPIを使用
    const requestData = {
      status: "confirmed",
    };

    logApiRequest(
      "PATCH",
      ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId),
      requestData
    );

    const response = await getApiClient().patch(
      ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId),
      requestData
    );

    logApiResponse(
      "PATCH",
      ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId),
      response
    );

    if (response.success) {
      return true;
    }

    // エラーレスポンスの処理
    const errorMessage = response.error?.message || "予約の確定に失敗しました";
    throw new Error(errorMessage);
  } catch (error) {
    console.error("予約確定エラー:", error);
    throw error instanceof Error
      ? error
      : new Error("予約の確定中に予期せぬエラーが発生しました");
  }
}

/**
 * 予約を完了（アテンダー専用）
 *
 * @param bookingId 予約ID
 * @returns 成功時はtrue、失敗時はエラーをスロー
 */
export async function completeBooking(bookingId: string): Promise<boolean> {
  try {
    // 開発環境ではモックデータを使用
    if (isDevelopment()) {
      const booking = MOCK_BOOKINGS[bookingId];
      if (!booking) {
        throw new Error("指定された予約が見つかりません");
      }

      // すでに完了済みの場合は何もしない
      if (booking.status === "completed") {
        return true;
      }

      // キャンセル済みの場合はエラー
      if (booking.status === "cancelled") {
        throw new Error("キャンセル済みの予約は完了できません");
      }

      // 確定済みでない場合はエラー
      if (booking.status !== "confirmed") {
        throw new Error("確定済みの予約のみ完了できます");
      }

      // 予約ステータスの更新
      booking.status = "completed";
      booking.updatedAt = new Date().toISOString();

      return true;
    }

    // 本番環境ではAPIを使用
    const requestData = {
      status: "completed",
    };

    logApiRequest(
      "PATCH",
      ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId),
      requestData
    );

    const response = await getApiClient().patch(
      ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId),
      requestData
    );

    logApiResponse(
      "PATCH",
      ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId),
      response
    );

    if (response.success) {
      return true;
    }

    // エラーレスポンスの処理
    const errorMessage =
      response.error?.message || "予約の完了処理に失敗しました";
    throw new Error(errorMessage);
  } catch (error) {
    console.error("予約完了処理エラー:", error);
    throw error instanceof Error
      ? error
      : new Error("予約の完了処理中に予期せぬエラーが発生しました");
  }
}

export default {
  getUserBookings,
  getAttenderBookings,
  getBookingDetails,
  createBooking,
  cancelBooking,
  confirmBooking,
  completeBooking,
};
