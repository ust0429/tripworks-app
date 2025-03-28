import { collection, query, where, doc, getDoc, getDocs, addDoc, updateDoc, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Payment, 
  PaymentMethod, 
  Transaction, 
  PaymentStatus,
  PaymentResult,
  CheckoutSummary
} from '../../types/payment';

/**
 * 支払いを作成する
 * @param userId ユーザーID
 * @param bookingId 予約ID
 * @param amount 金額
 * @param currency 通貨
 * @param paymentMethodId 支払い方法ID
 * @param metadata メタデータ
 * @returns 支払いID
 */
export async function createPayment(
  userId: string,
  bookingId: string,
  amount: number,
  currency: string = 'JPY',
  paymentMethodId: string,
  metadata?: Record<string, any>
): Promise<string> {
  try {
    // 実際のアプリでは、ここで Firebase Function を呼び出して
    // サーバーサイドで Stripe の paymentIntent を作成します
    // このサンプルでは、直接 Firestore にドキュメントを作成します
    
    const paymentsRef = collection(db, 'payments');
    const paymentData = {
      userId,
      bookingId,
      amount,
      currency,
      status: 'pending' as PaymentStatus,
      paymentMethodId,
      paymentIntentId: `pi_${Math.random().toString(36).substring(2, 15)}`, // 実際はStripeから返される値
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      metadata: metadata || {}
    };
    
    const docRef = await addDoc(paymentsRef, paymentData);
    
    // 取引履歴にも記録
    await addTransaction(
      userId,
      'payment',
      amount,
      currency,
      'pending',
      docRef.id,
      `予約 ${bookingId} の支払い`
    );
    
    return docRef.id;
  } catch (error) {
    console.error('Failed to create payment', error);
    throw error;
  }
}

/**
 * 支払いを確定する
 * @param paymentId 支払いID
 * @returns 支払い結果
 */
export async function confirmPayment(paymentId: string): Promise<PaymentResult> {
  try {
    // 実際のアプリでは、ここで Firebase Function を呼び出して
    // サーバーサイドで Stripe の paymentIntent を確定します
    
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnapshot = await getDoc(paymentRef);
    
    if (!paymentSnapshot.exists()) {
      throw new Error('Payment not found');
    }
    
    const paymentData = paymentSnapshot.data() as Payment;
    
    // 支払いステータスを更新
    await updateDoc(paymentRef, {
      status: 'succeeded',
      updatedAt: serverTimestamp()
    });
    
    // 取引履歴も更新
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('relatedId', '==', paymentId),
      where('type', '==', 'payment')
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const transactionDoc = querySnapshot.docs[0];
      await updateDoc(transactionDoc.ref, {
        status: 'completed'
      });
    }
    
    return {
      success: true,
      message: '支払いが完了しました',
      paymentId,
      bookingId: paymentData.bookingId,
      transactionId: querySnapshot.docs[0]?.id
    };
  } catch (error) {
    console.error('Failed to confirm payment', error);
    
    // エラー時は支払いステータスを失敗に更新
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: 'failed',
        updatedAt: serverTimestamp()
      });
    } catch (updateError) {
      console.error('Failed to update payment status', updateError);
    }
    
    return {
      success: false,
      message: '支払いに失敗しました',
      paymentId
    };
  }
}

/**
 * 支払いを取得する
 * @param paymentId 支払いID
 * @returns 支払い情報
 */
export async function getPayment(paymentId: string): Promise<Payment | null> {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnapshot = await getDoc(paymentRef);
    
    if (!paymentSnapshot.exists()) {
      return null;
    }
    
    return {
      id: paymentSnapshot.id,
      ...paymentSnapshot.data()
    } as Payment;
  } catch (error) {
    console.error('Failed to get payment', error);
    return null;
  }
}

/**
 * ユーザーの支払い履歴を取得する
 * @param userId ユーザーID
 * @param limit 取得件数
 * @returns 支払い情報の配列
 */
export async function getUserPayments(userId: string, limitCount: number = 10): Promise<Payment[]> {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
  } catch (error) {
    console.error('Failed to get user payments', error);
    return [];
  }
}

/**
 * 支払い方法を保存する
 * @param userId ユーザーID
 * @param type 支払い方法タイプ
 * @param details 支払い方法詳細
 * @param isDefault デフォルト支払い方法かどうか
 * @returns 支払い方法ID
 */
