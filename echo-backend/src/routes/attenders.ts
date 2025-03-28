import express from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, verifyAttender, verifyOwnership } from '../middleware/authMiddleware';

const router = express.Router();

// アテンダー一覧の取得
router.get('/', async (req, res) => {
  try {
    const { location, specialties, rating, status } = req.query;
    
    let attendersRef = admin.firestore().collection('attenders');
    
    // フィルタリング
    if (status) {
      attendersRef = attendersRef.where('status', '==', status);
    } else {
      // デフォルトでは'active'なアテンダーのみ表示
      attendersRef = attendersRef.where('status', '==', 'active');
    }
    
    if (rating) {
      const minRating = Number(rating);
      if (!isNaN(minRating)) {
        attendersRef = attendersRef.where('averageRating', '>=', minRating);
      }
    }
    
    // 注: Firestoreの制約でcompound queriesには複合インデックスが必要
    // specialtiesやlocationの詳細フィルタリングはクライアント側で行う場合も
    
    const snapshot = await attendersRef.get();
    
    let attenders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // クライアント側でのフィルタリング
    if (specialties) {
      const specialtiesList = Array.isArray(specialties) 
        ? specialties 
        : [specialties];
      
      attenders = attenders.filter(attender => {
        return specialtiesList.some(specialty => 
          attender.specialties && attender.specialties.includes(specialty)
        );
      });
    }
    
    if (location) {
      attenders = attenders.filter(attender => {
        if (typeof attender.location === 'string') {
          return attender.location.includes(location);
        } else if (attender.location && typeof attender.location === 'object') {
          const locationObj = attender.location;
          return (
            (locationObj.country && locationObj.country.includes(location)) ||
            (locationObj.region && locationObj.region.includes(location)) ||
            (locationObj.city && locationObj.city.includes(location))
          );
        }
        return false;
      });
    }
    
    res.status(200).json(attenders);
  } catch (error) {
    console.error('Error fetching attenders:', error);
    res.status(500).json({ error: 'Failed to fetch attenders' });
  }
});

// アテンダー詳細の取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attenderDoc = await admin.firestore().collection('attenders').doc(id).get();
    
    if (!attenderDoc.exists) {
      return res.status(404).json({ error: 'Attender not found' });
    }
    
    res.status(200).json({
      id: attenderDoc.id,
      ...attenderDoc.data()
    });
  } catch (error) {
    console.error('Error fetching attender:', error);
    res.status(500).json({ error: 'Failed to fetch attender' });
  }
});

// アテンダー登録申請
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    // 現在のユーザーID取得
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    const attenderData = req.body;
    
    // 必須フィールドの検証
    if (!attenderData.name || !attenderData.email || !attenderData.location) {
      return res.status(400).json({ error: 'Name, email, and location are required' });
    }
    
    // 既にアテンダー登録がないか確認
    const existingAttenderQuery = await admin.firestore().collection('attenders')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (!existingAttenderQuery.empty) {
      return res.status(400).json({ 
        error: 'Already registered',
        message: 'You already have an attender profile'
      });
    }
    
    // アテンダーデータの作成
    const newAttenderData = {
      ...attenderData,
      userId,
      status: 'pending', // 審査が必要なためpendingで始める
      averageRating: 0,
      reviewCount: 0,
      completedExperienceCount: 0,
      responseRate: 0,
      verificationStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // データベースに保存
    const newAttenderRef = await admin.firestore().collection('attenders').add(newAttenderData);
    
    // ユーザー情報の更新
    await admin.firestore().collection('users').doc(userId).update({
      isAttender: true,
      attenderId: newAttenderRef.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // 管理者への通知
    await admin.firestore().collection('adminNotifications').add({
      type: 'new_attender_application',
      title: '新しいアテンダー申請',
      message: `${attenderData.name}さんからのアテンダー申請が届いています。確認してください。`,
      attenderId: newAttenderRef.id,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ 
      id: newAttenderRef.id,
      message: 'Attender application submitted successfully'
    });
  } catch (error) {
    console.error('Error creating attender:', error);
    res.status(500).json({ error: 'Failed to create attender' });
  }
});

// アテンダー情報の更新
router.put('/:id', verifyOwnership('attender'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // 保護されたフィールドは更新不可
    const protectedFields = ['userId', 'status', 'verificationStatus', 'averageRating', 'reviewCount', 'createdAt'];
    protectedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        delete updateData[field];
      }
    });
    
    const attenderRef = admin.firestore().collection('attenders').doc(id);
    const attenderDoc = await attenderRef.get();
    
    if (!attenderDoc.exists) {
      return res.status(404).json({ error: 'Attender not found' });
    }
    
    await attenderRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({ 
      id,
      message: 'Attender updated successfully' 
    });
  } catch (error) {
    console.error('Error updating attender:', error);
    res.status(500).json({ error: 'Failed to update attender' });
  }
});

// アテンダーの体験一覧を取得
router.get('/:id/experiences', async (req, res) => {
  try {
    const { id } = req.params;
    
    // アテンダーの存在確認
    const attenderDoc = await admin.firestore().collection('attenders').doc(id).get();
    
    if (!attenderDoc.exists) {
      return res.status(404).json({ error: 'Attender not found' });
    }
    
    // 体験一覧を検索
    const experiencesRef = admin.firestore().collection('experiences')
      .where('attenderId', '==', id)
      .where('status', '==', 'active');
    
    const experiencesSnapshot = await experiencesRef.get();
    
    const experiences = experiencesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(experiences);
  } catch (error) {
    console.error('Error fetching attender experiences:', error);
    res.status(500).json({ error: 'Failed to fetch attender experiences' });
  }
});

// アテンダーの体験を作成（アテンダー専用）
router.post('/:id/experiences', verifyAttender, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const attender = (req as any).attender;
    
    // アテンダーIDが一致するか確認
    if (attender.id !== id) {
      return res.status(403).json({ 
        error: 'Not authorized',
        message: 'You can only create experiences for your own attender profile' 
      });
    }
    
    const experienceData = req.body;
    
    // 必須フィールドの検証
    if (!experienceData.title || !experienceData.description || !experienceData.price) {
      return res.status(400).json({ error: 'Title, description and price are required' });
    }
    
    // 体験データの作成
    const newExperienceData = {
      ...experienceData,
      attenderId: id,
      status: 'pending', // 最初は審査のためpending
      averageRating: 0,
      reviewCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // データベースに保存
    const newExperienceRef = await admin.firestore().collection('experiences').add(newExperienceData);
    
    // 管理者への通知
    await admin.firestore().collection('adminNotifications').add({
      type: 'new_experience',
      title: '新しい体験が登録されました',
      message: `${attender.name}さんが新しい体験「${experienceData.title}」を登録しました。確認してください。`,
      experienceId: newExperienceRef.id,
      attenderId: id,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ 
      id: newExperienceRef.id,
      message: 'Experience created successfully'
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

export default router;