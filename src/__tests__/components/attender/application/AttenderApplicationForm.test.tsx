/**
 * AttenderApplicationForm コンポーネントの統合テスト
 * 
 * アテンダー申請フォームの全体的な機能をテストします
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import AttenderApplicationFormWrapper from '../../../../components/attender/application/AttenderApplicationForm';
import { AttenderApplicationProvider } from '../../../../contexts/AttenderApplicationContext';
import * as FileUploadService from '../../../../services/upload/FileUploadService';

// FileUploadService のモック
vi.mock('../../../../services/upload/FileUploadService', () => ({
  uploadImage: vi.fn(),
  uploadDocument: vi.fn(),
  uploadIdentificationDocument: vi.fn(),
  uploadExperienceImage: vi.fn(),
  uploadProfileImage: vi.fn()
}));

// APIサービスのモック
vi.mock('../../../../services/api/attenderService', () => ({
  submitAttenderApplication: vi.fn().mockResolvedValue({ id: 'mock-application-id-123' })
}));

describe('AttenderApplicationForm 統合テスト', () => {
  // テスト用のモックファイル
  const createMockFile = (name: string, size: number, mimeType: string) => {
    const file = new File(['mock file content'], name, { type: mimeType });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  // テストの前処理
  beforeEach(() => {
    // ファイルアップロード関数のモック実装
    (FileUploadService.uploadProfileImage as any).mockImplementation(async (file: File) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return `https://example.com/profile/${file.name}`;
    });
    
    (FileUploadService.uploadIdentificationDocument as any).mockImplementation(async (file: File) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return `https://example.com/identity/${file.name}`;
    });
    
    (FileUploadService.uploadExperienceImage as any).mockImplementation(async (file: File) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return `https://example.com/experience/${file.name}`;
    });
  });

  // テストの後処理
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('フォームが正しく初期化されること', () => {
    render(<AttenderApplicationFormWrapper />);

    // 初期ステップ（BasicInfoStep）の要素が表示されていることを確認
    expect(screen.getByText('アテンダー申請')).toBeInTheDocument();
    
    // 進行バーが表示されていることを確認
    expect(document.querySelector('.progress-bar')).toBeInTheDocument();
    
    // 「前へ」ボタンが無効化されていることを確認
    const backButton = screen.getByText('前へ');
    expect(backButton).toBeInTheDocument();
    expect(backButton).toBeDisabled();
    
    // 「次へ」ボタンが表示されていることを確認
    const nextButton = screen.getByText('次へ');
    expect(nextButton).toBeInTheDocument();
  });

  it('基本情報を入力して次のステップに進めること', async () => {
    render(<AttenderApplicationFormWrapper />);
    
    // 基本情報の入力
    // 入力フィールドのIDは実際の実装によって異なる場合があります
    const fullNameInput = screen.getByLabelText(/氏名/i);
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const phoneInput = screen.getByLabelText(/電話番号/i);
    
    await act(async () => {
      await userEvent.type(fullNameInput, 'テスト 太郎');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(phoneInput, '090-1234-5678');
    });
    
    // 生年月日フィールドの入力（日付フィールドの場合）
    const birthDateInput = screen.getByLabelText(/生年月日/i);
    fireEvent.change(birthDateInput, { target: { value: '1990-01-01' } });
    
    // 「次へ」ボタンをクリック
    const nextButton = screen.getByText('次へ');
    await act(async () => {
      userEvent.click(nextButton);
    });
    
    // 次のステップ（ExpertiseStep）に移動したことを確認
    await waitFor(() => {
      expect(screen.getByText(/専門分野/i)).toBeInTheDocument();
    });
  });
  
  it('すべてのステップを正常に進んで申請が完了すること', async () => {
    render(<AttenderApplicationFormWrapper />);
    
    // ステップ1: 基本情報
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/氏名/i), 'テスト 太郎');
      await userEvent.type(screen.getByLabelText(/メールアドレス/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/電話番号/i), '090-1234-5678');
      fireEvent.change(screen.getByLabelText(/生年月日/i), { target: { value: '1990-01-01' } });
      
      // プロフィール画像アップロードをシミュレート（実装によってはこの部分が異なります）
      if (screen.queryByText(/プロフィール画像/i)) {
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          const mockFile = createMockFile('profile.jpg', 1 * 1024 * 1024, 'image/jpeg');
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(mockFile);
          Object.defineProperty(fileInput, 'files', { value: dataTransfer.files });
          fireEvent.change(fileInput);
          await waitFor(() => expect(FileUploadService.uploadProfileImage).toHaveBeenCalled());
        }
      }
      
      userEvent.click(screen.getByText('次へ'));
    });
    
    // ステップ2: 専門分野
    await waitFor(() => expect(screen.getByText(/専門分野/i)).toBeInTheDocument());
    await act(async () => {
      // カテゴリー選択（チェックボックスまたはラジオボタン）
      const categories = screen.getAllByRole('checkbox', { name: /カテゴリー/ });
      if (categories.length > 0) {
        userEvent.click(categories[0]);
      }
      
      // 自己紹介文
      const bioTextarea = screen.getByLabelText(/自己紹介/i);
      await userEvent.type(bioTextarea, 'テスト用の自己紹介です。十分な長さのテキストを入力します。');
      
      userEvent.click(screen.getByText('次へ'));
    });
    
    // ステップ3: 体験サンプル
    await waitFor(() => expect(screen.getByText(/体験サンプル/i)).toBeInTheDocument());
    await act(async () => {
      // 体験タイトル
      await userEvent.type(screen.getByLabelText(/体験タイトル/i), 'テスト体験');
      
      // 体験説明
      await userEvent.type(screen.getByLabelText(/体験の説明/i), 'これはテスト用の体験サンプルです。');
      
      // 体験時間
      const durationInput = screen.getByLabelText(/所要時間/i);
      fireEvent.change(durationInput, { target: { value: '120' } });
      
      // 体験画像アップロード
      const fileInputs = document.querySelectorAll('input[type="file"]');
      if (fileInputs.length > 0) {
        const mockFile = createMockFile('experience.jpg', 1 * 1024 * 1024, 'image/jpeg');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        Object.defineProperty(fileInputs[0], 'files', { value: dataTransfer.files });
        fireEvent.change(fileInputs[0]);
        await waitFor(() => expect(FileUploadService.uploadExperienceImage).toHaveBeenCalled());
      }
      
      userEvent.click(screen.getByText('次へ'));
    });
    
    // ステップ4: 活動可能時間
    await waitFor(() => expect(screen.getByText(/活動可能時間/i)).toBeInTheDocument());
    await act(async () => {
      // 曜日選択（チェックボックス）
      const dayCheckboxes = screen.getAllByRole('checkbox', { name: /曜日/ });
      if (dayCheckboxes.length > 0) {
        userEvent.click(dayCheckboxes[0]); // 月曜日
        userEvent.click(dayCheckboxes[2]); // 水曜日
      }
      
      // 時間帯選択（セレクトボックス）
      const timeSelect = screen.getAllByRole('combobox');
      if (timeSelect.length >= 2) {
        fireEvent.change(timeSelect[0], { target: { value: '9:00' } }); // 開始時間
        fireEvent.change(timeSelect[1], { target: { value: '17:00' } }); // 終了時間
      }
      
      userEvent.click(screen.getByText('次へ'));
    });
    
    // ステップ5: 身分証明書
    await waitFor(() => expect(screen.getByText(/身分証明書/i)).toBeInTheDocument());
    await act(async () => {
      // 身分証明書タイプの選択
      const idTypeSelect = screen.getByLabelText(/身分証明書の種類/i);
      fireEvent.change(idTypeSelect, { target: { value: 'driver_license' } });
      
      // 身分証明書番号
      await userEvent.type(screen.getByLabelText(/身分証明書番号/i), '12345678');
      
      // 有効期限
      const expirationDateInput = screen.getByLabelText(/有効期限/i);
      fireEvent.change(expirationDateInput, { target: { value: '2030-12-31' } });
      
      // 身分証明書画像アップロード
      const fileInputs = document.querySelectorAll('input[type="file"]');
      if (fileInputs.length > 0) {
        const mockFile = createMockFile('id_front.jpg', 1 * 1024 * 1024, 'image/jpeg');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        Object.defineProperty(fileInputs[0], 'files', { value: dataTransfer.files });
        fireEvent.change(fileInputs[0]);
        await waitFor(() => expect(FileUploadService.uploadIdentificationDocument).toHaveBeenCalled());
      }
      
      // SNSリンク（任意）
      const instagramInput = screen.getByLabelText(/Instagram/i);
      await userEvent.type(instagramInput, 'https://instagram.com/testuser');
      
      userEvent.click(screen.getByText('次へ'));
    });
    
    // ステップ6: 同意事項
    await waitFor(() => expect(screen.getByText(/同意事項/i)).toBeInTheDocument());
    await act(async () => {
      // 利用規約と個人情報保護方針への同意
      const agreeCheckboxes = screen.getAllByRole('checkbox');
      agreeCheckboxes.forEach(checkbox => {
        userEvent.click(checkbox);
      });
      
      // 申請ボタンをクリック
      userEvent.click(screen.getByText('申請する'));
    });
    
    // 申請完了画面が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/申請が完了しました/i)).toBeInTheDocument();
      expect(screen.getByText(/mock-application-id-123/i)).toBeInTheDocument();
    });
  });
  
  it('身分証明書アップロードでファイルが正しく処理されること', async () => {
    // フォームをステップ5（身分証明書）まで進める関数
    const advanceToIdentificationStep = async () => {
      // 基本情報ステップ
      await act(async () => {
        await userEvent.type(screen.getByLabelText(/氏名/i), 'テスト 太郎');
        await userEvent.type(screen.getByLabelText(/メールアドレス/i), 'test@example.com');
        await userEvent.type(screen.getByLabelText(/電話番号/i), '090-1234-5678');
        fireEvent.change(screen.getByLabelText(/生年月日/i), { target: { value: '1990-01-01' } });
        userEvent.click(screen.getByText('次へ'));
      });
      
      // 専門分野ステップ
      await waitFor(() => expect(screen.getByText(/専門分野/i)).toBeInTheDocument());
      await act(async () => {
        const categories = screen.getAllByRole('checkbox', { name: /カテゴリー/ });
        if (categories.length > 0) {
          userEvent.click(categories[0]);
        }
        await userEvent.type(screen.getByLabelText(/自己紹介/i), 'テスト用の自己紹介です。');
        userEvent.click(screen.getByText('次へ'));
      });
      
      // 体験サンプルステップ
      await waitFor(() => expect(screen.getByText(/体験サンプル/i)).toBeInTheDocument());
      await act(async () => {
        await userEvent.type(screen.getByLabelText(/体験タイトル/i), 'テスト体験');
        await userEvent.type(screen.getByLabelText(/体験の説明/i), 'テスト説明');
        fireEvent.change(screen.getByLabelText(/所要時間/i), { target: { value: '120' } });
        userEvent.click(screen.getByText('次へ'));
      });
      
      // 活動可能時間ステップ
      await waitFor(() => expect(screen.getByText(/活動可能時間/i)).toBeInTheDocument());
      await act(async () => {
        const dayCheckboxes = screen.getAllByRole('checkbox', { name: /曜日/ });
        if (dayCheckboxes.length > 0) {
          userEvent.click(dayCheckboxes[0]);
        }
        userEvent.click(screen.getByText('次へ'));
      });
      
      // 身分証明書ステップに到達したことを確認
      await waitFor(() => expect(screen.getByText(/身分証明書/i)).toBeInTheDocument());
    };
    
    // テスト開始
    render(<AttenderApplicationFormWrapper />);
    await advanceToIdentificationStep();
    
    // 身分証明書情報の入力
    await act(async () => {
      // 身分証明書タイプの選択
      const idTypeSelect = screen.getByLabelText(/身分証明書の種類/i);
      fireEvent.change(idTypeSelect, { target: { value: 'driver_license' } });
      
      // 身分証明書番号
      await userEvent.type(screen.getByLabelText(/身分証明書番号/i), '12345678');
      
      // 有効期限
      const expirationDateInput = screen.getByLabelText(/有効期限/i);
      fireEvent.change(expirationDateInput, { target: { value: '2030-12-31' } });
    });
    
    // 身分証明書の表面画像をアップロード
    const frontFileInput = document.querySelectorAll('input[type="file"]')[0];
    expect(frontFileInput).not.toBeNull();
    
    if (frontFileInput) {
      await act(async () => {
        const mockFile = createMockFile('license_front.jpg', 1 * 1024 * 1024, 'image/jpeg');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        Object.defineProperty(frontFileInput, 'files', { value: dataTransfer.files });
        fireEvent.change(frontFileInput);
      });
      
      // アップロード中のメッセージが表示されるか
      expect(screen.getByText(/アップロード中/i)).toBeInTheDocument();
      
      // アップロード関数が呼ばれたか確認
      await waitFor(() => {
        expect(FileUploadService.uploadIdentificationDocument).toHaveBeenCalled();
        expect(FileUploadService.uploadIdentificationDocument).toHaveBeenCalledWith(
          expect.any(File),
          'driver_license'
        );
      });
      
      // アップロード完了後のプレビューが表示されるか確認
      await waitFor(() => {
        const previewElement = document.querySelector('img');
        expect(previewElement).toBeInTheDocument();
      });
    }
    
    // 次のステップへ進めるか確認
    await act(async () => {
      userEvent.click(screen.getByText('次へ'));
    });
    
    // 同意事項ステップに進んだことを確認
    await waitFor(() => {
      expect(screen.getByText(/同意事項/i)).toBeInTheDocument();
    });
  });
  
  it('大きすぎるファイルをアップロードした場合にエラーが表示されること', async () => {
    // フォームをステップ5（身分証明書）まで進める
    render(<AttenderApplicationFormWrapper />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/氏名/i), 'テスト 太郎');
      await userEvent.type(screen.getByLabelText(/メールアドレス/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/電話番号/i), '090-1234-5678');
      fireEvent.change(screen.getByLabelText(/生年月日/i), { target: { value: '1990-01-01' } });
      userEvent.click(screen.getByText('次へ'));
    });
    
    await waitFor(() => expect(screen.getByText(/専門分野/i)).toBeInTheDocument());
    await act(async () => {
      const categories = screen.getAllByRole('checkbox', { name: /カテゴリー/ });
      if (categories.length > 0) {
        userEvent.click(categories[0]);
      }
      await userEvent.type(screen.getByLabelText(/自己紹介/i), 'テスト用の自己紹介です。');
      userEvent.click(screen.getByText('次へ'));
    });
    
    await waitFor(() => expect(screen.getByText(/体験サンプル/i)).toBeInTheDocument());
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/体験タイトル/i), 'テスト体験');
      await userEvent.type(screen.getByLabelText(/体験の説明/i), 'テスト説明');
      fireEvent.change(screen.getByLabelText(/所要時間/i), { target: { value: '120' } });
      userEvent.click(screen.getByText('次へ'));
    });
    
    await waitFor(() => expect(screen.getByText(/活動可能時間/i)).toBeInTheDocument());
    await act(async () => {
      const dayCheckboxes = screen.getAllByRole('checkbox', { name: /曜日/ });
      if (dayCheckboxes.length > 0) {
        userEvent.click(dayCheckboxes[0]);
      }
      userEvent.click(screen.getByText('次へ'));
    });
    
    await waitFor(() => expect(screen.getByText(/身分証明書/i)).toBeInTheDocument());
    
    // 必要な入力を行う
    await act(async () => {
      const idTypeSelect = screen.getByLabelText(/身分証明書の種類/i);
      fireEvent.change(idTypeSelect, { target: { value: 'driver_license' } });
      await userEvent.type(screen.getByLabelText(/身分証明書番号/i), '12345678');
      fireEvent.change(screen.getByLabelText(/有効期限/i), { target: { value: '2030-12-31' } });
    });
    
    // 大きいファイルをアップロード
    const frontFileInput = document.querySelectorAll('input[type="file"]')[0];
    expect(frontFileInput).not.toBeNull();
    
    if (frontFileInput) {
      await act(async () => {
        // 6MBのファイル（最大サイズは5MB）
        const largeFile = createMockFile('large_image.jpg', 6 * 1024 * 1024, 'image/jpeg');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(largeFile);
        Object.defineProperty(frontFileInput, 'files', { value: dataTransfer.files });
        fireEvent.change(frontFileInput);
      });
      
      // エラーメッセージが表示されるか確認
      await waitFor(() => {
        expect(screen.getByText(/ファイルサイズが大きすぎます/i)).toBeInTheDocument();
      });
      
      // uploadIdentificationDocumentが呼ばれていないことを確認
      expect(FileUploadService.uploadIdentificationDocument).not.toHaveBeenCalled();
    }
  });
});
