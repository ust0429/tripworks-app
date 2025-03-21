/**
 * IdentificationUploader コンポーネントのテスト
 * 
 * 身分証明書アップロードコンポーネントの機能をテストします
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import IdentificationUploader from '../../../../components/attender/application/IdentificationUploader';
import { AttenderApplicationProvider } from '../../../../contexts/AttenderApplicationContext';
import { uploadIdentificationDocument } from '../../../../services/upload/FileUploadService';

// FileUploadService のモック
vi.mock('../../../../services/upload/FileUploadService', () => ({
  uploadIdentificationDocument: vi.fn()
}));

describe('IdentificationUploader コンポーネント', () => {
  // テスト用のモックファイル
  const createMockFile = (name: string, size: number, mimeType: string) => {
    const file = new File(['mock file content'], name, { type: mimeType });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  // テストの前処理
  beforeEach(() => {
    // uploadIdentificationDocument 関数のモック実装
    (uploadIdentificationDocument as any).mockImplementation(async (file: File) => {
      // モックの処理遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 100));
      return `https://example.com/uploads/${file.name}`;
    });
  });

  // テストの後処理
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('コンポーネントが正しくレンダリングされること', () => {
    render(
      <AttenderApplicationProvider>
        <IdentificationUploader 
          documentType="passport"
          side="front"
        />
      </AttenderApplicationProvider>
    );

    expect(screen.getByText(/パスポート/)).toBeInTheDocument();
    expect(screen.getByText(/表面/)).toBeInTheDocument();
    expect(screen.getByText(/JPG、PNG、GIF形式の画像またはPDF形式の書類/)).toBeInTheDocument();
  });

  it('初期画像URLが渡された場合にプレビューが表示されること', () => {
    const initialImageUrl = 'https://example.com/initial-image.jpg';

    render(
      <AttenderApplicationProvider>
        <IdentificationUploader 
          documentType="passport"
          side="front"
          initialImageUrl={initialImageUrl}
        />
      </AttenderApplicationProvider>
    );

    // プレビュー画像が表示されているか確認
    // 注: FileUploaderのプレビュー表示方法によって、このテストの実装が変わることがある
    const previewImage = document.querySelector('img');
    expect(previewImage).toBeInTheDocument();
    expect(previewImage?.getAttribute('src')).toBe(initialImageUrl);
  });

  it('ファイルアップロードが正常に行われること', async () => {
    // コンポーネントをレンダリング
    render(
      <AttenderApplicationProvider>
        <IdentificationUploader 
          documentType="driver_license"
          side="front"
        />
      </AttenderApplicationProvider>
    );

    // モックファイルを作成
    const mockFile = createMockFile('license.jpg', 2 * 1024 * 1024, 'image/jpeg');

    // input要素にファイルをセット
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    
    if (fileInput) {
      await act(async () => {
        // FileListオブジェクトをモック
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        
        // inputの値を設定
        Object.defineProperty(fileInput, 'files', {
          writable: true,
          value: dataTransfer.files
        });
        
        // changeイベントを発火
        fireEvent.change(fileInput);
      });
      
      // アップロード中のメッセージが表示されるか
      expect(screen.getByText(/アップロード中/)).toBeInTheDocument();
      
      // アップロード関数が呼ばれたか確認
      expect(uploadIdentificationDocument).toHaveBeenCalledWith(
        expect.any(File),
        'driver_license'
      );
      
      // アップロード完了後の処理を確認
      await waitFor(() => {
        expect(screen.queryByText(/アップロード中/)).not.toBeInTheDocument();
      });
    }
  });

  it('大きすぎるファイルに対してエラーが表示されること', async () => {
    // コンポーネントをレンダリング
    render(
      <AttenderApplicationProvider>
        <IdentificationUploader 
          documentType="id_card"
          side="front"
        />
      </AttenderApplicationProvider>
    );

    // 大きいモックファイルを作成 (6MB)
    const largeFile = createMockFile('large-id.jpg', 6 * 1024 * 1024, 'image/jpeg');

    // input要素にファイルをセット
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    
    if (fileInput) {
      await act(async () => {
        // FileListオブジェクトをモック
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(largeFile);
        
        // inputの値を設定
        Object.defineProperty(fileInput, 'files', {
          writable: true,
          value: dataTransfer.files
        });
        
        // changeイベントを発火
        fireEvent.change(fileInput);
      });
      
      // エラーメッセージが表示されるか確認
      await waitFor(() => {
        expect(screen.getByText(/ファイルサイズが大きすぎます/)).toBeInTheDocument();
      });
      
      // アップロード関数が呼ばれていないことを確認
      expect(uploadIdentificationDocument).not.toHaveBeenCalled();
    }
  });

  it('非対応のファイル形式に対してエラーが表示されること', async () => {
    // コンポーネントをレンダリング
    render(
      <AttenderApplicationProvider>
        <IdentificationUploader 
          documentType="residence_card"
          side="front"
        />
      </AttenderApplicationProvider>
    );

    // 非対応のファイル形式
    const unsupportedFile = createMockFile('document.exe', 1 * 1024 * 1024, 'application/octet-stream');

    // input要素にファイルをセット
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    
    if (fileInput) {
      await act(async () => {
        // FileListオブジェクトをモック
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(unsupportedFile);
        
        // inputの値を設定
        Object.defineProperty(fileInput, 'files', {
          writable: true,
          value: dataTransfer.files
        });
        
        // changeイベントを発火
        fireEvent.change(fileInput);
      });
      
      // エラーメッセージが表示されるか確認
      await waitFor(() => {
        expect(screen.getByText(/非対応のファイル形式です/)).toBeInTheDocument();
      });
      
      // アップロード関数が呼ばれていないことを確認
      expect(uploadIdentificationDocument).not.toHaveBeenCalled();
    }
  });
  
  it('アップロード中にエラーが発生した場合エラーが表示されること', async () => {
    // エラーをスローするようにモックを書き換え
    (uploadIdentificationDocument as any).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('アップロードに失敗しました');
    });
    
    // コンポーネントをレンダリング
    render(
      <AttenderApplicationProvider>
        <IdentificationUploader 
          documentType="passport"
          side="back"
        />
      </AttenderApplicationProvider>
    );

    // モックファイルを作成
    const mockFile = createMockFile('passport-back.jpg', 1 * 1024 * 1024, 'image/jpeg');

    // input要素にファイルをセット
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    
    if (fileInput) {
      await act(async () => {
        // FileListオブジェクトをモック
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        
        // inputの値を設定
        Object.defineProperty(fileInput, 'files', {
          writable: true,
          value: dataTransfer.files
        });
        
        // changeイベントを発火
        fireEvent.change(fileInput);
      });
      
      // アップロード中のメッセージが表示されるか
      expect(screen.getByText(/アップロード中/)).toBeInTheDocument();
      
      // エラーメッセージが表示されるか確認
      await waitFor(() => {
        expect(screen.getByText(/アップロードに失敗しました/)).toBeInTheDocument();
      });
    }
  });
});
