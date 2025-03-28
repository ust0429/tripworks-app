/**
 * Firebase Auth モック
 */

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

class Auth {
  private static instance: Auth;
  private _currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  private constructor() {
    // デバッグ用デフォルトユーザー
    this._currentUser = {
      uid: 'mock-user-id',
      email: 'mock@example.com',
      displayName: 'Mock User',
      photoURL: null
    };
  }

  public static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  get currentUser(): User | null {
    return this._currentUser;
  }

  signInWithEmailAndPassword(email: string, password: string): Promise<{ user: User }> {
    this._currentUser = {
      uid: 'mock-user-id',
      email,
      displayName: 'Mock User',
      photoURL: null
    };
    
    this.notifyListeners();
    
    return Promise.resolve({ user: this._currentUser });
  }

  signOut(): Promise<void> {
    this._currentUser = null;
    this.notifyListeners();
    return Promise.resolve();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    // 初期状態を通知
    callback(this._currentUser);
    
    // アンサブスクライブ関数を返す
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this._currentUser));
  }
}

// Firebase Auth APIのモック
export function getAuth(): Auth {
  return Auth.getInstance();
}

export function onAuthStateChanged(auth: Auth, callback: (user: any) => void): () => void {
  return auth.onAuthStateChanged(callback);
}

export function getIdToken(user: any, forceRefresh?: boolean): Promise<string> {
  return Promise.resolve('mock-id-token');
}

export default {
  getAuth,
  onAuthStateChanged,
  getIdToken
};
