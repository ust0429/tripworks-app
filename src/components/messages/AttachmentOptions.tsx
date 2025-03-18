// src/components/messages/AttachmentOptions.tsx
import React, { useRef } from 'react';
import { Image, Map, Calendar, Paperclip, X } from 'lucide-react';
import { MessageAttachment } from '../../types';

interface AttachmentOptionsProps {
  onClose: () => void;
  onAttachmentSelect: (attachment: MessageAttachment) => void;
}

/**
 * メッセージに添付するファイルの種類を選択するコンポーネント
 */
const AttachmentOptions: React.FC<AttachmentOptionsProps> = ({ 
  onClose, 
  onAttachmentSelect 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  /**
   * 画像ファイルを選択
   */
  const handleImageSelect = () => {
    // ファイル選択ダイアログを開く
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  /**
   * ファイルが選択されたときの処理
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // 画像ファイルかどうかを判定
    const isImage = file.type.startsWith('image/');
    
    const attachment: MessageAttachment = {
      id: `att-${Date.now()}`,
      type: isImage ? 'image' : 'file',
      name: file.name,
      size: file.size,
      mimeType: file.type,
    };
    
    // 実際のアプリではここでファイルをアップロードしてURLを取得する
    // モックアプリでは擬似的なURLを生成
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        attachment.url = e.target.result as string;
        onAttachmentSelect(attachment);
      }
    };
    reader.readAsDataURL(file);
  };
  
  /**
   * 位置情報の添付を選択
   */
  const handleLocationSelect = () => {
    // 実際のアプリではGPS取得などの処理を行う
    // モックデータとして東京タワーの位置を使用
    const attachment: MessageAttachment = {
      id: `att-${Date.now()}`,
      type: 'location',
      location: {
        latitude: 35.6586,
        longitude: 139.7454,
        address: '東京都港区芝公園４丁目２−８'
      }
    };
    
    onAttachmentSelect(attachment);
  };
  
  /**
   * 日程の添付を選択
   */
  const handleDateSelect = () => {
    // 現在日時から1時間後までをデフォルトとしたイベントを作成
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    const attachment: MessageAttachment = {
      id: `att-${Date.now()}`,
      type: 'date',
      date: {
        start: now.toISOString(),
        end: oneHourLater.toISOString(),
        title: 'ミーティング'
      }
    };
    
    onAttachmentSelect(attachment);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 mb-3 border">
      <div className="flex justify-between mb-2">
        <h3 className="font-medium text-sm">添付するファイル</h3>
        <button 
          onClick={onClose}
          className="text-gray-500"
        >
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <button 
          onClick={handleImageSelect}
          className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-1">
            <Image size={20} className="text-blue-600" />
          </div>
          <span className="text-xs">画像</span>
        </button>
        
        <button 
          onClick={handleLocationSelect}
          className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
        >
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-1">
            <Map size={20} className="text-green-600" />
          </div>
          <span className="text-xs">位置情報</span>
        </button>
        
        <button 
          onClick={handleDateSelect}
          className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-1">
            <Calendar size={20} className="text-purple-600" />
          </div>
          <span className="text-xs">日程</span>
        </button>
        
        <button 
          onClick={handleImageSelect}
          className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
            <Paperclip size={20} className="text-gray-600" />
          </div>
          <span className="text-xs">ファイル</span>
        </button>
      </div>
      
      {/* 非表示のファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default AttachmentOptions;