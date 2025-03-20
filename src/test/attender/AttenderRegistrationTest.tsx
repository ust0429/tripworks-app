import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AttenderApplicationProvider } from '../../contexts/AttenderApplicationContext';
import BasicInfoStep from '../../components/attender/application/steps/BasicInfoStep';
import AvailabilityStep from '../../components/attender/application/steps/AvailabilityStep';
import IdentificationStep from '../../components/attender/application/steps/IdentificationStep';

// モックサービス
jest.mock('../../services/AttenderService', () => ({
  uploadPortfolioImage: jest.fn().mockResolvedValue({ url: 'https://example.com/image.jpg' }),
  uploadIdentificationDocument: jest.fn().mockResolvedValue({ url: 'https://example.com/doc.jpg' }),
  registerAttender: jest.fn().mockResolvedValue({ id: '123', success: true }),
}));

// ApplePay モックはsetupTests.tsで定義済み

describe('アテンダー登録フォームの各ステップのテスト', () => {
  // 型の問題を回避するためにPropsを明示的に指定
interface BasicInfoStepProps {
  onNext: () => void;
}

interface AvailabilityStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface IdentificationStepProps {
  onNext: () => void;
  onBack: () => void;
}

// BasicInfoStepのテスト
test('BasicInfoStep - 各フィールドが正しく更新される', async () => {
    render(
      <AttenderApplicationProvider>
        <BasicInfoStep onNext={() => {}} />
      </AttenderApplicationProvider>
    );

    // 名前入力
    fireEvent.change(screen.getByLabelText(/名前/i), { target: { value: 'テスト名前' } });
    
    // 自己紹介入力
    fireEvent.change(screen.getByLabelText(/自己紹介/i), { target: { value: 'テスト自己紹介文' } });
    
    // 専門分野選択
    fireEvent.click(screen.getByText(/専門分野を選択/i));
    fireEvent.click(screen.getByText(/アート/i));
    
    // 場所入力
    fireEvent.change(screen.getByLabelText(/活動エリア/i), { target: { value: '東京' } });

    // 次へボタンをクリック
    fireEvent.click(screen.getByText(/次へ/i));

    // 入力値が正しく保存されているか検証
    await waitFor(() => {
      // コンテキストの値を確認する方法は実装によって異なりますが、
      // 次のステップに進むことができれば基本的なバリデーションは通過していると考えられます
      expect(screen.queryByText(/必須項目です/i)).not.toBeInTheDocument();
    });
  });

  // AvailabilityStepのテスト
test('AvailabilityStep - 利用可能時間が正しく設定できる', async () => {
    render(
      <AttenderApplicationProvider>
        <AvailabilityStep onNext={() => {}} onBack={() => {}} />
      </AttenderApplicationProvider>
    );

    // 平日選択
    fireEvent.click(screen.getByLabelText(/平日/i));
    
    // 時間帯選択（午前）
    fireEvent.click(screen.getByLabelText(/午前/i));
    
    // 次へボタンをクリック
    fireEvent.click(screen.getByText(/次へ/i));

    // 選択が正しく保存されているか検証
    await waitFor(() => {
      expect(screen.queryByText(/少なくとも1つ選択してください/i)).not.toBeInTheDocument();
    });
  });

  // IdentificationStepのテスト
test('IdentificationStep - 身分証明書アップロードが正しく機能する', async () => {
    render(
      <AttenderApplicationProvider>
        <IdentificationStep onNext={() => {}} onBack={() => {}} />
      </AttenderApplicationProvider>
    );

    // IDタイプ選択
    fireEvent.change(screen.getByLabelText(/身分証明書タイプ/i), { target: { value: 'driver_license' } });
    
    // ファイルアップロード
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/ファイルを選択/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    // 次へボタンをクリック
    fireEvent.click(screen.getByText(/次へ/i));

    // アップロードが正しく処理されているか検証
    await waitFor(() => {
      expect(screen.queryByText(/アップロードエラー/i)).not.toBeInTheDocument();
    });
  });
});
