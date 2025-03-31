// APIエンドポイント設定
import { ENDPOINTS, API_BASE_URL } from "../../config/api";
/**
 * Cloud Run API フック
 *
 * React Query を使用したAPIアクセス用フック
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { ApiResponse } from "../../utils/apiClient";
import api from "../../api";

// 型定義のインポート
import {
  IAttenderProfile as Attender,
  IExperience as Experience,
} from "../../types/attender";
import { Review } from "../../types/review"; // レビューの型をインポート
import Booking from "../../types/booking"; // 予約の型をインポート

// API オプション
interface ApiOptions {
  headers?: Record<string, string>;
}

/**
 * API読み取りクエリ用フック
 */
export function useApiQuery<T>(
  queryKey: unknown[],
  endpoint: string,
  options?: UseQueryOptions<ApiResponse<T>, Error, T> & {
    headers?: Record<string, string>;
  }
) {
  return useQuery<ApiResponse<T>, Error, T>({
    queryKey,
    queryFn: async () => {
      const result = await api.client.get<T>(endpoint, {
        headers: options?.headers,
      });
      if (!result.success) {
        throw new Error(result.error?.message || "APIリクエストが失敗しました");
      }
      return result;
    },
    select: (data) => data.data as T,
    ...options,
  });
}

/**
 * API書き込みミューテーション用フック
 */
