/**
 * 同意事項ステップ
 * 
 * アテンダー申請フォームの最終ステップで、各種同意事項を確認するコンポーネント
 */
import React from 'react';
import { useAttenderApplication } from '../../../../contexts/AttenderApplicationContext';

interface AgreementsStepProps {
  onNext: () => void;
  onBack: () => void;
}

const AgreementsStep: React.FC<AgreementsStepProps> = ({ onNext, onBack }) => {
  const { formData, updateFormData, errors, clearError } = useAttenderApplication();
  
  // 初期化
  const agreements = formData.agreements || {
    termsOfService: false,
    privacyPolicy: false,
    codeOfConduct: false,
    backgroundCheck: false
  };
  
  // 同意状態の変更ハンドラ
  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    updateFormData({
      agreements: {
        ...agreements,
        [name]: checked
      }
    });
    
    clearError(`agreements.${name}`);
  };
  
  // 全ての同意ボックスが選択されているか
  const allAgreed = 
    agreements.termsOfService && 
    agreements.privacyPolicy && 
    agreements.codeOfConduct && 
    agreements.backgroundCheck;
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">同意事項</h2>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-sm text-gray-500 mb-6">
          アテンダーとして活動するには、以下の各条項に同意していただく必要があります。各項目をよく読み、同意いただける場合はチェックボックスにチェックを入れてください。
        </p>
        
        <div className="space-y-6">
          {/* 利用規約 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">利用規約</h3>
            <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-y-auto text-sm text-gray-700">
              <p className="mb-3">
                echo（以下「当社」という）が提供するアテンダーサービス（以下「本サービス」という）をご利用いただくにあたり、以下の利用規約（以下「本規約」という）に同意いただく必要があります。
              </p>
              <h4 className="font-semibold mb-1">1. サービス概要</h4>
              <p className="mb-3">
                本サービスは、ユーザー（以下「ゲスト」という）に対して現地の文化・体験を提供するアテンダー（以下「アテンダー」という）とのマッチングを行うプラットフォームを提供します。
              </p>
              <h4 className="font-semibold mb-1">2. アテンダーの責務</h4>
              <p className="mb-3">
                アテンダーは、本サービスを通じて提供する体験や情報の正確性、安全性について責任を持つものとします。また、法律や公序良俗に反する行為、ゲストの安全を脅かす行為を行わないことを約束するものとします。
              </p>
              <h4 className="font-semibold mb-1">3. 報酬と手数料</h4>
              <p className="mb-3">
                アテンダーが受け取る報酬からは、当社が定める手数料が差し引かれます。具体的な手数料率および計算方法は別途定めるものとします。
              </p>
              <h4 className="font-semibold mb-1">4. 登録解除・サービス停止</h4>
              <p className="mb-3">
                当社は、アテンダーが本規約に違反した場合、または本サービスの信頼性を損なう行為を行った場合には、事前の通知なく登録を解除またはサービスの利用を停止することがあります。
              </p>
              <h4 className="font-semibold mb-1">5. 免責事項</h4>
              <p>
                当社は、本サービスの利用によりアテンダーに生じたいかなる損害についても責任を負わないものとします。ただし、当社の故意または重大な過失による場合はこの限りではありません。
              </p>
            </div>
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  id="termsOfService"
                  name="termsOfService"
                  type="checkbox"
                  checked={agreements.termsOfService}
                  onChange={handleAgreementChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="termsOfService" className="font-medium text-gray-700">
                  利用規約に同意します <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
            {errors['agreements.termsOfService'] && (
              <p className="text-sm text-red-500">{errors['agreements.termsOfService']}</p>
            )}
          </div>
          
          {/* プライバシーポリシー */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">プライバシーポリシー</h3>
            <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-y-auto text-sm text-gray-700">
              <p className="mb-3">
                当社は、アテンダーの個人情報を適切に取り扱い、保護することを約束します。本プライバシーポリシーでは、当社がどのように個人情報を収集、利用、共有するかについて説明します。
              </p>
              <h4 className="font-semibold mb-1">1. 収集する情報</h4>
              <p className="mb-3">
                当社は、アテンダー登録時に氏名、連絡先、住所、身分証明書情報、銀行口座情報などの個人情報を収集します。また、本サービスの利用状況や提供した体験に関する情報も収集します。
              </p>
              <h4 className="font-semibold mb-1">2. 利用目的</h4>
              <p className="mb-3">
                収集した個人情報は、本サービスの提供・運営、アテンダーとゲストのマッチング、報酬の支払い、本人確認、不正利用の防止、サービス改善などの目的で利用します。
              </p>
              <h4 className="font-semibold mb-1">3. 第三者への提供</h4>
              <p className="mb-3">
                当社は、法令に基づく場合や、人の生命・身体・財産の保護のために必要がある場合を除き、アテンダーの同意なく個人情報を第三者に提供することはありません。ただし、マッチングしたゲストには、サービス提供に必要な範囲で情報を提供します。
              </p>
              <h4 className="font-semibold mb-1">4. 個人情報の管理</h4>
              <p>
                当社は、個人情報の漏洩、滅失、毀損を防止するため、適切なセキュリティ対策を講じています。また、個人情報の取り扱いを委託する場合は、委託先に対して適切な監督を行います。
              </p>
            </div>
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  id="privacyPolicy"
                  name="privacyPolicy"
                  type="checkbox"
                  checked={agreements.privacyPolicy}
                  onChange={handleAgreementChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="privacyPolicy" className="font-medium text-gray-700">
                  プライバシーポリシーに同意します <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
            {errors['agreements.privacyPolicy'] && (
              <p className="text-sm text-red-500">{errors['agreements.privacyPolicy']}</p>
            )}
          </div>
          
          {/* 行動規範 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">行動規範</h3>
            <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-y-auto text-sm text-gray-700">
              <p className="mb-3">
                echoは、ゲストとアテンダーが安心して利用できる環境を提供するため、すべてのアテンダーに以下の行動規範の遵守を求めます。
              </p>
              <h4 className="font-semibold mb-1">1. 安全性の確保</h4>
              <p className="mb-3">
                常にゲストの安全を最優先に考え、危険を伴う活動を行う場合は事前に適切な説明と対策を行います。また、提供する体験に必要な資格や許可を取得していることを確認します。
              </p>
              <h4 className="font-semibold mb-1">2. 誠実なコミュニケーション</h4>
              <p className="mb-3">
                提供可能な体験内容や専門知識について正確な情報を提供し、誇張や虚偽の説明を行いません。また、ゲストからの質問や要望には迅速かつ丁寧に対応します。
              </p>
              <h4 className="font-semibold mb-1">3. 差別・ハラスメントの禁止</h4>
              <p className="mb-3">
                人種、国籍、宗教、性別、性的指向、年齢、障害などを理由とする差別的言動や、セクシャルハラスメント、パワーハラスメントなどのハラスメント行為を行いません。
              </p>
              <h4 className="font-semibold mb-1">4. プライバシーの尊重</h4>
              <p className="mb-3">
                ゲストの個人情報やプライバシーを尊重し、許可なく写真や動画を撮影・公開しません。また、ゲストから知り得た秘密情報を第三者に漏らしません。
              </p>
              <h4 className="font-semibold mb-1">5. 法令遵守</h4>
              <p>
                すべての活動において、関連する法令や規制を遵守します。違法な行為や公序良俗に反する行為を行わず、またそのような行為をゲストに勧めません。
              </p>
            </div>
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  id="codeOfConduct"
                  name="codeOfConduct"
                  type="checkbox"
                  checked={agreements.codeOfConduct}
                  onChange={handleAgreementChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="codeOfConduct" className="font-medium text-gray-700">
                  行動規範に同意します <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
            {errors['agreements.codeOfConduct'] && (
              <p className="text-sm text-red-500">{errors['agreements.codeOfConduct']}</p>
            )}
          </div>
          
          {/* バックグラウンドチェック */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">バックグラウンドチェックの同意</h3>
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
              <p className="mb-3">
                当社は、ゲストの安全を確保するため、アテンダーに対してバックグラウンドチェックを実施しています。このチェックには、身分証明書の確認、犯罪歴の確認、公開情報の調査などが含まれます。
              </p>
              <p>
                バックグラウンドチェックに同意することで、当社または当社が指定する第三者機関があなたの個人情報を照会し、確認することを承諾したことになります。また、追加の情報提供を求められた場合は、速やかに対応することに同意したことになります。
              </p>
            </div>
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  id="backgroundCheck"
                  name="backgroundCheck"
                  type="checkbox"
                  checked={agreements.backgroundCheck}
                  onChange={handleAgreementChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="backgroundCheck" className="font-medium text-gray-700">
                  バックグラウンドチェックに同意します <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
            {errors['agreements.backgroundCheck'] && (
              <p className="text-sm text-red-500">{errors['agreements.backgroundCheck']}</p>
            )}
          </div>
        </div>
        
        {/* 全体のエラーメッセージ */}
        {errors.agreements && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.agreements}
          </div>
        )}
        
        {/* 同意ステータス */}
        <div className={`mt-8 p-4 rounded-md ${allAgreed ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {allAgreed ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                {allAgreed ? '全ての同意事項に同意しました' : '全ての同意事項に同意が必要です'}
              </h3>
              <div className="mt-2 text-sm">
                <p>
                  {allAgreed 
                    ? '申請を完了するために「申請する」ボタンをクリックしてください。' 
                    : '申請を進めるためには、すべての同意事項にチェックを入れる必要があります。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementsStep;
