// src/components/messages/AttachmentPreview.tsx
import React from 'react';
import { FileText, Image, Calendar, MapPin } from 'lucide-react';
import { MessageAttachment } from '../../types';
import LocationMessageContent from './LocationMessageContent';

interface AttachmentPreviewProps {
  attachment: MessageAttachment;
  isOwn?: boolean;
}

/**
 * メッセージの添付ファイルをプレビュー表示するコンポーネント
 */
const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment, isOwn }) => {
  // ファイルサイズのフォーマット
  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined) return '';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  switch (attachment.type) {
    case 'image':
      return (
        <div className="mt-2 rounded-lg overflow-hidden">
          {attachment.url ? (
            <img 
              src={attachment.url} 
              alt={attachment.name || "添付画像"} 
              className="max-w-full max-h-48 object-contain"
            />
          ) : (
            <div className="bg-gray-200 h-32 flex items-center justify-center">
              <Image size={24} className="text-gray-400" />
            </div>
          )}
        </div>
      );
      
    case 'file':
      return (
        <div className="mt-2 bg-gray-100 rounded-lg p-3 flex items-center">
          <div className="bg-white rounded-lg p-2 mr-3">
            <FileText size={24} className="text-gray-500" />
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm truncate">{attachment.name || "ファイル"}</p>
            <p className="text-xs text-gray-500">
              {attachment.mimeType && <span className="mr-2">{attachment.mimeType}</span>}
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>
      );
      
    case 'location':
      return <LocationMessageContent attachment={attachment} isOwn={isOwn} />;
      
    case 'date':
      if (!attachment.date) return null;
      
      const startDate = new Date(attachment.date.start);
      const endDate = attachment.date.end ? new Date(attachment.date.end) : null;
      
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      
      return (
        <div className="mt-2 bg-blue-50 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Calendar size={18} className="text-blue-500 mr-2" />
            <span className="font-medium">{attachment.date.title || "イベント"}</span>
          </div>
          <div className="text-sm">
            <p>{formatDate(startDate)}</p>
            {endDate && (
              <div className="flex items-center mt-1">
                <span className="text-gray-500 mr-2">〜</span>
                <p>{formatDate(endDate)}</p>
              </div>
            )}
          </div>
        </div>
      );
      
    default:
      return null;
  }
};

export default AttachmentPreview;