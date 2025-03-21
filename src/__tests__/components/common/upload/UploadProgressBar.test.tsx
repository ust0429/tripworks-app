/**
 * UploadProgressBar コンポーネントのテスト
 * 
 * アップロード進捗バーコンポーネントの機能をテストします
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';

import UploadProgressBar from '../../../../components/common/upload/UploadProgressBar';
import { UploadProgress, UploadStatus } from '../../../../services/upload/FileUploadService';

describe('UploadProgressBar コンポーネント', () => {
  // テスト用のモックファイル
  const createMockFile = (name: string, size: number, mimeType: string) => {
    const file = new File(['mock file content'], name, { type: mimeType });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  // テスト用の進捗状態を作成
  const createProgress = (status: UploadStatus, progress: number, file?: File, url?: string, error?: string): UploadProgress => ({
    status,
    progress,
    file,
    url,
    error
  });

  it('アップロード中の進捗バーが表示されること', () => {
    const mockFile = createMockFile('uploading.jpg', 1 * 1024 * 1024, 'image/jpeg');
    const progress = createProgress('uploading', 45, mockFile);
    const mockOnDismiss = vi.fn();

    render(
      <UploadProgressBar
        progress={progress}
        onDismiss={mockOnDismiss}
      />
    );

    // 進捗バーが表示されているか確認
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    
    // 進捗値が正しく表示されているか確認
    expect(progressElement.getAttribute('aria-valuenow')).toBe('45');
    
    // ファイル名が表示されているか確認
    expect(screen.getByText('uploading.jpg')).toBeInTheDocument();
    
    // アップロード中のステータステキストが表示されているか確認
    expect(screen.getByText(/アップロード中/i)).toBeInTheDocument();
  });

  it('処理中の進捗バーが表示されること', () => {
    const mockFile = createMockFile('processing.jpg', 1 * 1024 * 1024, 'image/jpeg');
    const progress = createProgress('processing', 20, mockFile);
    const mockOnDismiss = vi.fn();

    render(
      <UploadProgressBar
        progress={progress}
        onDismiss={mockOnDismiss}
      />
    );

    // 進捗バーが表示されているか確認
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    
    // 進捗値が正しく表示されているか確認
    expect(progressElement.getAttribute('aria-valuenow')).toBe('20');
    
    // 処理中のステータステキストが表示されているか確認
    expect(screen.getByText(/処理中/i)).toBeInTheDocument();
  });

  it('アップロード成功時の表示が正しいこと', () => {
    const mockFile = createMockFile('success.jpg', 1 * 1024 * 1024, 'image/jpeg');
    const progress = createProgress('success', 100, mockFile, 'https://example.com/uploads/success.jpg');
    const mockOnDismiss = vi.fn();

    render(
      <UploadProgressBar
        progress={progress}
        onDismiss={mockOnDismiss}
      />
    );

    // 進捗バーが100%になっているか確認
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    expect(progressElement.getAttribute('aria-valuenow')).toBe('100');
    
    // 成功のステータステキストが表示されているか確認
    expect(screen.getByText(/完了/i)).toBeInTheDocument();
    
    // 閉じるボタンが表示されているか確認
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('アップロードエラー時の表示が正しいこと', () => {
    const mockFile = createMockFile('error.jpg', 1 * 1024 * 1024, 'image/jpeg');
    const errorMessage = 'アップロードに失敗しました';
    const progress = createProgress('error', 0, mockFile, undefined, errorMessage);
    const mockOnDismiss = vi.fn();

    render(
      <UploadProgressBar
        progress={progress}
        onDismiss={mockOnDismiss}
      />
    );

    // エラーメッセージが表示されているか確認
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    // エラー表示のスタイルが適用されているか確認
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    
    // 閉じるボタンが表示されているか確認
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('閉じるボタンをクリックするとonDismissが呼ばれること', async () => {
    const mockFile = createMockFile('dismissable.jpg', 1 * 1024 * 1024, 'image/jpeg');
    const progress = createProgress('success', 100, mockFile, 'https://example.com/uploads/dismissable.jpg');
    const mockOnDismiss = vi.fn();

    render(
      <UploadProgressBar
        progress={progress}
        onDismiss={mockOnDismiss}
      />
    );

    // 閉じるボタンをクリック
    const closeButton = screen.getByRole('button');
    await act(async () => {
      userEvent.click(closeButton);
    });
    
    // onDismissが呼ばれたか確認
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('ファイルサイズが正しく表示されること', () => {
    // 2MBのファイル
    const mockFile = createMockFile('large.jpg', 2 * 1024 * 1024, 'image/jpeg');
    const progress = createProgress('uploading', 50, mockFile);
    const mockOnDismiss = vi.fn();

    render(
      <UploadProgressBar
        progress={progress}
        onDismiss={mockOnDismiss}
      />
    );

    // ファイルサイズが表示されているか確認（2MB）
    expect(screen.getByText(/2.0\s*MB/)).toBeInTheDocument();
  });

  it('進捗パーセンテージが正しく表示されること', () => {
    const mockFile = createMockFile('percent.jpg', 1 * 1024 * 1024, 'image/jpeg');
    const progress = createProgress('uploading', 75, mockFile);
    const mockOnDismiss = vi.fn();

    render(
      <UploadProgressBar
        progress={progress}
        onDismiss={mockOnDismiss}
      />
    );

    // 進捗パーセンテージが表示されているか確認
    expect(screen.getByText(/75\s*%/)).toBeInTheDocument();
  });

  it('fileが未定義の場合でも正しく表示されること', () => {
    // ファイルなしの進捗状態
    const progress = createProgress('uploading', 30);
    const mockOnDismiss = vi.fn();

    render(
      <UploadProgressBar
        progress={progress}
        onDismiss={mockOnDismiss}
      />
    );

    // 進捗バーが表示されているか確認
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    
    // 進捗値が正しく表示されているか確認
    expect(progressElement.getAttribute('aria-valuenow')).toBe('30');
    
    // ファイル名の代わりにデフォルトテキストが表示されているか確認
    expect(screen.getByText(/ファイルをアップロード中/i)).toBeInTheDocument();
  });
});
