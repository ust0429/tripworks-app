/**
 * Firebase設定ファイル
 * 
 * 注：このファイルは使用しません。代わりにfirebaseInit.tsを使用します。
 * firebaseInit.tsで初期化したFirebaseインスタンスをインポートします。
 */

import { auth, firestore, storage, app } from './firebaseInit';

// エミュレータ接続などの追加設定を行う場合はここに記述
// ただし初期化自体はfirebaseInit.tsで行うため、initializeAppは呼び出さない

// コンポーネントからはこのファイルをインポートする
export { app, auth, firestore, storage };
