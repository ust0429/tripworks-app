/**
 * 重要: このファイルは古い認証システムです。
 * 新しいFirebase認証システムに移行しました。
 * contexts/AuthContext.tsxを使用してください。
 * 
 * このファイルは互換性のために残していますが、将来的に削除されます。
 */

import React from 'react';
import { useAuth as useFirebaseAuth } from './contexts/AuthContext';

// 新しい認証コンテキストにリダイレクト
export const useAuth = useFirebaseAuth;

// すべてのモーダルなどの古いコンポーネントをエクスポート
export const LoginModal = () => null;
export const SignupModal = () => null;
export const AuthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
