/**
 * アテンダープロフィールコンテキスト
 *
 * アテンダープロフィールの状態を管理するコンテキスト
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import apiClient from "../utils/apiClient";
import { ENDPOINTS } from "../config/api";
import { useAuth } from "./AuthContext";
import type {
  AttenderProfile,
  ProfileContextState,
  ProfileUpdateOperation,
  ProfileEditMode,
} from "../types/attender/profile";

// アテンダープロフィールコンテキスト型定義
interface AttenderProfileContextType {
  state: ProfileContextState;
  loadProfile: (id: string) => Promise<void>;
  updateProfile: (operation: ProfileUpdateOperation) => void;
  saveProfile: () => Promise<boolean>;
  setEditMode: (mode: ProfileEditMode) => void;
  calculateCompletionScore: (profile: AttenderProfile) => number;
  generateImprovementTips: (profile: AttenderProfile) => string[];
}

// デフォルト値
const defaultState: ProfileContextState = {
  profile: null,
  editMode: "view",
  loadingState: "idle",
  error: null,
  completionScore: 0,
  improvementTips: [],
};

// コンテキストの作成
const AttenderProfileContext = createContext<AttenderProfileContextType>({
  state: defaultState,
  loadProfile: async () => {},
  updateProfile: () => {},
  saveProfile: async () => false,
  setEditMode: () => {},
  calculateCompletionScore: () => 0,
  generateImprovementTips: () => [],
});

// プロフィール完成度の計算
const calculateProfileCompletionScore = (profile: AttenderProfile): number => {
  if (!profile) return 0;

  let score = 0;
  let totalFields = 0;

  // 基本情報
  const basicFields = [
    !!profile.name,
    !!profile.bio || !!profile.biography,
    !!profile.location,
    !!profile.profilePhoto || !!profile.imageUrl,
    Array.isArray(profile.specialties) && profile.specialties.length > 0,
    Array.isArray(profile.languages) && profile.languages.length > 0,
  ];

  score += basicFields.filter(Boolean).length;
  totalFields += basicFields.length;

  // 専門分野
  if (Array.isArray(profile.expertise) && profile.expertise.length > 0) {
    score += 1;

    // 専門分野の詳細
    const expertiseDetails = profile.expertise
      .map((exp) => [
        !!exp.category,
        Array.isArray(exp.subcategories) && exp.subcategories.length > 0,
        !!exp.yearsOfExperience,
        !!exp.description,
      ])
      .flat();

    score +=
      expertiseDetails.filter(Boolean).length / (expertiseDetails.length || 1);
  }
  totalFields += 1;

  // 体験サンプル
  if (
    Array.isArray(profile.experienceSamples) &&
    profile.experienceSamples.length > 0
  ) {
    score += 1;

    // 体験サンプルの詳細
    const sampleDetails = profile.experienceSamples
      .map((sample) => [
        !!sample.title,
        !!sample.description,
        !!sample.category,
        !!sample.estimatedDuration || !!sample.duration,
        !!sample.price || !!sample.pricePerPerson,
        (Array.isArray(sample.images) && sample.images.length > 0) ||
          !!sample.imageUrl,
      ])
      .flat();

    score += sampleDetails.filter(Boolean).length / (sampleDetails.length || 1);
  }
  totalFields += 1;

  // 利用可能時間
  if (
    (Array.isArray(profile.availableTimes) &&
      profile.availableTimes.length > 0) ||
    (Array.isArray(profile.availability) && profile.availability.length > 0)
  ) {
    score += 1;
  }
  totalFields += 1;

  // 移住者情報
  const migrantFields = [
    profile.isLocalResident !== undefined,
    profile.isMigrant !== undefined,
    profile.isMigrant && !!profile.yearsMoved,
    profile.isMigrant && !!profile.previousLocation,
  ];

  score += migrantFields.filter(Boolean).length / 2; // 移住者情報は重み付け半分
  totalFields += 2;

  // SNSリンク
  if (
    profile.socialMediaLinks &&
    Object.values(profile.socialMediaLinks).some(Boolean)
  ) {
    score += 0.5; // SNSリンクは重み付け半分
  }
  totalFields += 0.5;

  // 100点満点に正規化
  const normalizedScore = Math.round((score / totalFields) * 100);
  return Math.min(Math.max(normalizedScore, 0), 100); // 0〜100の範囲に収める
};

// プロフィール改善提案の生成
const generateProfileImprovementTips = (profile: AttenderProfile): string[] => {
  if (!profile) return [];

  const tips: string[] = [];

  // 基本情報
  if (!profile.bio && !profile.biography) {
    tips.push("自己紹介文を追加して、あなたの経験や魅力を伝えましょう。");
  } else if ((profile.bio || profile.biography || "").length < 100) {
    tips.push(
      "自己紹介文をより詳しく書くと、訪問者にあなたの人柄が伝わりやすくなります。"
    );
  }

  if (!profile.profilePhoto && !profile.imageUrl) {
    tips.push("プロフィール写真を追加すると、信頼性が高まります。");
  }

  // 専門分野
  if (!Array.isArray(profile.expertise) || profile.expertise.length === 0) {
    tips.push("専門分野を登録して、あなたのスキルや知識をアピールしましょう。");
  } else {
    const incompleteExpertise = profile.expertise.filter(
      (exp) =>
        !exp.description ||
        !exp.yearsOfExperience ||
        !Array.isArray(exp.subcategories) ||
        exp.subcategories.length === 0
    );

    if (incompleteExpertise.length > 0) {
      tips.push(
        "専門分野の詳細情報（経験年数、説明、サブカテゴリ）を充実させましょう。"
      );
    }
  }

  // 体験サンプル
  if (
    !Array.isArray(profile.experienceSamples) ||
    profile.experienceSamples.length === 0
  ) {
    tips.push(
      "体験サンプルを追加して、どのような体験が提供できるか具体的に示しましょう。"
    );
  } else if (profile.experienceSamples.length < 2) {
    tips.push(
      "複数の体験サンプルを登録すると、より多くの訪問者の興味を引くことができます。"
    );
  } else {
    const samplesWithoutImages = profile.experienceSamples.filter(
      (sample) =>
        (!Array.isArray(sample.images) || sample.images.length === 0) &&
        !sample.imageUrl
    );

    if (samplesWithoutImages.length > 0) {
      tips.push("体験サンプルに画像を追加すると、視覚的な魅力が高まります。");
    }
  }

  // 利用可能時間
  if (
    (!Array.isArray(profile.availableTimes) ||
      profile.availableTimes.length === 0) &&
    (!Array.isArray(profile.availability) || profile.availability.length === 0)
  ) {
    tips.push("利用可能時間を設定して、予約可能な時間帯を明確にしましょう。");
  }

  // 言語スキル
  if (!Array.isArray(profile.languages) || profile.languages.length === 0) {
    tips.push("対応可能な言語を登録して、多言語対応をアピールしましょう。");
  } else if (profile.languages.length === 1) {
    tips.push("複数の言語に対応できる場合は、すべての言語を登録しましょう。");
  }

  // SNSリンク
  if (
    !profile.socialMediaLinks ||
    Object.values(profile.socialMediaLinks).filter(Boolean).length === 0
  ) {
    tips.push(
      "SNSアカウントやウェブサイトを登録すると、あなたの活動をより詳しく知ってもらえます。"
    );
  }

  return tips;
};

// プロバイダーコンポーネント
export const AttenderProfileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<ProfileContextState>(defaultState);
  const { isAuthenticated, userProfile } = useAuth();

  // プロフィール読み込み
  const loadProfile = async (id: string): Promise<void> => {
    try {
      console.log(`アテンダープロフィールを読み込み中... ID: ${id}`);
      setState({
        ...state,
        loadingState: "loading",
        error: null,
      });

      // APIからプロフィール取得
      const response = await apiClient.get<AttenderProfile>(
        ENDPOINTS.ATTENDER.DETAIL(id)
      );

      if (response.success && response.data) {
        const profile = response.data;
        console.log("プロフィール読み込み成功:", profile.name);

        // 完成度スコアと改善提案を計算
        const completionScore = calculateProfileCompletionScore(profile);
        const improvementTips = generateProfileImprovementTips(profile);

        setState({
          profile,
          editMode: "view",
          loadingState: "succeeded",
          error: null,
          completionScore,
          improvementTips,
        });
      } else {
        console.error("プロフィール読み込みエラー:", response.error);
        setState({
          ...state,
          loadingState: "failed",
          error:
            response.error?.message || "プロフィールの読み込みに失敗しました",
        });
      }
    } catch (err) {
      console.error("プロフィール読み込み中に例外が発生:", err);
      setState({
        ...state,
        loadingState: "failed",
        error: "プロフィールの読み込み中にエラーが発生しました",
      });
    }
  };

  // プロフィール更新
  const updateProfile = (operation: ProfileUpdateOperation): void => {
    if (!state.profile) return;

    const { field, value } = operation;

    setState({
      ...state,
      profile: {
        ...state.profile,
        [field]: value,
      },
    });
  };

  // プロフィール保存
  const saveProfile = async (): Promise<boolean> => {
    if (!state.profile) return false;

    try {
      console.log("プロフィールを保存中...");
      setState({
        ...state,
        loadingState: "loading",
        error: null,
      });

      // APIに保存リクエスト
      const response = await apiClient.patch(
        ENDPOINTS.ATTENDER.UPDATE_PROFILE(state.profile.id),
        state.profile
      );

      if (response.success) {
        console.log("プロフィール保存成功");

        // 完成度スコアと改善提案を再計算
        const completionScore = calculateProfileCompletionScore(state.profile);
        const improvementTips = generateProfileImprovementTips(state.profile);

        setState({
          ...state,
          loadingState: "succeeded",
          completionScore,
          improvementTips,
        });

        return true;
      } else {
        console.error("プロフィール保存エラー:", response.error);
        setState({
          ...state,
          loadingState: "failed",
          error: response.error?.message || "プロフィールの保存に失敗しました",
        });

        return false;
      }
    } catch (err) {
      console.error("プロフィール保存中に例外が発生:", err);
      setState({
        ...state,
        loadingState: "failed",
        error: "プロフィールの保存中にエラーが発生しました",
      });

      return false;
    }
  };

  // 編集モード設定
  const setEditMode = (mode: ProfileEditMode): void => {
    setState({
      ...state,
      editMode: mode,
    });
  };

  // 自分のプロフィールを自動読み込み
  useEffect(() => {
    const loadOwnProfile = async () => {
      if (isAuthenticated && userProfile?.attenderId) {
        await loadProfile(userProfile.attenderId);
      }
    };

    loadOwnProfile();
  }, [isAuthenticated, userProfile]);

  // コンテキスト値
  const value: AttenderProfileContextType = {
    state,
    loadProfile,
    updateProfile,
    saveProfile,
    setEditMode,
    calculateCompletionScore: calculateProfileCompletionScore,
    generateImprovementTips: generateProfileImprovementTips,
  };

  return (
    <AttenderProfileContext.Provider value={value}>
      {children}
    </AttenderProfileContext.Provider>
  );
};

// カスタムフック
export const useAttenderProfile = () => useContext(AttenderProfileContext);

export default AttenderProfileContext;
