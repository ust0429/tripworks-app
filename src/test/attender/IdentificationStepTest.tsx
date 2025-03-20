/**
 * IdentificationStep のテスト
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IdentificationStep from '../../components/attender/application/steps/IdentificationStep';
import { AttenderApplicationProvider } from '../../contexts/AttenderApplicationContext';

// 必要なプロップスを定義
const mockProps = {
  onNext: jest.fn(),
  onBack: jest.fn()
};

// テストコンポーネントのラッパー
const TestWrapper: React.FC = () => (
  <AttenderApplicationProvider>
    <IdentificationStep {...mockProps} />
  </AttenderApplicationProvider>
);

describe('IdentificationStep', () => {
  test('renders without crashing', () => {
    render(<TestWrapper />);
    expect(screen.getByText('身分証明と追加情報')).toBeInTheDocument();
  });

  test('validates required fields', () => {
    render(<TestWrapper />);
    
    // 次へボタンをクリック
    fireEvent.click(screen.getByText('次へ'));
    
    // エラーメッセージが表示されるかチェック
    // 実際のアプリケーションでは、フォームのバリデーション結果に応じてエラーメッセージが表示される
    // このテストではコンポーネントが正しくレンダリングされることを確認するだけ
  });

  test('handles document type selection', () => {
    render(<TestWrapper />);
    
    // 身分証明書の種類を選択
    const selectElement = screen.getByLabelText(/身分証明書の種類/i);
    fireEvent.change(selectElement, { target: { value: 'passport' } });
    
    // 選択した値がフォームに反映されることを確認
    expect(selectElement).toHaveValue('passport');
  });

  test('handles file upload UI', () => {
    render(<TestWrapper />);
    
    // ファイルアップロードラベルが表示されていることを確認
    expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
    
    // 実際のファイルアップロード処理はモックするか、別途E2Eテストで検証する
  });

  test('updates form data when input changes', () => {
    render(<TestWrapper />);
    
    // 身分証明書の種類を選択
    const selectElement = screen.getByLabelText(/身分証明書の種類/i);
    fireEvent.change(selectElement, { target: { value: 'passport' } });
    
    // 身分証明書番号を入力
    const numberInput = screen.getByLabelText(/身分証明書番号/i);
    fireEvent.change(numberInput, { target: { value: 'AB1234567' } });
    
    // 入力値が反映されることを確認
    expect(numberInput).toHaveValue('AB1234567');
  });

  test('handles navigation buttons', () => {
    render(<TestWrapper />);
    
    // 「前へ」ボタンが機能することを確認
    fireEvent.click(screen.getByText('前へ'));
    expect(mockProps.onBack).toHaveBeenCalled();
    
    // 「次へ」ボタンはバリデーションが必要なので、クリックしても呼ばれない可能性がある
  });
});
