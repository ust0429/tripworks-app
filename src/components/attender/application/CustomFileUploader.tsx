import React from 'react';
import { FileUploader as BaseFileUploader } from '../../common/upload/FileUploader';

// 拡張プロパティを持つFileUploaderコンポーネント
interface ExtendedFileUploaderProps {
  onFileSelect?: (file: File) => Promise<string>;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  accept?: string;
  maxSize?: number;
  id?: string;
  className?: string;
  buttonText?: string;
  dragActiveText?: string;
  dragInactiveText?: string;
  placeholder?: string;
  showPreview?: boolean;
  previewAsBackground?: boolean;
  multiple?: boolean;
  initialImageUrl?: string;
  onFileSelected?: (file: File) => Promise<void>;
  disabled?: boolean;
  children?: React.ReactNode;
  
  // 追加のプロパティ
  previewHeight?: number;
}

/**
 * 拡張されたファイルアップローダーコンポーネント
 * アテンダー申請用に機能を拡張
 */
const FileUploader: React.FC<ExtendedFileUploaderProps> = ({
  previewHeight,
  ...props
}) => {
  // previewHeightを使用する代わりに、クラスベースで高さを制御
  const getClassName = () => {
    let baseClass = props.className || '';
    if (previewHeight) {
      // tailwindのクラスを使用
      baseClass += ` max-h-[${previewHeight}px]`;
    }
    return baseClass;
  };

  return (
    <BaseFileUploader
      {...props}
      className={getClassName()}
    />
  );
};

export default FileUploader;
