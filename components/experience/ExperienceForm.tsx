/**
 * 体験登録フォームコンポーネント
 *
 * アテンダーが提供する体験を登録・編集するためのフォーム
 */
import React, { useState, useEffect } from "react";
import { ExperienceSample } from "../../types/attender/profile";
import apiClient, {
  logApiRequest,
  logApiResponse,
} from "../../utils/apiClient";
import { ENDPOINTS } from "../../config/api";

interface ExperienceFormProps {
  attenderId: string;
  experienceId?: string; // 編集時に使用
  onSuccess?: (experienceId: string) => void;
  onCancel?: () => void;
}

// 体験カテゴリの選択肢
const CATEGORIES = [
  "伝統文化",
  "アート",
  "食文化",
  "クラフト",
  "アウトドア",
  "音楽",
  "ローカルツアー",
  "ワークショップ",
  "その他",
];

const ExperienceForm: React.FC<ExperienceFormProps> = ({
  attenderId,
  experienceId,
  onSuccess,
  onCancel,
}) => {
  // 初期値
  const initialFormData: Partial<ExperienceSample> = {
    title: "",
    description: "",
    category: "",
    subcategory: "",
    estimatedDuration: 60,
    price: 0,
    location: "",
    images: [],
  };

  const [formData, setFormData] =
    useState<Partial<ExperienceSample>>(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // 編集時のデータ取得
  useEffect(() => {
    const fetchExperienceData = async () => {
      if (!experienceId) {
        setIsEditing(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setIsEditing(true);

        console.log(`体験データを取得中... ID: ${experienceId}`);

        // APIから体験データを取得
        const response = await apiClient.get(
          `${ENDPOINTS.EXPERIENCE.DETAIL(experienceId)}`
        );

        if (response.success && response.data) {
          console.log("体験データ取得成功:", response.data.title);

          // 体験データをフォームにセット
          setFormData({
            title: response.data.title,
            description: response.data.description,
            category: response.data.category,
            subcategory: response.data.subcategory || "",
            estimatedDuration:
              response.data.estimatedDuration || response.data.duration || 60,
            price: response.data.price || response.data.pricePerPerson || 0,
            location: response.data.location || "",
            images: response.data.images || response.data.imageUrls || [],
          });
        } else {
          console.error("体験データ取得エラー:", response.error);
          setError(response.error?.message || "体験データの取得に失敗しました");
        }
      } catch (err) {
        console.error("体験データ取得中にエラーが発生:", err);
        setError("データの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchExperienceData();
  }, [experienceId]);

  // 入力値の変更ハンドラー
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // 数値項目の変換
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // 画像ファイル選択ハンドラー
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
  };

  // 選択した画像の削除
  const handleRemoveSelectedImage = (index: number) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);
  };

  // アップロード済み画像の削除
  const handleRemoveUploadedImage = (url: string) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((image) => image !== url),
    });
  };

  // 画像のアップロード処理
  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) {
      return formData.images || [];
    }

    const uploadedUrls: string[] = [...(formData.images || [])];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const progressPerFile = 100 / imageFiles.length;

      try {
        // プログレスコールバック
        const updateProgress = (fileProgress: number) => {
          const totalProgress =
            i * progressPerFile + (fileProgress * progressPerFile) / 100;
          setUploadProgress(Math.round(totalProgress));
        };

        // 画像をアップロード
        const response = await apiClient.uploadFile(
          ENDPOINTS.UPLOAD.IMAGE,
          file,
          "image",
          { attenderId },
          {},
          updateProgress
        );

        if (response.success && response.data?.url) {
          uploadedUrls.push(response.data.url);
        } else {
          console.error(
            `画像「${file.name}」のアップロードに失敗:`,
            response.error
          );
        }
      } catch (err) {
        console.error(
          `画像「${file.name}」のアップロード中にエラーが発生:`,
          err
        );
      }
    }

    return uploadedUrls;
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // バリデーション
      if (!formData.title?.trim()) {
        setError("タイトルは必須です");
        return;
      }

      if (!formData.description?.trim()) {
        setError("説明文は必須です");
        return;
      }

      if (!formData.category) {
        setError("カテゴリは必須です");
        return;
      }

      // 画像をアップロード
      const imageUrls = await uploadImages();

      // 送信データの準備
      const experienceData = {
        ...formData,
        images: imageUrls,
        attenderId,
      };

      console.log("体験データを送信中...", experienceData);

      // APIエンドポイントとメソッドを決定
      const endpoint = isEditing
        ? ENDPOINTS.EXPERIENCE.UPDATE(experienceId as string)
        : ENDPOINTS.ATTENDER.EXPERIENCES(attenderId);

      const method = isEditing ? "put" : "post";

      // APIリクエストの実行
      const response = await apiClient[method](endpoint, experienceData);

      if (response.success) {
        console.log("体験データ送信成功:", response.data);

        // 成功コールバック
        if (onSuccess) {
          onSuccess(response.data.id || (experienceId as string));
        }
      } else {
        console.error("体験データ送信エラー:", response.error);
        setError(response.error?.message || "体験データの送信に失敗しました");
      }
    } catch (err) {
      console.error("体験データ送信中にエラーが発生:", err);
      setError("データの送信中にエラーが発生しました");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "体験を編集" : "新しい体験を登録"}
        </h2>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* タイトル */}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-700 font-medium mb-2"
          >
            タイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="あなたの体験のタイトル"
            required
            disabled={loading}
          />
        </div>

        {/* カテゴリ */}
        <div className="mb-4">
          <label
            htmlFor="category"
            className="block text-gray-700 font-medium mb-2"
          >
            カテゴリ
          </label>
          <select
            id="category"
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
            disabled={loading}
          >
            <option value="">カテゴリを選択</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* サブカテゴリ */}
        <div className="mb-4">
          <label
            htmlFor="subcategory"
            className="block text-gray-700 font-medium mb-2"
          >
            サブカテゴリ (任意)
          </label>
          <input
            type="text"
            id="subcategory"
            name="subcategory"
            value={formData.subcategory || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="より詳細なカテゴリ（例: 陶芸、そば打ち）"
            disabled={loading}
          />
        </div>

        {/* 説明 */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 font-medium mb-2"
          >
            説明文
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={5}
            placeholder="あなたの体験の魅力や内容について詳しく説明してください"
            required
            disabled={loading}
          />
        </div>

        {/* 所要時間 */}
        <div className="mb-4">
          <label
            htmlFor="estimatedDuration"
            className="block text-gray-700 font-medium mb-2"
          >
            所要時間 (分)
          </label>
          <input
            type="number"
            id="estimatedDuration"
            name="estimatedDuration"
            value={formData.estimatedDuration || 60}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            min="15"
            step="15"
            required
            disabled={loading}
          />
        </div>

        {/* 価格 */}
        <div className="mb-4">
          <label
            htmlFor="price"
            className="block text-gray-700 font-medium mb-2"
          >
            価格 (円)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price || 0}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            min="0"
            step="100"
            required
            disabled={loading}
          />
        </div>

        {/* 場所 */}
        <div className="mb-4">
          <label
            htmlFor="location"
            className="block text-gray-700 font-medium mb-2"
          >
            開催場所
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="体験の開催場所（例: 京都市中京区）"
            disabled={loading}
          />
        </div>

        {/* 画像アップロード */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">画像</label>

          {/* アップロード済み画像のプレビュー */}
          {formData.images && formData.images.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                アップロード済み画像:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {formData.images.map((url, index) => (
                  <div key={`uploaded-${index}`} className="relative">
                    <img
                      src={url}
                      alt={`体験画像 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveUploadedImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 新たに選択した画像のプレビュー */}
          {imageFiles.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">新たに選択した画像:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {imageFiles.map((file, index) => (
                  <div key={`selected-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`選択画像 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 画像アップロード入力 */}
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
              disabled={loading}
            />
            <label
              htmlFor="image-upload"
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2 px-4 rounded cursor-pointer inline-block"
            >
              画像を追加
            </label>
            <p className="mt-1 text-sm text-gray-500">
              複数の画像を選択できます。1枚あたり5MB以下の画像をアップロードしてください。
            </p>
          </div>
        </div>

        {/* アップロードプログレス */}
        {loading && uploadProgress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              画像アップロード中... {uploadProgress}%
            </p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:bg-indigo-300"
            disabled={loading}
          >
            {loading ? (
              <span>処理中...</span>
            ) : isEditing ? (
              <span>更新する</span>
            ) : (
              <span>登録する</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ExperienceForm;
