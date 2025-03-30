import React, { useState } from 'react';
import { X, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../common/Loader';

interface PasswordResetModalProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ onClose, onBackToLogin }) => {
  const { resetPassword, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSuccess(false);
    
    if (!email) {
      setFormError('メールアドレスを入力してください');
      return;
    }
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err) {
      console.error('パスワードリセットエラー:', err);
      // エラーは既にuseAuthでハンドリングされている
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">パスワードのリセット</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {/* 成功メッセージ */}
        {isSuccess && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
            パスワードリセットのメールを送信しました。メールの指示に従ってパスワードをリセットしてください。
          </div>
        )}
        
        {/* エラーメッセージ */}
        {(error || formError) && !isSuccess && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {formError || error}
          </div>
        )}
        
        <p className="text-sm text-gray-600">
          登録したメールアドレスを入力してください。パスワードリセット用のリンクをメールで送信します。
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                placeholder="your-email@example.com"
                disabled={isLoading || isSuccess}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition duration-200 flex items-center justify-center"
            disabled={isLoading || isSuccess}
          >
            {isLoading ? <Loader size="small" className="mr-2" /> : null}
            {isLoading ? 'メール送信中...' : 'パスワードリセットリンクを送信'}
          </button>
        </form>
        
        <button
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center py-2 px-4 text-gray-700 hover:text-black transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft size={16} className="mr-2" />
          ログイン画面に戻る
        </button>
      </div>
    </div>
  );
};

export default PasswordResetModal;
