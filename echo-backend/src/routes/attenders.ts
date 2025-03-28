/**
 * Attenders Router
 * 
 * アテンダー関連のエンドポイントを定義します。
 */
import express from 'express';
import { AuthenticatedRequest, verifyAuth } from '../middleware/authMiddleware';
import * as admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore();

/**
 * アテンダー一覧を取得
 * クエリパラメータで絞り込み可能:
 * - location: 活動地域
 * - specialties: 専門分野
 * - isLocalResident: 地元住民かどうか
 * - isMigrant: 移住者かどうか
 * - limit: 取得件数（デフォルト20件）
 */
router.get('/', async (req, res) => {
  try {
    const { location, specialties, isLocalResident, isMigrant, limit = 20 } = req.query;
    
    // クエリの基本設定
    let query: FirebaseFirestore.Query = db.collection('attenders');
    
    // フィルタリング条件の適用
    if (location) {
      query = query.where('location', '==', location);
    }
    
    // 専門分野での絞り込み（完全一致）
    if (specialties) {
      query = query.where('specialties', 'array-contains', specialties);
    }
    
    // 地元住民/移住者フラグでの絞り込み
    if (isLocalResident !== undefined) {
      const isLocalResidentBool = isLocalResident === 'true';
      query = query.where('isLocalResident', '==', isLocalResidentBool);
    }
    
    if (isMigrant !== undefined) {
      const isMigrantBool = isMigrant === 'true';
      query = query.where('isMigrant', '==', isMigrantBool);
    }
    
    // 評価順に並べ替え
    query = query.orderBy('averageRating', 'desc');
    
    // クエリ実行
    const snapshot = await query.limit(Number(limit)).get();
    
    // レスポンスデータの整形
    const attenders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(attenders);
  } catch (error) {
    console.error('アテンダー一覧取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve attenders'
    });
  }
});

/**
 * 特定のアテンダーの詳細を取得
 */
router.get('/:id', async (req, res) => {
  try {
    const attenderId = req.params.id;
    
    const doc = await db.collection('attenders').doc(attenderId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Attender not found'
      });
    }
    
    // アテンダー情報を取得
    const attenderData = doc.data();
    
    // 過去のレビュー情報も取得（最新5件）
    const reviewsSnapshot = await db.collection('reviews')
      .where('attenderId', '==', attenderId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 提供可能な体験情報も取得
    const experiencesSnapshot = await db.collection('experiences')
      .where('attenderId', '==', attenderId)
      .where('isActive', '==', true)
      .limit(10)
      .get();
    
    const experiences = experiencesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // レスポンスデータの作成
    const responseData = {
      id: doc.id,
      ...attenderData,
      reviews,
      experiences
    };
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('アテンダー詳細取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve attender details'
    });
  }
});

/**
 * 新規アテンダーを登録
 */
router.post('/', verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // すでにアテンダー登録されているかチェック
    const existingAttenderSnapshot = await db.collection('attenders')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (!existingAttenderSnapshot.empty) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'User is already registered as an attender'
      });
    }
    
    // リクエストデータから必要な情報を取得
    const {
      name,
      bio,
      location,
      specialties,
      profilePhoto,
      experienceSamples,
      languages,
      isLocalResident,
      isMigrant,
      yearsMoved,
      previousLocation,
      expertise,
      availableTimes
    } = req.body;
    
    // 必須項目の検証
    if (!name) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'name is required'
      });
    }
    
    if (!bio) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'bio is required'
      });
    }
    
    if (!location) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'location is required'
      });
    }
    
    if (!specialties || !Array.isArray(specialties) || specialties.length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'specialties must be a non-empty array'
      });
    }
    
    // ユーザー情報の取得
    const userRecord = await admin.auth().getUser(userId);
    
    // 新規アテンダーデータの作成
    const attenderData = {
      userId,
      name: name || userRecord.displayName || '名称未設定',
      bio,
      location,
      specialties,
      profilePhoto: profilePhoto || userRecord.photoURL || null,
      experienceSamples: experienceSamples || [],
      languages: languages || [],
      isLocalResident: isLocalResident || false,
      isMigrant: isMigrant || false,
      yearsMoved: yearsMoved || null,
      previousLocation: previousLocation || null,
      expertise: expertise || [],
      availableTimes: availableTimes || [],
      averageRating: 0,
      reviewCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Firestoreに保存
    const docRef = await db.collection('attenders').add(attenderData);
    
    // ユーザードキュメントにアテンダーIDを追加
    await db.collection('users').doc(userId).set({
      attenderId: docRef.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    res.status(201).json({
      id: docRef.id,
      message: 'Attender registered successfully'
    });
  } catch (error) {
    console.error('アテンダー登録エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register attender'
    });
  }
});

/**
 * アテンダー情報を更新
 */
