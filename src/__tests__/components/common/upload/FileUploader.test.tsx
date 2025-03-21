/**
 * FileUploader コンポーネントのテスト
 * 
 * ファイルアップロードコンポーネントの基本機能をテストします
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import FileUploader from '../../../../components/common/upload/FileUploader';

describe('FileUploader コンポーネント', () => {
  // テスト用のモックファイル
  const createMockFile = (name: string, size: number, mimeType: string) => {
    const file = new File(['mock file content'], name, { type: mimeType });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  // モックのコールバック関数
  const mockOnFileSelect = vi.fn().mockImplementation(async (file: File) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return `https://example.com/uploads/${file.name}`;
  });
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  // テストの後処理
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('コンポーネントが正しくレンダリングされること', () => {
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(screen.getByText(/ファイルを選択/i)).toBeInTheDocument();
    expect(screen.getByText(/ここにファイルをドロップするか、クリックして選択/i)).toBeInTheDocument();
  });

  it('カスタムのボタンテキストとプレースホルダーが表示されること', () => {
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect}
        buttonText="カスタムボタン"
        dragInactiveText="カスタムプレースホルダー"
        dragActiveText="カスタムドロップテキスト"
      />
    );

    expect(screen.getByText(/カスタムボタン/i)).toBeInTheDocument();
    expect(screen.getByText(/カスタムプレースホルダー/i)).toBeInTheDocument();
  });

  it('ファイル選択後にプレビューが表示されること', async () => {
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect}
        onSuccess={mockOnSuccess}
        showPreview={true}
      />
    );

    // モックファイルを作成
    const mockFile = createMockFile('test-image.jpg', 1 * 1024 * 1024, 'image/jpeg');

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
      
      // プレビュー画像が表示されるか確認
      await waitFor(() => {
        const previewImage = document.querySelector('img');
        expect(previewImage).toBeInTheDocument();
      });
      
      // ファイル名が表示されるか確認
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
      
      // onFileSelectが呼ばれたか確認
      expect(mockOnFileSelect).toHaveBeenCalledWith(expect.any(File));
      
      // onSuccessが呼ばれたか確認
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('https://example.com/uploads/test-image.jpg');
      });
    }
  });

  it('ファイルのドロップでアップロードが開始されること', async () => {
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect}
        onSuccess={mockOnSuccess}
      />
    );

    // モックファイルを作成
    const mockFile = createMockFile('dropped-file.jpg', 1 * 1024 * 1024, 'image/jpeg');

    // ドロップゾーンを取得
    const dropzone = document.querySelector('div[onClick]');
    expect(dropzone).not.toBeNull();
    
    if (dropzone) {
      await act(async () => {
        // ドラッグ&ドロップをシミュレート
        fireEvent.dragEnter(dropzone);
        
        // ドラッグアクティブ状態を確認
        expect(screen.getByText(/ドロップしてアップロード/i)).toBeInTheDocument();
        
        // DataTransferオブジェクトをモック
        const dataTransfer = {
          files: [mockFile],
          clearData: vi.fn()
        };
        
        // ドロップイベントを発火
        fireEvent.drop(dropzone, { dataTransfer });
      });
      
      // ファイルがアップロードされたか確認
      expect(mockOnFileSelect).toHaveBeenCalledWith(expect.any(File));
      
      // onSuccessが呼ばれたか確認
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('https://example.com/uploads/dropped-file.jpg');
      });
    }
  });

  it('ファイルサイズが制限を超えた場合にエラーが表示されること', async () => {
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect}
        onError={mockOnError}
        maxSize={2 * 1024 * 1024} // 2MB制限
      />
    );

    // 3MBのファイル（制限を超える）
    const largeFile = createMockFile('large-file.jpg', 3 * 1024 * 1024, 'image/jpeg');

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
        expect(screen.getByText(/ファイルサイズが大きすぎます/i)).toBeInTheDocument();
      });
      
      // onFileSelectが呼ばれていないことを確認
      expect(mockOnFileSelect).not.toHaveBeenCalled();
      
      // onErrorが呼ばれたか確認
      expect(mockOnError).toHaveBeenCalled();
    }
  });

  it('非対応のファイル形式の場合にエラーが表示されること', async () => {
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect}
        onError={mockOnError}
        accept="image/jpeg,image/png" // JPEGとPNGのみ許可
      />
    );

    // GIFファイル（非対応形式）
    const unsupportedFile = createMockFile('animation.gif', 1 * 1024 * 1024, 'image/gif');

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
        expect(screen.getByText(/非対応のファイル形式です/i)).toBeInTheDocument();
      });
      
      // onFileSelectが呼ばれていないことを確認
      expect(mockOnFileSelect).not.toHaveBeenCalled();
      
      // onErrorが呼ばれたか確認
      expect(mockOnError).toHaveBeenCalled();
    }
  });
  
  it('初期画像URLが渡された場合にプレビューが表示されること', () => {
    const initialImageUrl = 'https://example.com/initial-image.jpg';
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect}
        showPreview={true}
        initialImageUrl={initialImageUrl}
      />
    );
    
    // プレビュー画像が表示されているか確認
    const previewImage = document.querySelector('img');
    expect(previewImage).toBeInTheDocument();
    expect(previewImage?.src).toContain(initialImageUrl);
  });
  
  it('ファイル選択ボタンをクリックするとファイル選択ダイアログが開くこと', async () => {
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect}
      />
    );
    
    // input[type="file"]のクリックイベントをモック
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    
    if (fileInput) {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
      
      // 「ファイルを選択」ボタンをクリック
      await act(async () => {
        userEvent.click(screen.getByText(/ファイルを選択/i));
      });
      
      // input[type="file"]のclickメソッドが呼ばれたか確認
      expect(clickSpy).toHaveBeenCalled();
      
      clickSpy.mockRestore();
    }
  });
  
  it('アップロード後にファイルを削除できること', async () => {
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect}
        onSuccess={mockOnSuccess}
        showPreview={true}
      />
    );
    
    // ファイルをアップロード
    const mockFile = createMockFile('test-image.jpg', 1 * 1024 * 1024, 'image/jpeg');
    const fileInput = document.querySelector('input[type="file"]');
    
    if (fileInput) {
      await act(async () => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        Object.defineProperty(fileInput, 'files', { value: dataTransfer.files });
        fireEvent.change(fileInput);
      });
      
      // アップロード完了後の削除ボタンを検索
      await waitFor(() => {
        expect(screen.getByText(/削除/i)).toBeInTheDocument();
      });
      
      // 削除ボタンをクリック
      await act(async () => {
        userEvent.click(screen.getByText(/削除/i));
      });
      
      // プレビューが削除されたことを確認
      expect(document.querySelector('img')).not.toBeInTheDocument();
      
      // ファイル名が表示されていないことを確認
      expect(screen.queryByText('test-image.jpg')).not.toBeInTheDocument();
    }
  });
  
  it('アップロード中にエラーが発生した場合、エラーが表示されること', async () => {
    // onFileSelectがエラーをスローするようにモック
    const mockErrorFileSelect = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('アップロード中にエラーが発生しました');
    });
    
    render(
      <FileUploader 
        onFileSelect={mockErrorFileSelect}
        onError={mockOnError}
      />
    );
    
    // ファイルをアップロード
    const mockFile = createMockFile('error-test.jpg', 1 * 1024 * 1024, 'image/jpeg');
    const fileInput = document.querySelector('input[type="file"]');
    
    if (fileInput) {
      await act(async () => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        Object.defineProperty(fileInput, 'files', { value: dataTransfer.files });
        fireEvent.change(fileInput);
      });
      
      // エラーメッセージが表示されるか確認
      await waitFor(() => {
        expect(screen.getByText(/アップロード中にエラーが発生しました/i)).toBeInTheDocument();
      });
      
      // onErrorが呼ばれたか確認
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    }
  });
});
