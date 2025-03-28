/**
 * 予約サービス
 */

// APIクライアント
import apiClient from '../../utils/apiClientEnhanced';
import { ENDPOINTS } from '../../config/api';
import { logApiRequest, logApiResponse } from '../../utils/apiClient';
import { Booking, BookingCreateData } from '../../services/BookingService';

/**
 * ユーザーの予約一覧を取得
 * 
 * @param filters オプションのフィルター条件
 * @returns 予約一覧
 */
export async function getUserBookings(filters?: {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  from?: string;
  to?: string;
}) {
  try {
    logApiRequest('GET', ENDPOINTS.BOOKING.USER_BOOKINGS, filters);
    
    const response = await apiClient.client.get<Booking[]>(
      ENDPOINTS.BOOKING.USER_BOOKINGS,
      { 
        params: filters 
      }
    );
    
    logApiResponse('GET', ENDPOINTS.BOOKING.USER_BOOKINGS, response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('ユーザー予約一覧取得エラー:', error);
    return [];
  }
}

/**
 * アテンダーの予約一覧を取得（アテンダー専用）
 * 
 * @param filters オプションのフィルター条件
 * @returns 予約一覧
 */
export async function getAttenderBookings(filters?: {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  from?: string;
  to?: string;
}) {
  try {
    logApiRequest('GET', ENDPOINTS.BOOKING.ATTENDER_BOOKINGS, filters);
    
    const response = await apiClient.client.get<Booking[]>(
      ENDPOINTS.BOOKING.ATTENDER_BOOKINGS,
      { 
        params: filters 
      }
    );
    
    logApiResponse('GET', ENDPOINTS.BOOKING.ATTENDER_BOOKINGS, response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('アテンダー予約一覧取得エラー:', error);
    return [];
  }
}

/**
 * 予約の詳細を取得
 * 
 * @param bookingId 予約ID
 * @returns 予約詳細
 */
export async function getBookingDetails(bookingId: string) {
  try {
    logApiRequest('GET', ENDPOINTS.BOOKING.DETAIL(bookingId), {});
    
    const response = await apiClient.client.get<Booking>(
      ENDPOINTS.BOOKING.DETAIL(bookingId)
    );
    
    logApiResponse('GET', ENDPOINTS.BOOKING.DETAIL(bookingId), response);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('予約詳細取得エラー:', error);
    return null;
  }
}

/**
 * 新規予約を作成
 * 
 * @param bookingData 予約データ
 * @returns 成功時は予約ID、失敗時はnull
 */
export async function createBooking(bookingData: BookingCreateData) {
  try {
    logApiRequest('POST', ENDPOINTS.BOOKING.CREATE, bookingData);
    
    const response = await apiClient.client.post<{ id: string }>(
      ENDPOINTS.BOOKING.CREATE,
      bookingData
    );
    
    logApiResponse('POST', ENDPOINTS.BOOKING.CREATE, response);
    
    if (response.success && response.data) {
      return response.data.id;
    }
    
    return null;
  } catch (error) {
    console.error('予約作成エラー:', error);
    return null;
  }
}

/**
 * 予約をキャンセル
 * 
 * @param bookingId 予約ID
 * @param reason キャンセル理由（オプション）
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  try {
    logApiRequest('PATCH', ENDPOINTS.BOOKING.CANCEL(bookingId), { reason });
    
    const response = await apiClient.client.patch(
      ENDPOINTS.BOOKING.CANCEL(bookingId),
      {
        status: 'cancelled',
        cancelReason: reason
      }
    );
    
    logApiResponse('PATCH', ENDPOINTS.BOOKING.CANCEL(bookingId), response);
    
    return response.success;
  } catch (error) {
    console.error('予約キャンセルエラー:', error);
    return false;
  }
}

/**
 * 予約を確定（アテンダー専用）
 * 
 * @param bookingId 予約ID
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function confirmBooking(bookingId: string) {
  try {
    logApiRequest('PATCH', ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId), { status: 'confirmed' });
    
    const response = await apiClient.client.patch(
      ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId),
      {
        status: 'confirmed'
      }
    );
    
    logApiResponse('PATCH', ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId), response);
    
    return response.success;
  } catch (error) {
    console.error('予約確定エラー:', error);
    return false;
  }
}

/**
 * 予約を完了（アテンダー専用）
 * 
 * @param bookingId 予約ID
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function completeBooking(bookingId: string) {
  try {
    logApiRequest('PATCH', ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId), { status: 'completed' });
    
    const response = await apiClient.client.patch(
      ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId),
      {
        status: 'completed'
      }
    );
    
    logApiResponse('PATCH', ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId), response);
    
    return response.success;
  } catch (error) {
    console.error('予約完了処理エラー:', error);
    return false;
  }
}

export default {
  getUserBookings,
  getAttenderBookings,
  getBookingDetails,
  createBooking,
  cancelBooking,
  confirmBooking,
  completeBooking
};
