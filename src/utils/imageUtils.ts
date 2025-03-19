// src/utils/imageUtils.ts
/**
 * 画像関連のユーティリティ関数
 */

/**
 * 画像ファイルを圧縮する
 * @param file 圧縮する画像ファイル
 * @param options 圧縮オプション
 * @returns Promise<File> 圧縮された画像ファイル
 */
export const compressImage = (
  file: File,
  options: {
    quality?: number; // 品質 (0-1)
    maxWidth?: number; // 最大横幅（ピクセル）
    maxHeight?: number; // 最大高さ（ピクセル）
    maxSize?: number; // 最大ファイルサイズ（バイト）
  } = {}
): Promise<File> => {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    maxSize = 5 * 1024 * 1024, // デフォルト5MB
  } = options;

  // ファイルがすでに十分小さい場合はそのまま返す
  if (file.size <= maxSize) {
    console.log('Image is already small enough, skipping compression');
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    // 画像読み込み
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // 圧縮比率の計算
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = maxHeight;
          width = width * ratio;
        }
        
        // Canvas を使って圧縮
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Blob として出力
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas could not create blob'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: new Date().getTime(),
            });
            
            console.log(`圧縮完了: ${file.size} → ${compressedFile.size} bytes`);
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Image loading failed'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };
  });
};

/**
 * Exif情報を削除した画像ファイルを作成する
 * @param file 元の画像ファイル
 * @returns Promise<File> Exif情報が削除された画像ファイル
 */
export const removeExifData = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context could not be created'));
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas could not create blob'));
                return;
              }
              
              const newFile = new File([blob], file.name, {
                type: file.type,
                lastModified: new Date().getTime(),
              });
              
              console.log(`EXIF 削除完了: ${file.name}`);
              resolve(newFile);
            },
            file.type,
            0.95 // 品質
          );
        };
        
        img.onerror = () => {
          reject(new Error('Image loading failed'));
        };
        
        img.src = e.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('FileReader failed'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * 画像ファイルを処理する（圧縮とEXIF削除を行う）
 * @param file 処理する画像ファイル
 * @param options 処理オプション
 * @returns Promise<File> 処理された画像ファイル
 */
export const processImage = async (
  file: File,
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    maxSize?: number;
    removeExif?: boolean;
  } = {}
): Promise<File> => {
  const { removeExif = true } = options;
  
  try {
    // まず圧縮
    let processedFile = await compressImage(file, options);
    
    // 必要に応じてEXIF削除
    if (removeExif) {
      processedFile = await removeExifData(processedFile);
    }
    
    return processedFile;
  } catch (error) {
    console.error('画像処理エラー:', error);
    // エラーが発生した場合は元のファイルを返す
    return file;
  }
};

/**
 * ファイルタイプが対応している画像形式かどうかを確認
 * @param fileType ファイルのMIMEタイプ
 * @returns boolean 対応している場合はtrue
 */
export const isSupportedImageType = (fileType: string): boolean => {
  const supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ];
  
  return supportedTypes.includes(fileType);
};

/**
 * HEICファイルをJPEGに変換する
 * @param file HEICファイル
 * @returns Promise<File> 変換されたJPEGファイル
 */
export const convertHeicToJpeg = async (file: File): Promise<File> => {
  try {
    // ここに実際のHEIC→JPEG変換コードを実装
    // 実際には heic2any などのライブラリを使用します
    // 例として疑似変換コードを使用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 実際には変換処理を行う必要があります
    console.log('HEIC → JPEG 変換をシミュレート');
    
    // 変換後のファイル名
    const newFileName = file.name.replace(/\.heic$/i, '.jpg');
    
    // 元のファイルをそのまま返す（実際の実装では変換されたファイルを返す）
    return new File([file], newFileName, {
      type: 'image/jpeg',
      lastModified: new Date().getTime(),
    });
  } catch (error) {
    console.error('HEIC変換エラー:', error);
    return file;
  }
};