export function useApiMutation<T, V = unknown>(
  endpoint: string,
  options?: Omit<
    UseMutationOptions<ApiResponse<T>, Error, V, unknown>,
    "mutationFn"
  > & {
    headers?: Record<string, string>;
    invalidateQueries?: unknown[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<T>, Error, V>({
    mutationFn: async (variables: V) => {
      const result = await api.client.post<T>(endpoint, variables, {
        headers: options?.headers,
      });
      if (!result.success) {
        throw new Error(result.error?.message || "APIリクエストが失敗しました");
      }
      return result;
    },
    onSuccess: (data, variables, context) => {
      // 指定されたクエリキャッシュを無効化
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // カスタムの成功コールバックがある場合は実行
      if (options?.onSuccess) {
        options.onSuccess(data, variables as any, context);
      }
    },
    ...options,
  });
}

/**
 * API更新ミューテーション用フック
 */
export function useApiPutMutation<T, V = unknown>(
  endpointFn: (id: string) => string,
  options?: Omit<
    UseMutationOptions<ApiResponse<T>, Error, { id: string; data: V }, unknown>,
    "mutationFn"
  > & {
    headers?: Record<string, string>;
    invalidateQueries?: unknown[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<T>, Error, { id: string; data: V }>({
    mutationFn: async ({ id, data }) => {
      const endpoint = endpointFn(id);
      const result = await api.client.put<T>(endpoint, data, {
        headers: options?.headers,
      });
      if (!result.success) {
        throw new Error(result.error?.message || "APIリクエストが失敗しました");
      }
      return result;
    },
    onSuccess: (data, variables, context) => {
      // 指定されたクエリキャッシュを無効化
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // カスタムの成功コールバックがある場合は実行
      if (options?.onSuccess) {
        options.onSuccess(data, variables as any, context);
      }
    },
    ...options,
  });
}

/**
 * API削除ミューテーション用フック
 */
export function useApiDeleteMutation<T>(
  endpointFn: (id: string) => string,
  options?: Omit<
    UseMutationOptions<ApiResponse<T>, Error, string, unknown>,
    "mutationFn"
  > & {
    headers?: Record<string, string>;
    invalidateQueries?: unknown[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<T>, Error, string>({
    mutationFn: async (id) => {
      const endpoint = endpointFn(id);
      const result = await api.client.delete<T>(endpoint, {
        headers: options?.headers,
      });
      if (!result.success) {
        throw new Error(result.error?.message || "APIリクエストが失敗しました");
      }
      return result;
    },
    onSuccess: (data, variables, context) => {
      // 指定されたクエリキャッシュを無効化
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // カスタムの成功コールバックがある場合は実行
      if (options?.onSuccess) {
        options.onSuccess(data, variables as any, context);
      }
    },
    ...options,
  });
}

/**
 * APIファイルアップロードミューテーション用フック
 */
export function useApiUploadMutation<T>(
  endpoint: string,
  options?: Omit<
    UseMutationOptions<
      ApiResponse<T>,
      Error,
      {
        file: File;
        fieldName?: string;
        additionalData?: Record<string, string>;
        onProgress?: (progress: number) => void;
      },
      unknown
    >,
    "mutationFn"
  > & {
    headers?: Record<string, string>;
    invalidateQueries?: unknown[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<T>,
    Error,
    {
      file: File;
      fieldName?: string;
      additionalData?: Record<string, string>;
      onProgress?: (progress: number) => void;
    }
  >({
    mutationFn: async ({
      file,
      fieldName = "file",
      additionalData,
      onProgress,
    }) => {
      const result = await api.client.uploadFile<T>(
        endpoint,
        file,
        fieldName,
        additionalData || {},
        { headers: options?.headers }
      );

      if (!result.success) {
        throw new Error(
          result.error?.message || "ファイルアップロードに失敗しました"
        );
      }

      return result;
    },
    onSuccess: (data, variables, context) => {
      // 指定されたクエリキャッシュを無効化
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // カスタムの成功コールバックがある場合は実行
      if (options?.onSuccess) {
        options.onSuccess(data, variables as any, context);
      }
    },
    ...options,
  });
}

/**
 * アテンダー関連のAPIフック
 */
export function useAttenders(params?: Record<string, any>) {
  return useApiQuery<Attender[]>(
    ["attenders", params || {}],
    ENDPOINTS.ATTENDER.LIST
  );
}

export function useAttender(id: string) {
  return useApiQuery<Attender>(
    ["attender", { id }],
    ENDPOINTS.ATTENDER.DETAIL(id)
  );
}

export function useCreateAttender() {
  return useApiMutation<Attender, Partial<Attender>>(
    ENDPOINTS.ATTENDER.CREATE,
    {
      invalidateQueries: [["attenders"]],
    }
  );
}

export function useUpdateAttender() {
  return useApiPutMutation<Attender, Partial<Attender>>(
    ENDPOINTS.ATTENDER.UPDATE,
    {
      invalidateQueries: [["attenders"]],
    }
  );
}

export function useDeleteAttender() {
  return useApiDeleteMutation<{ success: boolean }>(ENDPOINTS.ATTENDER.DETAIL, {
    invalidateQueries: [["attenders"]],
  });
}

/**
 * 体験関連のAPIフック
 */
export function useExperiences(params?: Record<string, any>) {
  return useApiQuery<Experience[]>(
    ["experiences", params || {}],
    ENDPOINTS.EXPERIENCE.LIST
  );
}

export function useExperience(id: string) {
  return useApiQuery<Experience>(
    ["experience", { id }],
    ENDPOINTS.EXPERIENCE.DETAIL(id)
  );
}

export function useCreateExperience() {
  return useApiMutation<Experience, Partial<Experience>>(
    ENDPOINTS.EXPERIENCE.CREATE,
    {
      invalidateQueries: [["experiences"]],
    }
  );
}

export function useUpdateExperience() {
  return useApiPutMutation<Experience, Partial<Experience>>(
    ENDPOINTS.EXPERIENCE.UPDATE,
    {
      invalidateQueries: [["experiences"]],
    }
  );
}

export function useDeleteExperience() {
  return useApiDeleteMutation<{ success: boolean }>(
    ENDPOINTS.EXPERIENCE.DELETE,
    {
      invalidateQueries: [["experiences"]],
    }
  );
}

/**
 * レビュー関連のAPIフック
 */
export function useReviews(params?: Record<string, any>) {
  return useApiQuery<Review[]>(
    ["reviews", params || {}],
    ENDPOINTS.REVIEW.LIST
  );
}

export function useReview(id: string) {
  return useApiQuery<Review>(["review", { id }], ENDPOINTS.REVIEW.DETAIL(id));
}

export function useCreateReview() {
  return useApiMutation<Review, Partial<Review>>(ENDPOINTS.REVIEW.CREATE, {
    invalidateQueries: [["reviews"]],
  });
}

export function useUpdateReview() {
  return useApiPutMutation<Review, Partial<Review>>(ENDPOINTS.REVIEW.UPDATE, {
    invalidateQueries: [["reviews"]],
  });
}

export function useDeleteReview() {
  return useApiDeleteMutation<{ success: boolean }>(ENDPOINTS.REVIEW.DELETE, {
    invalidateQueries: [["reviews"]],
  });
}

/**
 * 予約関連のAPIフック
 */
export function useBookings(params?: Record<string, any>) {
  return useApiQuery<Booking[]>(
    ["bookings", params || {}],
    ENDPOINTS.BOOKING.LIST
  );
}

export function useBooking(id: string) {
  return useApiQuery<Booking>(
    ["booking", { id }],
    ENDPOINTS.BOOKING.DETAIL(id)
  );
}

export function useCreateBooking() {
  return useApiMutation<Booking, Partial<Booking>>(ENDPOINTS.BOOKING.CREATE, {
    invalidateQueries: [["bookings"]],
  });
}

export function useUpdateBookingStatus() {
  return useApiPutMutation<Booking, { status: string }>(
    ENDPOINTS.BOOKING.UPDATE_STATUS,
    {
      invalidateQueries: [["bookings"]],
    }
  );
}

export function useCancelBooking() {
  return useMutation<
    { success: boolean },
    Error,
    { id: string; reason?: string }
  >({
    mutationFn: async (variables: { id: string; reason?: string }) => {
      const endpoint = ENDPOINTS.BOOKING.CANCEL(variables.id);
      const result = await api.client.post<{ success: boolean }>(endpoint, {
        reason: variables.reason,
      });
      if (!result.success) {
        throw new Error(result.error?.message || "APIリクエストが失敗しました");
      }
      // undefinedが返される可能性があるため、デフォルト値を設定
      return result.data || { success: true };
    },
    onSuccess: () => {
      const queryClient = useQueryClient();
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