router.put('/:id', verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const attenderId = req.params.id;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // アテンダーの存在確認と所有権チェック
    const attenderDoc = await db.collection('attenders').doc(attenderId).get();
    
    if (!attenderDoc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Attender not found'
      });
    }
    
    const attenderData = attenderDoc.data();
    
    // 所有権チェック
    if (attenderData?.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this attender'
      });
    }
    
    // リクエストデータから更新項目を取得
    const {
      name,
      bio,
      location,
      specialties,
      profilePhoto,
      experienceSamples,
      languages,
      isLocalResident,
      isMigrant,
      yearsMoved,
      previousLocation,
      expertise,
      availableTimes
    } = req.body;
    
    // 更新データの作成
    const updateData: Record<string, any> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // 更新項目の追加（undefinedでない場合のみ）
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (specialties !== undefined) updateData.specialties = specialties;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (experienceSamples !== undefined) updateData.experienceSamples = experienceSamples;
    if (languages !== undefined) updateData.languages = languages;
    if (isLocalResident !== undefined) updateData.isLocalResident = isLocalResident;
    if (isMigrant !== undefined) updateData.isMigrant = isMigrant;
    if (yearsMoved !== undefined) updateData.yearsMoved = yearsMoved;
    if (previousLocation !== undefined) updateData.previousLocation = previousLocation;
    if (expertise !== undefined) updateData.expertise = expertise;
    if (availableTimes !== undefined) updateData.availableTimes = availableTimes;
    
    // Firestoreの更新
    await db.collection('attenders').doc(attenderId).update(updateData);
    
    res.status(200).json({
      id: attenderId,
      message: 'Attender updated successfully'
    });
  } catch (error) {
    console.error('アテンダー更新エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update attender'
    });
  }
});

/**
 * アテンダーの体験一覧を取得
 */
router.get('/:id/experiences', async (req, res) => {
  try {
    const attenderId = req.params.id;
    const { isActive, limit = 10 } = req.query;
    
    // アテンダーの存在確認
    const attenderDoc = await db.collection('attenders').doc(attenderId).get();
    
    if (!attenderDoc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Attender not found'
      });
    }
    
    // クエリの基本設定
    let query: FirebaseFirestore.Query = db.collection('experiences')
      .where('attenderId', '==', attenderId);
    
    // アクティブな体験のみを取得するフィルター
    if (isActive !== undefined) {
      const isActiveBool = isActive === 'true';
      query = query.where('isActive', '==', isActiveBool);
    }
    
    // 最新順に並べ替え
    query = query.orderBy('createdAt', 'desc');
    
    // クエリ実行
    const snapshot = await query.limit(Number(limit)).get();
    
    // レスポンスデータの整形
    const experiences = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(experiences);
  } catch (error) {
    console.error('アテンダー体験一覧取得エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve attender experiences'
    });
  }
});

/**
 * アテンダーの新規体験を作成
 */
router.post('/:id/experiences', verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const attenderId = req.params.id;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // アテンダーの存在確認と所有権チェック
    const attenderDoc = await db.collection('attenders').doc(attenderId).get();
    
    if (!attenderDoc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Attender not found'
      });
    }
    
    const attenderData = attenderDoc.data();
    
    // 所有権チェック
    if (attenderData?.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to create experiences for this attender'
      });
    }
    
    // リクエストデータから必要な情報を取得
    const {
      title,
      description,
      category,
      subcategory,
      estimatedDuration,
      price,
      images,
      location,
      isActive
    } = req.body;
    
    // 必須項目の検証
    if (!title) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'title is required'
      });
    }
    
    if (!description) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'description is required'
      });
    }
    
    if (!category) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'category is required'
      });
    }
    
    if (!estimatedDuration) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'estimatedDuration is required'
      });
    }
    
    if (price === undefined) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'price is required'
      });
    }
    
    // 新規体験データの作成
    const experienceData = {
      attenderId,
      title,
      description,
      category,
      subcategory: subcategory || null,
      estimatedDuration,
      price: Number(price),
      images: images || [],
      location: location || attenderData?.location || null,
      isActive: isActive !== undefined ? isActive : true,
      averageRating: 0,
      reviewCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Firestoreに保存
    const docRef = await db.collection('experiences').add(experienceData);
    
    // アテンダーのexperienceSamplesに追加（まだ3つ未満の場合）
    if (attenderData?.experienceSamples && attenderData.experienceSamples.length < 3) {
      const experienceSample = {
        id: docRef.id,
        title,
        description,
        category,
        subcategory: subcategory || null,
        estimatedDuration,
        price: Number(price),
        images: images || []
      };
      
      const updatedSamples = [...attenderData.experienceSamples, experienceSample];
      
      await db.collection('attenders').doc(attenderId).update({
        experienceSamples: updatedSamples.slice(0, 3), // 最大3つまで
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.status(201).json({
      id: docRef.id,
      message: 'Experience created successfully'
    });
  } catch (error) {
    console.error('体験作成エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create experience'
    });
  }
});

export default router;
