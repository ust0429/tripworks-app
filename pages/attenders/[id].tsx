/**
 * アテンダー詳細ページ
 *
 * 特定のアテンダーの詳細情報を表示します。
 */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { NextPage } from "next";
import AttenderProfileDisplay from "../../components/attender/AttenderProfile";
import AttenderProfileEditor from "../../components/attender/AttenderProfileEditor";
import apiClient, {
  logApiRequest,
  logApiResponse,
} from "../../utils/apiClient";
import { ENDPOINTS } from "../../config/api";
import type { AttenderProfile } from "../../types/attender/profile";

const AttenderDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<AttenderProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);

  // アテンダープロフィールを取得
  useEffect(() => {
    const fetchAttenderProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        console.log(`アテンダープロフィールを取得中... ID: ${id}`);
        logApiRequest("GET", ENDPOINTS.ATTENDER.DETAIL(id as string), {});

        // APIからプロフィールを取得
        const response = await apiClient.get<AttenderProfile>(
          ENDPOINTS.ATTENDER.DETAIL(id as string)
        );

        logApiResponse(
          "GET",
          ENDPOINTS.ATTENDER.DETAIL(id as string),
          response
        );

        if (response.success && response.data) {
          console.log("プロフィール取得成功:", response.data.name);
          setProfile(response.data);

          // 現在のユーザーが所有者かどうかを確認
          // 実際の実装では、認証情報からユーザーIDを取得して比較
          // この例では簡易的な判定
          const authToken = await apiClient.getAuthToken();
          const isOwner = authToken && response.data.userId; // 実際はユーザーIDの比較が必要
          setIsCurrentUser(!!isOwner);
        } else {
          console.error("プロフィール取得エラー:", response.error);
          setError(
            response.error?.message || "アテンダー情報の取得に失敗しました"
          );
        }
      } catch (err) {
        console.error("プロフィール取得中にエラーが発生:", err);
        setError("データの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAttenderProfile();
    }
  }, [id]);

  // 編集モードの切り替え
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // プロフィール保存後の処理
  const handleProfileSaved = (updatedProfile: AttenderProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  // 編集キャンセル
  const handleEditCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Head>
        <title>
          {profile ? `${profile.name} | echo` : "アテンダープロフィール | echo"}
        </title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* ページヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {loading
              ? "アテンダー情報読み込み中..."
              : profile?.name || "アテンダープロフィール"}
          </h1>

          {/* 編集ボタン (自分のプロフィールの場合のみ表示) */}
          {isCurrentUser && !loading && !error && !isEditing && (
            <button
              onClick={toggleEditMode}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              プロフィールを編集
            </button>
          )}

          {/* 編集中の場合は戻るボタン */}
          {isEditing && (
            <button
              onClick={handleEditCancel}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              編集をキャンセル
            </button>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
            <p>{error}</p>
            <button
              onClick={() => router.reload()}
              className="mt-2 text-indigo-600 underline"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* 表示・編集コンポーネント切り替え */}
        {isEditing ? (
          <AttenderProfileEditor
            attenderId={id as string}
            onSave={handleProfileSaved}
            onCancel={handleEditCancel}
          />
        ) : (
          <AttenderProfileDisplay attenderId={id as string} />
        )}
      </div>
    </>
  );
};

export default AttenderDetailPage;
