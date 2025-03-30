import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '../config/firebase';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt?: Date;
  lastLoginAt?: Date;
  role?: 'user' | 'attender' | 'admin';
  phoneNumber?: string | null;
  isAttender?: boolean;
}

/**
 * 現在のユーザー情報を取得
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * メールアドレス・パスワードでアカウント登録
 */
export const registerWithEmailPassword = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<UserProfile> => {
  try {
    // Firebase Authで新規ユーザー作成
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // プロフィール名を設定
    await updateProfile(user, { displayName });
    
    // Firestoreにユーザープロフィールを保存
    const userProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      role: 'user',
      isAttender: false
    };
    
    await setDoc(doc(firestore, 'users', user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });
    
    return userProfile;
  } catch (error) {
    console.error('新規登録に失敗しました:', error);
    throw error;
  }
};

/**
 * メールアドレス・パスワードでログイン
 */
export const loginWithEmailPassword = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // ログイン時間を更新
    const userRef = doc(firestore, 'users', userCredential.user.uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp()
    });
    
    return userCredential;
  } catch (error) {
    console.error('ログインに失敗しました:', error);
    throw error;
  }
};

/**
 * Googleアカウントでログイン
 */
export const loginWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // ユーザープロフィール情報を確認・作成
    const userRef = doc(firestore, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // 新規ユーザーの場合は、プロフィールを作成
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName,
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        role: 'user',
        isAttender: false
      });
    } else {
      // 既存ユーザーの場合は、ログイン時間を更新
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
    }
    
    return userCredential;
  } catch (error) {
    console.error('Googleログインに失敗しました:', error);
    throw error;
  }
};

/**
 * ログアウト
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('ログアウトに失敗しました:', error);
    throw error;
  }
};

/**
 * パスワードリセットメールを送信
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('パスワードリセットメールの送信に失敗しました:', error);
    throw error;
  }
};

/**
 * プロフィール画像をアップロード
 */
export const uploadProfileImage = async (
  file: File,
  userId: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, `profile_images/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    
    const downloadURL = await getDownloadURL(storageRef);
    
    // Firebaseユーザープロフィールを更新
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });
      
      // Firestoreのユーザープロフィールも更新
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        photoURL: downloadURL
      });
    }
    
    return downloadURL;
  } catch (error) {
    console.error('プロフィール画像のアップロードに失敗しました:', error);
    throw error;
  }
};

/**
 * ユーザープロフィールを取得
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('ユーザープロフィールの取得に失敗しました:', error);
    throw error;
  }
};

/**
 * ユーザープロフィールを更新
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    // Firestoreのプロフィールを更新
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, profileData);
    
    // Firebase Authのプロフィールも更新
    const currentUser = auth.currentUser;
    if (currentUser && (profileData.displayName || profileData.photoURL)) {
      await updateProfile(currentUser, {
        displayName: profileData.displayName || currentUser.displayName,
        photoURL: profileData.photoURL || currentUser.photoURL
      });
    }
  } catch (error) {
    console.error('ユーザープロフィールの更新に失敗しました:', error);
    throw error;
  }
};

/**
 * 認証状態変更リスナーをセットアップ
 */
export const setupAuthListener = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * IDトークンを取得
 */
export const getUserIdToken = async (forceRefresh = false): Promise<string | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }
  
  try {
    return await getIdToken(currentUser, forceRefresh);
  } catch (error) {
    console.error('IDトークンの取得に失敗しました:', error);
    return null;
  }
};

/**
 * ユーザーの再認証
 */
export const reauthenticateUser = async (password: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('ユーザーが存在しないか、メールアドレスが設定されていません');
  }
  
  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  } catch (error) {
    console.error('ユーザーの再認証に失敗しました:', error);
    throw error;
  }
};

/**
 * ユーザーアカウントを削除
 */
export const deleteUserAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('ユーザーが存在しません');
  }
  
  try {
    // Firestoreユーザードキュメントを削除
    await deleteDoc(doc(firestore, 'users', user.uid));
    
    // Firebase Authユーザーを削除
    await deleteUser(user);
  } catch (error) {
    console.error('ユーザーアカウントの削除に失敗しました:', error);
    throw error;
  }
};

/**
 * メールアドレスを更新
 */
export const updateUserEmail = async (newEmail: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('ユーザーが存在しません');
  }
  
  try {
    await updateEmail(user, newEmail);
    
    // Firestoreのデータも更新
    const userRef = doc(firestore, 'users', user.uid);
    await updateDoc(userRef, {
      email: newEmail
    });
  } catch (error) {
    console.error('メールアドレスの更新に失敗しました:', error);
    throw error;
  }
};

/**
 * パスワードを更新
 */
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('ユーザーが存在しません');
  }
  
  try {
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('パスワードの更新に失敗しました:', error);
    throw error;
  }
};

export default {
  getCurrentUser,
  registerWithEmailPassword,
  loginWithEmailPassword,
  loginWithGoogle,
  logout,
  sendPasswordReset,
  uploadProfileImage,
  getUserProfile,
  updateUserProfile,
  setupAuthListener,
  getUserIdToken,
  reauthenticateUser,
  deleteUserAccount,
  updateUserEmail,
  updateUserPassword
};
