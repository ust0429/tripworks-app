/**
 * アテンダー一覧ページ
 *
 * 登録されているアテンダーの一覧を表示します。
 */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { NextPage } from "next";
import Link from "next/link";
import apiClient, {
  logApiRequest,
  logApiResponse,
} from "../../utils/apiClient";
import { ENDPOINTS } from "../../config/api";
import type { AttenderProfile } from "../../types/attender/profile";

const AttendersPage: NextPage = () => {
  const [attenders, setAttenders] = useState<AttenderProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: "",
    specialty: "",
    rating: 0,
  });

  // アテンダー一覧を取得
  useEffect(() => {
    const fetchAttenders = async () => {
      try {
        setLoading(true);

        console.log("アテンダー一覧を取得中...");
        logApiRequest("GET", ENDPOINTS.ATTENDER.LIST, {
          location: filters.location || undefined,
          specialties: filters.specialty || undefined,
          rating: filters.rating > 0 ? filters.rating : undefined,
        });

        // APIクエリパラメータの準備
        const queryParams: Record<string, any> = {};
        if (filters.location) queryParams.location = filters.location;
        if (filters.specialty) queryParams.specialties = filters.specialty;
        if (filters.rating > 0) queryParams.rating = filters.rating;

        // APIからアテンダー一覧を取得
        const response = await apiClient.get<AttenderProfile[]>(
          ENDPOINTS.ATTENDER.LIST,
          queryParams
        );

        logApiResponse("GET", ENDPOINTS.ATTENDER.LIST, response);

        if (response.success && Array.isArray(response.data)) {
          console.log(`アテンダー一覧取得成功: ${response.data.length}件`);
          setAttenders(response.data);
        } else {
          console.error("アテンダー一覧取得エラー:", response.error);
          setError(
            response.error?.message || "アテンダー情報の取得に失敗しました"
          );
        }
      } catch (err) {
        console.error("アテンダー一覧取得中にエラーが発生:", err);
        setError("データの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchAttenders();
  }, [filters]); // フィルター変更時に再取得

  // フィルター変更ハンドラー
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  return (
    <>
      <Head>
        <title>アテンダー一覧 | echo</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">アテンダー一覧</h1>

        {/* フィルターセクション */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">検索フィルター</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="location" className="block text-gray-700 mb-1">
                場所
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="都市や地域名"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-gray-700 mb-1">
                専門分野
              </label>
              <input
                type="text"
                id="specialty"
                name="specialty"
                value={filters.specialty}
                onChange={handleFilterChange}
                placeholder="専門分野で検索"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="rating" className="block text-gray-700 mb-1">
                最低評価
              </label>
              <select
                id="rating"
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value={0}>指定なし</option>
                <option value={3}>3.0以上</option>
                <option value={4}>4.0以上</option>
                <option value={4.5}>4.5以上</option>
              </select>
            </div>
          </div>
        </div>

        {/* 読み込み中 */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-gray-600">アテンダー情報を読み込み中...</p>
          </div>
        )}

        {/* エラー表示 */}
        {error && !loading && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-indigo-600 underline"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* アテンダー一覧 */}
        {!loading && !error && (
          <>
            {attenders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  検索条件に合うアテンダーが見つかりませんでした
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attenders.map((attender) => (
                  <Link href={`/attenders/${attender.id}`} key={attender.id}>
                    <a className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-48 bg-gray-200 relative">
                        {attender.profilePhoto || attender.imageUrl ? (
                          <img
                            src={attender.profilePhoto || attender.imageUrl}
                            alt={attender.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            画像なし
                          </div>
                        )}

                        {/* 評価表示 */}
                        {(attender.averageRating || attender.rating) && (
                          <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white px-3 py-1 flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1">
                              {(
                                attender.averageRating || attender.rating
                              ).toFixed(1)}
                            </span>
                            <span className="ml-1 text-sm">
                              ({attender.reviewCount || 0})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h2 className="font-bold text-lg">{attender.name}</h2>

                        <div className="mt-1 text-gray-600 text-sm">
                          {typeof attender.location === "string"
                            ? attender.location
                            : `${attender.location.city}, ${attender.location.region}`}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {attender.specialties
                            .slice(0, 3)
                            .map((specialty, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                              >
                                {specialty}
                              </span>
                            ))}
                          {attender.specialties.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                              +{attender.specialties.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                          {attender.bio ||
                            attender.biography ||
                            "自己紹介はまだ設定されていません。"}
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AttendersPage;
