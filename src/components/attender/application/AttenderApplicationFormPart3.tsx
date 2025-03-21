import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AttenderApplicationFormData } from './AttenderApplicationFormPart1';

// AttenderApplicationFormPart3のプロパティ型定義
interface AttenderApplicationFormPart3Props {
  formData: AttenderApplicationFormData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleCheckboxChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'specialties' | 'areas' | 'languages'
  ) => void;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: 'profilePhoto' | 'photosOfWork' | 'identificationDocument'
  ) => void;
  currentStep: number;
  isSubmitting: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  AREA_OPTIONS: {
    id: string;
    name: string;
    prefecture: string;
  }[];
  LANGUAGE_OPTIONS: {
    code: string;
    name: string;
  }[];
}

// フォームのステップ2と3を表示するコンポーネント
const AttenderApplicationFormPart3: React.FC<AttenderApplicationFormPart3Props> = ({
  formData,
  handleInputChange,
  handleCheckboxChange,
  handleFileUpload,
  currentStep,
  isSubmitting,
  goToNextStep,
  goToPreviousStep,
  handleSubmit,
  AREA_OPTIONS,
  LANGUAGE_OPTIONS
}) => {
  if (currentStep === 2) {
    // ステップ2: 活動詳細
    return (
      <div>
        <h2 className="text-xl font-bold mb-6">2. 活動詳細</h2>
        
        {/* 活動エリア */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            活動エリア <span className="text-red-600">*</span> (複数選択可)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AREA_OPTIONS.map(area => (
              <label key={area.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="areas"
                  value={area.id}
                  checked={formData.areas.includes(area.id)}
                  onChange={(e) => handleCheckboxChange(e, 'areas')}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span>{area.prefecture} {area.name}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* 対応言語 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            対応言語 <span className="text-red-600">*</span> (複数選択可)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LANGUAGE_OPTIONS.map(language => (
              <label key={language.code} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="languages"
                  value={language.code}
                  checked={formData.languages.includes(language.code)}
                  onChange={(e) => handleCheckboxChange(e, 'languages')}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span>{language.name}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* 経験年数 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            経験年数
          </label>
          <select
            name="experienceYears"
            value={formData.experienceYears}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">選択してください</option>
            <option value="0-1">1年未満</option>
            <option value="1-3">1〜3年</option>
            <option value="3-5">3〜5年</option>
            <option value="5-10">5〜10年</option>
            <option value="10+">10年以上</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            このジャンルでの経験年数を選択してください。
          </p>
        </div>
        
        {/* 取得資格・認定 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            取得資格・認定
          </label>
          <textarea
            name="certifications"
            value={formData.certifications}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={3}
            placeholder="関連する資格や認定があれば記入してください"
          ></textarea>
          <p className="text-sm text-gray-500 mt-1">
            例: 調理師免許、通訳ガイド資格、救命講習修了、地域観光案内士など
          </p>
        </div>
        
        {/* 活動可能時間帯 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            主な活動可能時間帯
          </label>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="availability"
                value="weekends"
                checked={formData.availability === 'weekends'}
                onChange={handleInputChange}
                className="rounded-full border-gray-300 text-black focus:ring-black"
              />
              <span>主に週末（土日祝）</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="availability"
                value="weekdays"
                checked={formData.availability === 'weekdays'}
                onChange={handleInputChange}
                className="rounded-full border-gray-300 text-black focus:ring-black"
              />
              <span>主に平日</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="availability"
                value="anytime"
                checked={formData.availability === 'anytime'}
                onChange={handleInputChange}
                className="rounded-full border-gray-300 text-black focus:ring-black"
              />
              <span>いつでも可能</span>
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            詳細なスケジュールは後で設定できます。
          </p>
        </div>
        
        {/* 志望動機 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            アテンダーになりたい理由
          </label>
          <textarea
            name="motivationLetter"
            value={formData.motivationLetter}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={5}
            placeholder="なぜechoのアテンダーになりたいと思いましたか？"
          ></textarea>
          <p className="text-sm text-gray-500 mt-1">
            地域への思い、訪問者に提供したい体験など、あなたの熱意を教えてください。
          </p>
        </div>
        
        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={goToNextStep}
            className="bg-black text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            次へ
          </button>
        </div>
      </div>
    );
  } else if (currentStep === 3) {
    // ステップ3: 身分確認・安全対策
    return (
      <div>
        <h2 className="text-xl font-bold mb-6">3. 身分確認・安全対策</h2>
        
        {/* 携帯電話番号 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            携帯電話番号 <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="例: 090-1234-5678"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            緊急連絡用です。プライバシーは保護されます。
          </p>
        </div>
        
        {/* 緊急連絡先 */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            緊急連絡先 <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="例: 03-1234-5678"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            緊急時に連絡できる家族や友人の電話番号を入力してください。
          </p>
        </div>
        
        {/* 身分証明書 */}
        <div className="mb-8">
          <label className="block mb-2 font-medium">
            身分証明書 <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-4 border border-dashed border-gray-300 rounded-lg">
              {formData.identificationDocument ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{formData.identificationDocument.name}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round(formData.identificationDocument.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*,.pdf';
                      input.onchange = (e) => handleFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>, 'identificationDocument');
                      input.click();
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    変更
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="font-medium mb-1">身分証明書をアップロード</p>
                  <p className="text-xs text-gray-500">
                    運転免許証、パスポート、マイナンバーカードなど
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'identificationDocument')}
                  />
                </label>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            個人情報は厳重に管理し、身分確認以外の目的には使用しません。
          </p>
        </div>
        
        {/* プライバシーポリシーと利用規約の同意 */}
        <div className="mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">アテンダーとしての活動に関する重要な注意事項</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>あなたはechoを通じて独立した活動を行います。echoはその活動を補助するプラットフォームを提供するにとどまります。</li>
              <li>提供する体験内容には、参加者の安全を第一に考えた対策を講じる必要があります。</li>
              <li>適切な保険への加入や、緊急時の対応計画を準備しておくことを推奨します。</li>
              <li>アテンダーとしての行動や言動はechoの評判に直接影響するため、高い倫理観と責任感を持って活動してください。</li>
              <li>利用規約およびコミュニティガイドラインに違反した場合、アカウントが停止される可能性があります。</li>
            </ul>
          </div>
        </div>
        
        {/* 同意確認 */}
        <div className="mb-8">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="agreeTerms"
              className="mt-1 rounded border-gray-300 text-black focus:ring-black"
              required
            />
            <span className="text-sm">
              <span className="font-medium">利用規約とプライバシーポリシー</span>に同意します。また、上記の注意事項を読み、理解しました。安全かつ責任ある形で体験を提供することを誓約します。
            </span>
          </label>
        </div>
        
        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            戻る
          </button>
          <button
            type="submit"
            className="bg-black text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : 'アテンダー申請を送信'}
          </button>
        </div>
      </div>
    );
  }
  
  // デフォルトの戻り値（通常は表示されない）
  return null;
};

export default AttenderApplicationFormPart3;