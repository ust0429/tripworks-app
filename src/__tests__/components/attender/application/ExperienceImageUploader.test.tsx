/**
 * ExperienceImageUploader コンポーネントのテスト
 * 
 * 体験サンプル画像アップロードコンポーネントの機能をテストします
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import ExperienceImageUploader from '../../../../components/attender/application/ExperienceImageUploader';
import { uploadExperienceImage } from '../../../../services/upload/FileUploadService';
import { ExperienceSample } from '../../../../types/attender/index';

// FileUploadService のモック
vi.mock('../../../../services/upload/FileUploadService', () => ({
  uploadExperienceImage: vi.fn()
}));

describe('ExperienceImageUploader コンポーネント', () => {
  // テスト用のモックファイル
  const createMockFile = (name: string, size: number, mimeType: string) => {
    const file = new File(['mock file content'], name, { type: mimeType });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  // サンプル体験データ
  const sampleExperience: ExperienceSample = {
    title: 'テスト体験',
    description: 'テスト用の体験サンプルです',
    duration: 120,
    imageUrls: ['https://example.com/sample1.jpg', 'https://example.com/sample2.jpg']
  };

  // モックのonUpdate関数
  const mockOnUpdate = vi.fn();

  // テストの前処理
  beforeEach(() => {
    // uploadExperienceImage 関数のモック実装
    (uploadExperienceImage as any).mockImplementation(async (file: File, title: string) => {
      // モックの処理遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 100));
      return `https://example.com/uploads/${title}/${file.name}`;
    });
  });

  // テストの後処理
  afterEach(() => {
    vi.clearAllMocks();
    mockOnUpdate.mockClear();
  });

  it('コンポーネントが正しくレンダリングされること', () => {
    render(
      <ExperienceImageUploader 
        experienceSample={sampleExperience}
        onUpdate={mockOnUpdate}
        maxImages={5}
      />
    );

    expect(screen.getByText(/体験サンプル画像/)).toBeInTheDocument();
    expect(screen.getByText('2 / 5 枚')).toBeInTheDocument();
    expect(screen.getByText(/JPG、PNG、WEBP形式の画像/)).toBeInTheDocument();
  });

  it('既存の画像が表示されていること', () => {
    render(
      <ExperienceImageUploader 
        experienceSample={sampleExperience}
        onUpdate={mockOnUpdate}
        maxImages={5}
      />
    );

    // 画像の数を確認
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(2);
    expect(images[0].getAttribute('src')).toBe('https://example.com/sample1.jpg');
    expect(images[1].getAttribute('src')).toBe('https://example.com/sample2.jpg');
  });

  it('追加画像をアップロードできること', async () => {
    render(
      <ExperienceImageUploader 
        experienceSample={sampleExperience}
        onUpdate={mockOnUpdate}
        maxImages={5}
      />
    );

    // モックファイルを作成
    const mockFile = createMockFile('new-experience.jpg', 2 * 1024 * 1024, 'image/jpeg');

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
      expect(uploadExperienceImage).toHaveBeenCalledWith(
        expect.any(File),
        'テスト体験'
      );
      
      // アップロード完了後の処理を確認
      await waitFor(() => {
        expect(screen.queryByText(/アップロード中/)).not.toBeInTheDocument();
      });
      
      // onUpdate が新しいURLを含む配列で呼ばれたか確認
      expect(mockOnUpdate).toHaveBeenCalledWith([
        'https://example.com/sample1.jpg',
        'https://example.com/sample2.jpg',
        'https://example.com/uploads/テスト体験/new-experience.jpg'
      ]);
    }
  });

  it('画像を削除できること', async () => {
    render(
      <ExperienceImageUploader 
        experienceSample={sampleExperience}
        onUpdate={mockOnUpdate}
        maxImages={5}
      />
    );
    
    // 削除ボタン (Trash2アイコンのラッパー) を探す
    // 注: .getAllByLabelTextを使用する場合、aria-labelにマッチさせる
    const deleteButtons = screen.getAllByLabelText('画像を削除');
    expect(deleteButtons.length).toBe(2);
    
    // 最初の画像を削除
    await act(async () => {
      userEvent.click(deleteButtons[0]);
    });
    
    // onUpdate が正しく呼ばれたか確認
    expect(mockOnUpdate).toHaveBeenCalledWith(['https://example.com/sample2.jpg']);
  });
  
  it('最大数に達した場合にアップロードフォームが非表示になること', () => {
    // 5枚の画像を持つ体験サンプル
    const fullExperience: ExperienceSample = {
      ...sampleExperience,
      imageUrls: [
        'https://example.com/sample1.jpg',
        'https://example.com/sample2.jpg',
        'https://example.com/sample3.jpg',
        'https://example.com/sample4.jpg',
        'https://example.com/sample5.jpg'
      ]
    };
    
    render(
      <ExperienceImageUploader 
        experienceSample={fullExperience}
        onUpdate={mockOnUpdate}
        maxImages={5}
      />
    );
    
    // 「最大枚数に達しました」メッセージが表示されるか
    expect(screen.getByText(/最大枚数に達しました/)).toBeInTheDocument();
    
    // ファイル入力が非表示になっているか
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeInTheDocument();
  });
  
  it('アップロード中にエラーが発生した場合にエラーが表示されること', async () => {
    // エラーをスローするようにモックを書き換え
    (uploadExperienceImage as any).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('画像のアップロードに失敗しました');
    });
    
    render(
      <ExperienceImageUploader 
        experienceSample={sampleExperience}
        onUpdate={mockOnUpdate}
        maxImages={5}
      />
    );

    // モックファイルを作成
    const mockFile = createMockFile('error-test.jpg', 1 * 1024 * 1024, 'image/jpeg');

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
        expect(screen.getByText(/画像のアップロードに失敗しました/)).toBeInTheDocument();
      });
      
      // onUpdateが呼ばれていないことを確認
      expect(mockOnUpdate).not.toHaveBeenCalled();
    }
  });
});
