import { collection, query, where, doc, getDoc, getDocs, addDoc, updateDoc, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Payout, PayoutStatus, Transaction } from '../../types/payment';

/**
 * アテンダーへの支払いを作成する
 * @param attenderId アテンダーID
 * @param amount 金額
 * @param currency 通貨
 * @param bookingIds 関連する予約ID
 * @param destinationId 送金先ID
 * @returns 支払いID
 */
export async function createPayout(
  attenderId: string,
  amount: number,
  currency: string = 'JPY',
  bookingIds: string[],
  destinationId: string
): Promise<string> {
  try {
    // 実際のアプリでは、ここで Firebase Function を呼び出して
    // サーバーサイドで Stripe の Transfer を作成します
    
    const payoutsRef = collection(db, 'payouts');
    const payoutData = {
      attenderId,
      amount,
      currency,
      status: 'pending' as PayoutStatus,
      destinationId,
      createdAt: serverTimestamp(),
      bookingIds
    };
    
    const docRef = await addDoc(payoutsRef, payoutData);
    
    // 取引履歴にも記録
    for (const bookingId of bookingIds) {
      await addTransaction(
        attenderId,
        'payout',
        amount / bookingIds.length, // 複数予約の場合は均等割り
        currency,
        'pending',
        docRef.id,
        `予約 ${bookingId} の報酬`
      );
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Failed to create payout', error);
    throw error;
  }
}

/**
 * アテンダーへの支払いを処理する
 * @param payoutId 支払いID
 * @returns 成功したかどうか
 */
export async function processPayout(payoutId: string): Promise<boolean> {
  try {
    // 実際のアプリでは、ここで Firebase Function を呼び出して
    // サーバーサイドで Stripe の Transfer を確定します
    
    const payoutRef = doc(db, 'payouts', payoutId);
    const payoutSnapshot = await getDoc(payoutRef);
    
    if (!payoutSnapshot.exists()) {
      throw new Error('Payout not found');
    }
    
    const payoutData = payoutSnapshot.data() as Payout;
    
    // 仮の Stripe Transfer ID を生成
    const stripeTransferId = `tr_${Math.random().toString(36).substring(2, 15)}`;
    
    // 支払いステータスを更新
    await updateDoc(payoutRef, {
      status: 'paid',
      paidAt: serverTimestamp(),
      stripeTransferId
    });
    
    // 取引履歴も更新
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('relatedId', '==', payoutId),
      where('type', '==', 'payout')
    );
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        status: 'completed'
      });
    });
    
    return true;
  } catch (error) {
    console.error('Failed to process payout', error);
    
    // エラー時は支払いステータスを失敗に更新
    try {
      const payoutRef = doc(db, 'payouts', payoutId);
      await updateDoc(payoutRef, {
        status: 'failed'
      });
      
      // 取引履歴も更新
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('relatedId', '==', payoutId),
        where('type', '==', 'payout')
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          status: 'failed'
        });
      });
    } catch (updateError) {
      console.error('Failed to update payout status', updateError);
    }
    
    return false;
  }
}

/**
 * アテンダーへの支払いを取得する
 * @param payoutId 支払いID
 * @returns 支払い情報
 */
export async function getPayout(payoutId: string): Promise<Payout | null> {
  try {
    const payoutRef = doc(db, 'payouts', payoutId);
    const payoutSnapshot = await getDoc(payoutRef);
    
    if (!payoutSnapshot.exists()) {
      return null;
    }
    
    return {
      id: payoutSnapshot.id,
      ...payoutSnapshot.data()
    } as Payout;
  } catch (error) {
    console.error('Failed to get payout', error);
    return null;
  }
}

/**
 * アテンダーの支払い履歴を取得する
 * @param attenderId アテンダーID
 * @param limitCount 取得件数
 * @returns 支払い情報の配列
 */
export async function getAttenderPayouts(attenderId: string, limitCount: number = 10): Promise<Payout[]> {
  try {
    const payoutsRef = collection(db, 'payouts');
    const q = query(
      payoutsRef,
      where('attenderId', '==', attenderId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payout[];
  } catch (error) {
    console.error('Failed to get attender payouts', error);
    return [];
  }
}

/**
 * アテンダーの未払い支払いを取得する
 * @param attenderId アテンダーID
 * @returns 支払い情報の配列
 */
export async function getAttenderPendingPayouts(attenderId: string): Promise<Payout[]> {
  try {
    const payoutsRef = collection(db, 'payouts');
    const q = query(
      payoutsRef,
      where('attenderId', '==', attenderId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payout[];
  } catch (error) {
    console.error('Failed to get attender pending payouts', error);
    return [];
  }
}

/**
 * アテンダーの総支払い額を計算する
 * @param attenderId アテンダーID
 * @param status 支払いステータス（指定しない場合はすべて）
 * @returns 総支払い額
 */
export async function calculateAttenderTotalPayouts(
  attenderId: string,
  status?: PayoutStatus
): Promise<number> {
  try {
    const payoutsRef = collection(db, 'payouts');
    let q;
    
    if (status) {
      q = query(
        payoutsRef,
        where('attenderId', '==', attenderId),
        where('status', '==', status)
      );
    } else {
      q = query(
        payoutsRef,
        where('attenderId', '==', attenderId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.reduce((total, doc) => {
      const payout = doc.data() as Payout;
      return total + payout.amount;
    }, 0);
  } catch (error) {
    console.error('Failed to calculate attender total payouts', error);
    return 0;
  }
}

/**
 * 送金先を登録する
 * @param attenderId アテンダーID
 * @param bankName 銀行名
 * @param branchName 支店名
 * @param accountType 口座種別
 * @param accountNumber 口座番号
 * @param accountHolderName 口座名義
 * @returns 送金先ID
 */
export async function registerBankAccount(
  attenderId: string,
  bankName: string,
  branchName: string,
  accountType: 'ordinary' | 'checking' | 'savings',
  accountNumber: string,
  accountHolderName: string
): Promise<string> {
  try {
    // 実際のアプリでは、ここで Firebase Function を呼び出して
    // サーバーサイドで Stripe の External Account を作成します
    
    const destinationsRef = collection(db, 'payoutDestinations');
    const destinationData = {
      attenderId,
      type: 'bank_account',
      details: {
        bankName,
        branchName,
        accountType,
        accountNumber,
        accountHolderName
      },
      status: 'active',
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(destinationsRef, destinationData);
    return docRef.id;
  } catch (error) {
    console.error('Failed to register bank account', error);
    throw error;
  }
}

/**
 * アテンダーの送金先を取得する
 * @param attenderId アテンダーID
 * @returns 送金先情報の配列
 */
export async function getAttenderPayoutDestinations(attenderId: string): Promise<any[]> {
  try {
    const destinationsRef = collection(db, 'payoutDestinations');
    const q = query(
      destinationsRef,
      where('attenderId', '==', attenderId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Failed to get attender payout destinations', error);
    return [];
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
