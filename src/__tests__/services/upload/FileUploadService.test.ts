import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { 
  uploadImage, 
  uploadDocument, 
  uploadIdentificationDocument,
  uploadExperienceImage,
  uploadProfileImage
} from '../../../services/upload/FileUploadService';
import api from '../../../utils/apiClient';
import { processImage, convertHeicToJpeg } from '../../../utils/imageUtils';

// モック
jest.mock('../../../utils/apiClient', () => ({
  uploadFile: jest.fn(),
  post: jest.fn()
}));

jest.mock('../../../utils/imageUtils', () => ({
  processImage: jest.fn(),
  isSupportedImageType: jest.fn().mockReturnValue(true),
  convertHeicToJpeg: jest.fn()
}));

jest.mock('../../../config/env', () => ({
  isDevelopment: jest.fn().mockReturnValue(false)
}));

describe('FileUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should process and upload an image', async () => {
      // モックの設定
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockProcessedFile = new File(['processed'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { success: true, data: { url: 'https://example.com/test.jpg' } };
      
      (processImage as jest.Mock).mockResolvedValue(mockProcessedFile);
      (api.uploadFile as jest.Mock).mockResolvedValue(mockResponse);
      
      // プログレスコールバック
      const mockProgressCallback = jest.fn();
      
      // 関数の実行
      const result = await uploadImage(mockFile, 'image', mockProgressCallback);
      
      // 検証
      expect(processImage).toHaveBeenCalledWith(mockFile, expect.any(Object));
      expect(api.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        mockProcessedFile,
        'file',
        undefined
      );
      expect(result).toBe('https://example.com/test.jpg');
      
      // プログレスコールバックが正しく呼ばれたかチェック
      expect(mockProgressCallback).toHaveBeenCalledWith(expect.objectContaining({
        status: 'processing',
        progress: 0,
        file: mockFile
      }));
      
      expect(mockProgressCallback).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        progress: 100,
        file: mockProcessedFile,
        url: 'https://example.com/test.jpg'
      }));
    });

    it('should handle HEIC conversion', async () => {
      // モックの設定
      const mockFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      const mockConvertedFile = new File(['converted'], 'test.jpg', { type: 'image/jpeg' });
      const mockProcessedFile = new File(['processed'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { success: true, data: { url: 'https://example.com/test.jpg' } };
      
      (convertHeicToJpeg as jest.Mock).mockResolvedValue(mockConvertedFile);
      (processImage as jest.Mock).mockResolvedValue(mockProcessedFile);
      (api.uploadFile as jest.Mock).mockResolvedValue(mockResponse);
      
      // 関数の実行
      const result = await uploadImage(mockFile);
      
      // 検証
      expect(convertHeicToJpeg).toHaveBeenCalledWith(mockFile);
      expect(processImage).toHaveBeenCalledWith(mockConvertedFile, expect.any(Object));
      expect(api.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        mockProcessedFile,
        'file',
        undefined
      );
      expect(result).toBe('https://example.com/test.jpg');
    });

    it('should handle upload failure', async () => {
      // モックの設定
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockProcessedFile = new File(['processed'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { 
        success: false, 
        error: { message: 'Upload failed', code: '500' } 
      };
      
      (processImage as jest.Mock).mockResolvedValue(mockProcessedFile);
      (api.uploadFile as jest.Mock).mockResolvedValue(mockResponse);
      
      const mockProgressCallback = jest.fn();
      
      // 関数の実行と例外のキャッチ
      await expect(uploadImage(mockFile, 'image', mockProgressCallback)).rejects.toThrow('Upload failed');
      
      // プログレスコールバックが正しく呼ばれたかチェック
      expect(mockProgressCallback).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        progress: 0,
        file: expect.any(File),
        error: 'Upload failed'
      }));
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document file', async () => {
      // モックの設定
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = { success: true, data: { url: 'https://example.com/test.pdf' } };
      
      (api.uploadFile as jest.Mock).mockResolvedValue(mockResponse);
      
      // 関数の実行
      const result = await uploadDocument(mockFile);
      
      // 検証
      expect(api.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        mockFile,
        'document',
        undefined
      );
      expect(result).toBe('https://example.com/test.pdf');
    });
  });

  describe('uploadIdentificationDocument', () => {
    it('should upload an identification document with correct meta data', async () => {
      // モックの設定
      const mockFile = new File(['test'], 'id.jpg', { type: 'image/jpeg' });
      const mockProcessedFile = new File(['processed'], 'id.jpg', { type: 'image/jpeg' });
      const mockResponse = { success: true, data: { url: 'https://example.com/id.jpg' } };
      
      (processImage as jest.Mock).mockResolvedValue(mockProcessedFile);
      (api.uploadFile as jest.Mock).mockResolvedValue(mockResponse);
      
      // 関数の実行
      const result = await uploadIdentificationDocument(mockFile, 'passport');
      
      // 検証
      expect(api.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        mockProcessedFile,
        'file',
        {
          documentType: 'passport',
          purpose: 'identity_verification'
        }
      );
      expect(result).toBe('https://example.com/id.jpg');
    });
  });

  describe('uploadExperienceImage', () => {
    it('should upload an experience image with correct meta data', async () => {
      // モックの設定
      const mockFile = new File(['test'], 'exp.jpg', { type: 'image/jpeg' });
      const mockProcessedFile = new File(['processed'], 'exp.jpg', { type: 'image/jpeg' });
      const mockResponse = { success: true, data: { url: 'https://example.com/exp.jpg' } };
      
      (processImage as jest.Mock).mockResolvedValue(mockProcessedFile);
      (api.uploadFile as jest.Mock).mockResolvedValue(mockResponse);
      
      // 関数の実行
      const result = await uploadExperienceImage(mockFile, 'テスト体験');
      
      // 検証
      expect(api.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        mockProcessedFile,
        'file',
        {
          experienceTitle: 'テスト体験',
          caption: '体験「テスト体験」のサンプル画像'
        }
      );
      expect(result).toBe('https://example.com/exp.jpg');
    });
  });
});
