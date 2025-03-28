import React from 'react';
import { CheckoutSummary as CheckoutSummaryType } from '../../types/payment';

interface CheckoutSummaryProps {
  summary: CheckoutSummaryType;
  itemName?: string;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ summary, itemName = '予約' }) => {
  // 通貨フォーマット
  const formatCurrency = (amount: number, currency: string = 'JPY') => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-bold mb-4">決済内容</h3>
      
      <div className="space-y-3">
        {/* 小計 */}
        <div className="flex justify-between">
          <span className="text-gray-700">{itemName}料金</span>
          <span className="font-medium">{formatCurrency(summary.subtotal, summary.currency)}</span>
        </div>
        
        {/* 税金 */}
        <div className="flex justify-between">
          <span className="text-gray-700">消費税（10%）</span>
          <span>{formatCurrency(summary.tax, summary.currency)}</span>
        </div>
        
        {/* サービス料 */}
        <div className="flex justify-between">
          <span className="text-gray-700">サービス料</span>
          <span>{formatCurrency(summary.serviceFee, summary.currency)}</span>
        </div>
        
        {/* 区切り線 */}
        <div className="border-t my-2"></div>
        
        {/* 合計 */}
        <div className="flex justify-between font-bold">
          <span>合計</span>
          <span>{formatCurrency(summary.total, summary.currency)}</span>
        </div>
      </div>
      
      {/* 注意書き */}
      <div className="mt-4 text-xs text-gray-500">
        <p>※ 表示価格はすべて税込です</p>
        <p>※ サービス料にはプラットフォーム利用料、決済手数料などが含まれます</p>
      </div>
    </div>
  );
};

export default CheckoutSummary;