export async function savePaymentMethod(
  userId: string,
  type: string,
  details: Record<string, any>,
  isDefault: boolean = false
): Promise<string> {
  try {
    // 実際のアプリでは、ここで Firebase Function を呼び出して
    // サーバーサイドで Stripe の支払い方法を保存します
    
    const paymentMethodsRef = collection(db, 'paymentMethods');
    
    // 既存のデフォルト支払い方法を更新
    if (isDefault) {
      const q = query(
        paymentMethodsRef,
        where('userId', '==', userId),
        where('isDefault', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        await updateDoc(document.ref, { isDefault: false });
      });
    }
    
    const paymentMethodData = {
      userId,
      type,
      details,
      isDefault,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(paymentMethodsRef, paymentMethodData);
    return docRef.id;
  } catch (error) {
    console.error('Failed to save payment method', error);
    throw error;
  }
}

/**
 * ユーザーの支払い方法を取得する
 * @param userId ユーザーID
 * @returns 支払い方法の配列
 */
export async function getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  try {
    const paymentMethodsRef = collection(db, 'paymentMethods');
    const q = query(
      paymentMethodsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PaymentMethod[];
  } catch (error) {
    console.error('Failed to get user payment methods', error);
    return [];
  }
}

/**
 * デフォルトの支払い方法を設定する
 * @param userId ユーザーID
 * @param paymentMethodId 支払い方法ID
 * @returns 成功したかどうか
 */
export async function setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
  try {
    const paymentMethodsRef = collection(db, 'paymentMethods');
    
    // 既存のデフォルト支払い方法を更新
    const defaultQuery = query(
      paymentMethodsRef,
      where('userId', '==', userId),
      where('isDefault', '==', true)
    );
    
    const defaultSnapshot = await getDocs(defaultQuery);
    defaultSnapshot.forEach(async (document) => {
      await updateDoc(document.ref, { isDefault: false });
    });
    
    // 新しいデフォルト支払い方法を設定
    const paymentMethodRef = doc(db, 'paymentMethods', paymentMethodId);
    await updateDoc(paymentMethodRef, { isDefault: true });
    
    return true;
  } catch (error) {
    console.error('Failed to set default payment method', error);
    return false;
  }
}

/**
 * 支払い方法を削除する
 * @param paymentMethodId 支払い方法ID
 * @returns 成功したかどうか
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
  try {
    // 実際のアプリでは、ここで Firebase Function を呼び出して
    // サーバーサイドで Stripe の支払い方法を削除します
    
    // このサンプルでは、Firestore からドキュメントを削除します
    const paymentMethodRef = doc(db, 'paymentMethods', paymentMethodId);
    
    // ドキュメントを取得して存在確認
    const paymentMethodSnapshot = await getDoc(paymentMethodRef);
    if (!paymentMethodSnapshot.exists()) {
      throw new Error('Payment method not found');
    }
    
    // ドキュメントを削除
    await updateDoc(paymentMethodRef, {
      deleted: true,
      deletedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Failed to delete payment method', error);
    return false;
  }
}

/**
 * 取引を追加する（内部用）
 * @param userId ユーザーID
 * @param type 取引タイプ
 * @param amount 金額
 * @param currency 通貨
 * @param status 取引ステータス
 * @param relatedId 関連ID
 * @param description 説明
 * @returns 取引ID
 */
async function addTransaction(
  userId: string,
  type: string,
  amount: number,
  currency: string,
  status: string,
  relatedId: string,
  description: string
): Promise<string> {
  try {
    const transactionsRef = collection(db, 'transactions');
    const transactionData = {
      userId,
      type,
      amount,
      currency,
      status,
      relatedId,
      description,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(transactionsRef, transactionData);
    return docRef.id;
  } catch (error) {
    console.error('Failed to add transaction', error);
    throw error;
  }
}

/**
 * ユーザーの取引履歴を取得する
 * @param userId ユーザーID
 * @param limitCount 取得件数
 * @returns 取引情報の配列
 */
export async function getUserTransactions(userId: string, limitCount: number = 20): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  } catch (error) {
    console.error('Failed to get user transactions', error);
    return [];
  }
}

/**
 * 注文の合計金額を計算する
 * @param subtotal 小計
 * @param taxRate 税率
 * @param serviceFeeRate サービス料率
 * @returns 合計金額の内訳
 */
export function calculateCheckoutSummary(
  subtotal: number,
  taxRate: number = 0.1, // 10%
  serviceFeeRate: number = 0.05 // 5%
): CheckoutSummary {
  const tax = Math.round(subtotal * taxRate);
  const serviceFee = Math.round(subtotal * serviceFeeRate);
  const total = subtotal + tax + serviceFee;
  
  return {
    subtotal,
    tax,
    serviceFee,
    total,
    currency: 'JPY'
  };
}

/**
 * 返金処理を行う
 * @param paymentId 支払いID
 * @param amount 返金金額（指定しない場合は全額返金）
 * @param reason 返金理由
 * @returns 成功したかどうか
 */
export async function refundPayment(
  paymentId: string,
  amount?: number,
  reason?: string
): Promise<boolean> {
  try {
    // 実際のアプリでは、ここで Firebase Function を呼び出して
    // サーバーサイドで Stripe の返金処理を行います
    
    // 支払い情報を取得
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnapshot = await getDoc(paymentRef);
    
    if (!paymentSnapshot.exists()) {
      throw new Error('Payment not found');
    }
    
    const paymentData = paymentSnapshot.data() as Payment;
    
    // 返金金額（指定がなければ全額）
    const refundAmount = amount || paymentData.amount;
    
    // 支払いステータスを更新
    await updateDoc(paymentRef, {
      status: 'refunded',
      updatedAt: serverTimestamp(),
      refundAmount,
      refundReason: reason || 'ユーザーリクエストによる返金'
    });
    
    // 取引履歴に返金を記録
    await addTransaction(
      paymentData.userId,
      'refund',
      refundAmount,
      paymentData.currency,
      'completed',
      paymentId,
      `予約 ${paymentData.bookingId} の返金`
    );
    
    return true;
  } catch (error) {
    console.error('Failed to refund payment', error);
    return false;
  }
}
