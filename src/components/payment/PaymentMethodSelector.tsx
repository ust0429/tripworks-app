import React, { useState } from 'react';
import { CreditCard, Plus, Check, Trash2, Landmark } from 'lucide-react';
import { PaymentMethod } from '../../types/payment';
import { usePayment } from '../../contexts/PaymentContext';
import { getCardBrandLogo, getCardBrandName } from '../../services/payment/StripeService';

interface PaymentMethodSelectorProps {
  onSelect: (paymentMethodId: string) => void;
  onAddNew: () => void;
  selectedId?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
  onAddNew,
  selectedId
}) => {
  const { paymentMethods, updateDefaultPaymentMethod, removePaymentMethod, isLoading } = usePayment();
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  
  // 支払い方法の選択
  const handleSelect = (paymentMethodId: string) => {
    onSelect(paymentMethodId);
  };
  
  // デフォルト支払い方法の設定
  const handleSetDefault = async (paymentMethodId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await updateDefaultPaymentMethod(paymentMethodId);
  };
  
  // 支払い方法の削除確認ダイアログの表示
  const handleShowDeleteConfirm = (paymentMethodId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowConfirmDelete(paymentMethodId);
  };
  
  // 支払い方法の削除キャンセル
  const handleCancelDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowConfirmDelete(null);
  };
  
  // 支払い方法の削除実行
  const handleConfirmDelete = async (paymentMethodId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await removePaymentMethod(paymentMethodId);
    setShowConfirmDelete(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-bold p-4 border-b">支払い方法</h3>
      
      <div className="divide-y">
        {/* 保存された支払い方法 */}
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => handleSelect(method.id)}
            className={`p-4 hover:bg-gray-50 cursor-pointer ${
              selectedId === method.id ? 'bg-gray-50' : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {/* 支払い方法アイコン */}
                {method.type === 'card' ? (
                  <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center">
                    {method.details.brand ? (
                      <img
                        src={getCardBrandLogo(method.details.brand)}
                        alt={getCardBrandName(method.details.brand)}
                        className="h-5"
                      />
                    ) : (
                      <CreditCard size={20} className="text-gray-500" />
                    )}
                  </div>
                ) : method.type === 'bank_account' ? (
                  <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <Landmark size={20} className="text-gray-500" />
                  </div>
                ) : (
                  <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard size={20} className="text-gray-500" />
                  </div>
                )}
                
                {/* 支払い方法詳細 */}
                <div>
                  {method.type === 'card' && (
                    <>
                      <p className="font-medium">
                        {getCardBrandName(method.details.brand || 'unknown')}
                        <span className="ml-1">**** {method.details.last4}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        有効期限: {method.details.expMonth}/{method.details.expYear}
                      </p>
                    </>
                  )}
                  
                  {method.type === 'bank_account' && (
                    <>
                      <p className="font-medium">{method.details.bankName}</p>
                      <p className="text-xs text-gray-500">
                        口座: **** {method.details.last4}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {/* 選択状態とアクション */}
              <div className="flex items-center space-x-2">
                {/* 削除確認ダイアログ */}
                {showConfirmDelete === method.id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleConfirmDelete(method.id, e)}
                      className="text-red-600 text-xs font-medium p-1 hover:bg-red-50 rounded"
                      disabled={isLoading}
                    >
                      削除する
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="text-gray-600 text-xs font-medium p-1 hover:bg-gray-100 rounded"
                      disabled={isLoading}
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <>
                    {/* デフォルト設定ボタン */}
                    {!method.isDefault && (
                      <button
                        onClick={(e) => handleSetDefault(method.id, e)}
                        className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
                        title="デフォルトに設定"
                        disabled={isLoading}
                      >
                        <Check size={16} />
                      </button>
                    )}
                    
                    {/* 削除ボタン */}
                    <button
                      onClick={(e) => handleShowDeleteConfirm(method.id, e)}
                      className="text-gray-500 hover:text-red-500 p-1 hover:bg-gray-100 rounded"
                      title="削除"
                      disabled={isLoading}
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    {/* 選択状態 */}
                    {selectedId === method.id && (
                      <div className="ml-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center">
                        <Check size={14} />
                      </div>
                    )}
                    
                    {/* デフォルトバッジ */}
                    {method.isDefault && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded-full">
                        デフォルト
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* 新しい支払い方法を追加 */}
        <div
          onClick={onAddNew}
          className="p-4 hover:bg-gray-50 cursor-pointer flex items-center text-gray-700"
        >
          <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
            <Plus size={20} className="text-gray-500" />
          </div>
          <span>新しい支払い方法を追加</span>
        </div>
      </div>
      
      {/* 支払い方法がない場合 */}
      {paymentMethods.length === 0 && (
        <div className="p-4 text-gray-500 text-center">
          <p className="mb-2">保存された支払い方法はありません</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
