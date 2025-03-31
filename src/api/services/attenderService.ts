/**
 * アテンダーサービス
 */

// APIクライアント
import apiClient from "../../utils/apiClient";
import { ENDPOINTS } from "../../config/api";
import { logApiRequest, logApiResponse } from "../../utils/apiClient";

// モデル
import { AttenderProfile } from "../../types/AttenderProfile";

/**
 * アテンダーのプロフィールを取得
 *
 * @param attenderId アテンダーID
 * @returns アテンダープロフィール
 */
export async function getAttenderProfile(attenderId: string) {
  try {
    logApiRequest("GET", ENDPOINTS.ATTENDER.DETAIL(attenderId), {});

    const response = await apiClient.client.get<AttenderProfile>(
      ENDPOINTS.ATTENDER.DETAIL(attenderId)
    );

    logApiResponse("GET", ENDPOINTS.ATTENDER.DETAIL(attenderId), response);

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("アテンダープロフィール取得エラー:", error);
    return null;
  }
}

/**
 * アテンダー検索
 *
 * @param params 検索パラメータ
 * @returns アテンダーのリスト
 */
export async function searchAttenders(params: {
  category?: string;
  location?: string;
  minRating?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    logApiRequest("GET", ENDPOINTS.ATTENDER.LIST, params);

    const response = await apiClient.client.get<AttenderProfile[]>(
      ENDPOINTS.ATTENDER.LIST,
      { params }
    );

    logApiResponse("GET", ENDPOINTS.ATTENDER.LIST, response);

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error("アテンダー検索エラー:", error);
    return [];
  }
}

/**
 * 新規アテンダー登録
 *
 * @param profileData アテンダープロフィールデータ
 * @returns 成功時はアテンダーID、失敗時はnull
 */
export async function registerAttender(profileData: Partial<AttenderProfile>) {
  try {
    logApiRequest("POST", ENDPOINTS.ATTENDER.CREATE, profileData);

    const response = await apiClient.client.post<{ id: string }>(
      ENDPOINTS.ATTENDER.CREATE,
      profileData
    );

    logApiResponse("POST", ENDPOINTS.ATTENDER.CREATE, response);

    if (response.success && response.data) {
      return response.data.id;
    }

    return null;
  } catch (error) {
    console.error("アテンダー登録エラー:", error);
    return null;
  }
}

/**
 * アテンダープロフィール更新
 *
 * @param attenderId アテンダーID
 * @param updateData 更新データ
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function updateAttenderProfile(
  attenderId: string,
  updateData: Partial<AttenderProfile>
) {
  try {
    logApiRequest("PUT", ENDPOINTS.ATTENDER.UPDATE(attenderId), updateData);

    const response = await apiClient.client.put(
      ENDPOINTS.ATTENDER.UPDATE(attenderId),
      updateData
    );

    logApiResponse("PUT", ENDPOINTS.ATTENDER.UPDATE(attenderId), response);

    return response.success;
  } catch (error) {
    console.error("アテンダープロフィール更新エラー:", error);
    return false;
  }
}

export default {
  getAttenderProfile,
  searchAttenders,
  registerAttender,
  updateAttenderProfile,
};
