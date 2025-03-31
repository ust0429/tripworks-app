/**
 * アテンダープロフィール表示コンポーネント
 *
 * アテンダーの詳細情報を表示します。
 */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AttenderService from "../../services/AttenderService";
import type { AttenderProfile } from "../../types/attender/profile";
import { ENDPOINTS } from "../../config/api";
import apiClient, {
  logApiRequest,
  logApiResponse,
} from "../../utils/apiClient";

interface AttenderProfileProps {
  attenderId?: string;
}

const AttenderProfileDisplay: React.FC<AttenderProfileProps> = ({
  attenderId,
}) => {
  const router = useRouter();
  const [profile, setProfile] = useState<AttenderProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // router.query からもattenderIdを取得できるようにする
  const id = attenderId || (router.query.id as string);

  useEffect(() => {
    const fetchAttenderProfile = async () => {
      if (!id) return; // IDがない場合は何もしない

      try {
        setLoading(true);
        setError(null);

        console.log(`アテンダー情報を取得中... ID: ${id}`);
        logApiRequest("GET", ENDPOINTS.ATTENDER.DETAIL(id), {});

        // APIからアテンダープロフィールを取得
        const response = await apiClient.get<AttenderProfile>(
          ENDPOINTS.ATTENDER.DETAIL(id)
        );
        logApiResponse("GET", ENDPOINTS.ATTENDER.DETAIL(id), response);

        if (response.success && response.data) {
          console.log("アテンダー情報取得成功:", response.data.name);
          setProfile(response.data);
        } else {
          console.error("アテンダー情報取得エラー:", response.error);
          setError(
            response.error?.message || "アテンダー情報の取得に失敗しました"
          );
        }
      } catch (err) {
        console.error("プロフィール取得中に例外が発生:", err);
        setError("データの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchAttenderProfile();
  }, [id]); // IDが変更されたときに再取得

  // プロフィール更新処理
  const handleProfileUpdate = async (updatedData: Partial<AttenderProfile>) => {
    if (!profile || !profile.id) {
      console.error("プロフィールが読み込まれていないため更新できません");
      return false;
    }

    try {
      console.log("プロフィール更新中...", updatedData);
      setLoading(true);

      // APIにプロフィール更新リクエストを送信
      const response = await apiClient.patch(
        ENDPOINTS.ATTENDER.UPDATE_PROFILE(profile.id),
        updatedData
      );

      if (response.success) {
        console.log("プロフィール更新成功");
        // 更新されたプロフィールを反映
        setProfile({
          ...profile,
          ...updatedData,
          updatedAt: new Date().toISOString(),
        });
        return true;
      } else {
        console.error("プロフィール更新エラー:", response.error);
        setError(response.error?.message || "プロフィールの更新に失敗しました");
        return false;
      }
    } catch (err) {
      console.error("プロフィール更新中に例外が発生:", err);
      setError("更新処理中にエラーが発生しました");
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="p-4 text-center">アテンダー情報が見つかりません</div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row">
        {/* プロフィール画像 */}
        <div className="md:w-1/3 p-2">
          <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={`${profile.name}のプロフィール画像`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                画像なし
              </div>
            )}
          </div>

          {/* 評価情報 */}
          <div className="mt-4 flex items-center">
            <span className="text-yellow-500 text-lg font-bold">
              {profile.averageRating ? profile.averageRating.toFixed(1) : "N/A"}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              ({profile.reviewCount || 0}件のレビュー)
            </span>
          </div>
        </div>

        {/* プロフィール情報 */}
        <div className="md:w-2/3 p-2">
          <h1 className="text-2xl font-bold">{profile.name}</h1>

          {/* 場所 */}
          <div className="mt-2 text-gray-600">
            {typeof profile.location === "string"
              ? profile.location
              : `${profile.location.city}, ${profile.location.region}, ${profile.location.country}`}
          </div>

          {/* 専門分野タグ */}
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>

          {/* 自己紹介文 */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold">自己紹介</h2>
            <p className="mt-2 text-gray-700 whitespace-pre-line">
              {profile.bio ||
                profile.biography ||
                "自己紹介はまだ設定されていません。"}
            </p>
          </div>

          {/* 言語スキル */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold">対応言語</h2>
            <div className="mt-2 space-y-1">
              {profile.languages.map((lang, index) => (
                <div key={index} className="flex items-center">
                  <span className="font-medium">{lang.language}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    (
                    {lang.proficiency === "native"
                      ? "ネイティブ"
                      : lang.proficiency === "advanced"
                      ? "上級"
                      : lang.proficiency === "intermediate"
                      ? "中級"
                      : "初級"}
                    )
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 専門知識 */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold">専門知識</h2>
            <div className="mt-2 space-y-3">
              {profile.expertise.map((exp, index) => (
                <div key={index} className="border-l-2 border-indigo-500 pl-3">
                  <div className="font-medium">{exp.category}</div>
                  {exp.subcategories && exp.subcategories.length > 0 && (
                    <div className="mt-1 text-sm text-gray-600">
                      {exp.subcategories.join(", ")}
                    </div>
                  )}
                  {exp.yearsOfExperience && (
                    <div className="mt-1 text-sm text-gray-500">
                      経験: {exp.yearsOfExperience}年
                    </div>
                  )}
                  {exp.description && (
                    <div className="mt-1 text-sm">{exp.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 体験サンプル */}
      <div className="mt-8">
        <h2 className="text-xl font-bold border-b pb-2">提供可能な体験</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.experienceSamples.map((sample, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {sample.images && sample.images.length > 0 ? (
                  <img
                    src={sample.images[0]}
                    alt={sample.title}
                    className="w-full h-full object-cover"
                  />
                ) : sample.imageUrl ? (
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    画像なし
                  </div>
                )}

                {/* 価格表示 */}
                {(sample.price || sample.pricePerPerson) && (
                  <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white px-3 py-1">
                    ¥{sample.price || sample.pricePerPerson}〜
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-bold text-lg truncate">{sample.title}</h3>
                <div className="mt-1 text-sm text-gray-500">
                  {sample.category}
                  {sample.subcategory && ` / ${sample.subcategory}`}
                </div>
                <div className="mt-1 text-sm">
                  所要時間: 約{sample.estimatedDuration || sample.duration}分
                </div>
                <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                  {sample.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttenderProfileDisplay;
