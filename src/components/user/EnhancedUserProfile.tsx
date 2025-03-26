import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUserProfile, 
  updateUserProfile 
} from '../../services/userService';
import { 
  User as UserIcon, 
  Camera, 
  Check, 
  Loader, 
  ChevronRight, 
  Star, 
  Clock, 
  Calendar, 
  Edit, 
  Plus, 
  Shield, 
  CheckCircle, 
  XCircle,
  Settings,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import FileUploader from '../common/FileUploader';
import { User } from '../../types/user';
import { useAuth } from '../../AuthComponents';
import { ProfileCompletionScore } from '../attender/profile';
import { getAttenderProfile } from '../../services/AttenderService';
import { AttenderProfile } from '../../types/attender/profile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Badge } from '../ui/badge';

const EnhancedUserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [attenderProfile, setAttenderProfile] = useState<AttenderProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  
  // 編集用のフォーム状態
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    location: '',
    interests: [] as string[],
    profileImage: '',
  });

  // 興味カテゴリーのリスト
  const interestCategories = [
    'アート・クラフト', '料理・グルメ', '音楽・ライブ', 
    '伝統文化', '自然・アウトドア', '地元の歴史',
    'サブカルチャー', 'スポーツ・体験', 'フェス・イベント'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ユーザープロフィールの取得
        const userData = await getUserProfile();
        setUser(userData);
        
        // フォームデータを初期化
        setFormData({
          displayName: userData.displayName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          bio: userData.bio || '',
          location: userData.location || '',
          interests: userData.interests || [],
          profileImage: userData.profileImage || '',
        });
        
        // アテンダープロフィールの取得（アテンダーの場合）
        if (userData.isAttender && authUser?.id) {
          try {
            const attenderData = await getAttenderProfile(authUser.id);
            setAttenderProfile(attenderData);
          } catch (err) {
            console.error('Failed to fetch attender profile:', err);
          }
        }
      } catch (err) {
        setError('プロフィールデータの取得に失敗しました。');
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInterestToggle = (interest: string) => {
    const updatedInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    setFormData({ ...formData, interests: updatedInterests });
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, profileImage: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await updateUserProfile(formData);
      setSuccess(true);
      setEditMode(false);
      
      // 更新されたユーザー情報を反映
      setUser({
        ...user as User,
        ...formData
      });
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('プロフィールの更新に失敗しました。後でもう一度お試しください。');
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeAttender = () => {
    navigate('/attender/info');
  };

  const handleCreateExperience = () => {
    navigate('/experiences/create');
  };

  const handleEditAttenderProfile = () => {
    navigate('/attender/profile/edit');
  };

  const handleManageExperiences = () => {
    navigate('/attender/experiences');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex justify-center text-mono-dark">
        <Loader className="w-8 h-8 animate-spin text-mono-gray-light" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-mono-dark">
        <div className="bg-mono-lighter p-4 rounded-lg text-mono-dark border border-mono-gray-light">
          ユーザー情報が見つかりませんでした。
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-mono-black text-mono-white rounded-lg"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  // プロフィール情報表示コンポーネント
  const ProfileView = () => (
    <div className="bg-mono-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 mr-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-mono-gray-light">
                <UserIcon className="w-10 h-10" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-mono-black">{user.displayName}</h2>
            <p className="text-mono-gray-medium">{user.email}</p>
            <p className="text-mono-gray-light text-sm mt-1">{user.location || 'ロケーション未設定'}</p>
          </div>
        </div>
        <button
          onClick={() => setEditMode(true)}
          className="px-4 py-2 flex items-center gap-2 bg-mono-lighter hover:bg-mono-light rounded-lg text-sm text-mono-dark"
        >
          <Edit size={16} />
          <span>編集</span>
        </button>
      </div>

      {user.bio && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-mono-black">自己紹介</h3>
          <p className="text-mono-gray-dark">{user.bio}</p>
        </div>
      )}

      {user.interests && user.interests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">興味・関心</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map(interest => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setEditMode(true)}
          className="text-mono-black hover:text-mono-gray-dark text-sm flex items-center gap-1"
        >
          <Edit size={14} />
          <span>プロフィールを編集</span>
        </button>
      </div>
    </div>
  );

  // アテンダー情報セクション
  const AttenderSection = () => {
    if (!user.isAttender) {
      return (
        <div className="bg-mono-white rounded-lg shadow p-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="bg-mono-lighter rounded-full p-3">
              <Star className="w-8 h-8 text-mono-black" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-mono-black">アテンダーになる</h3>
              <p className="text-mono-gray-dark mb-4">
                あなたの知識や経験を活かして、特別な体験を提供しませんか？
                アテンダーになると、自分のペースで活動でき、追加収入も得られます。
              </p>
              <button
                onClick={handleBecomeAttender}
                className="px-4 py-2 bg-mono-black text-mono-white rounded-lg hover:bg-mono-dark transition flex items-center gap-2"
              >
                <span>詳細を見る</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-mono-lighter">
            <TabsTrigger value="profile" onClick={() => setActiveTab('profile')}>
              プロフィール
            </TabsTrigger>
            <TabsTrigger value="experiences" onClick={() => setActiveTab('experiences')}>
              体験プラン
            </TabsTrigger>
            <TabsTrigger value="stats" onClick={() => setActiveTab('stats')}>
              統計情報
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6 bg-mono-white">
            {attenderProfile ? (
              <div className="bg-mono-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-mono-black">アテンダープロフィール</h3>
                  <div className="flex gap-2">
                    {attenderProfile.verified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>認証済み</span>
                      </Badge>
                    )}
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>評価 {attenderProfile.rating || '未評価'}</span>
                    </Badge>
                  </div>
                </div>

                {/* プロフィール完成度スコア */}
                <ProfileCompletionScore profile={attenderProfile} showSuggestion={true} />
                

                <div className="mt-6 space-y-4">
                  {attenderProfile.specialties && attenderProfile.specialties.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">専門分野</h4>
                      <div className="flex flex-wrap gap-2">
                        {attenderProfile.specialties.map(specialty => (
                          <Badge key={specialty} variant="outline">{specialty}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {attenderProfile.background && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">経歴</h4>
                      <p className="text-gray-600">{attenderProfile.background}</p>
                    </div>
                  )}
                </div>
                
                {attenderProfile && attenderProfile.completionScore && attenderProfile.completionScore < 50 && (
                  <div className="mt-4 bg-mono-lighter p-4 rounded-lg border border-mono-light">
                    <h4 className="font-semibold text-mono-black flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      プロフィール完成度が低い状態です
                    </h4>
                    <p className="text-sm text-mono-gray-dark mt-1">
                      プロフィールの完成度が高いアテンダーは、予約率が最大2倍になる傾向があります。下記の「アテンダープロフィールを編集」ボタンから詳細情報を入力しましょう。
                    </p>
                  </div>
                )}
                
                <div className="mt-6">
                  <button
                    onClick={handleEditAttenderProfile}
                    className="px-4 py-2 bg-mono-black text-mono-white rounded-lg hover:bg-mono-dark transition flex items-center gap-2"
                  >
                    <Edit size={16} />
                    <span>アテンダープロフィールを編集</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <div className="bg-blue-100 rounded-full p-3 inline-block mb-3">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">アテンダープロフィールを作成しましょう</h3>
                  <p className="text-mono-gray-medium mb-4">
                    アテンダー登録は完了しました。アテンダープロフィールを作成して、あなたの体験を提供しましょう。
                  </p>
                  <button
                    onClick={handleEditAttenderProfile}
                    className="px-4 py-2 bg-mono-black text-mono-white rounded-lg hover:bg-mono-dark transition flex items-center gap-2 mx-auto"
                  >
                    <Edit size={16} />
                    <span>プロフィールを作成する</span>
                  </button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="experiences" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">あなたの体験プラン</h3>
              
              {attenderProfile && attenderProfile.experienceSamples && attenderProfile.experienceSamples.length > 0 ? (
                <div className="space-y-4">
                  {attenderProfile.experienceSamples.map((sample, index) => (
                    <div key={sample.id} className="flex border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden mr-4 flex-shrink-0">
                        {sample.imageUrl ? (
                          <img 
                            src={sample.imageUrl} 
                            alt={sample.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Camera className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">{sample.title}</h4>
                        <p className="text-sm text-gray-600">{sample.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          {sample.duration && (
                            <span className="flex items-center mr-3">
                              <Clock className="w-3 h-3 mr-1" />
                              {sample.duration}分
                            </span>
                          )}
                          {sample.price && (
                            <span className="mr-3">¥{sample.price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    まだ体験プランを登録していません。新しい体験プランを作成しましょう。
                  </p>
                </div>
              )}
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleCreateExperience}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>新規プラン作成</span>
                </button>
                
                {attenderProfile && attenderProfile.experienceSamples && attenderProfile.experienceSamples.length > 0 && (
                  <button
                    onClick={handleManageExperiences}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    プラン一覧を見る
                  </button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">統計情報</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">リクエスト数</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">体験回数</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">獲得レビュー</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
              
              <div className="text-center py-4">
                <p className="text-gray-600">
                  アテンダーとしての活動を始めると、ここに統計情報が表示されます。
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // 設定リンクセクション
  const SettingsLinks = () => (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-xl font-bold mb-4">設定</h3>
      
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => navigate('/account-settings')} 
            className="w-full text-left p-3 flex items-center justify-between rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-gray-500 mr-3" />
              <span>アカウント設定</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigate('/payment-settings')} 
            className="w-full text-left p-3 flex items-center justify-between rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-gray-500 mr-3" />
              <span>支払い方法</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigate('/messages')} 
            className="w-full text-left p-3 flex items-center justify-between rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 text-gray-500 mr-3" />
              <span>メッセージ</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigate('/trips')} 
            className="w-full text-left p-3 flex items-center justify-between rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-3" />
              <span>予約履歴</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">マイページ</h1>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded-lg text-green-700 mb-6 flex items-center">
          <Check className="w-5 h-5 mr-2" />
          プロフィールを更新しました
        </div>
      )}
      
      {editMode ? (
        // 編集モード表示
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">プロフィール編集</h2>
            
            {/* プロフィール画像 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロフィール画像
              </label>
              
              <div className="flex items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mr-4">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="プロフィール"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                </div>
                
                <FileUploader
                  onUploadComplete={handleImageUpload}
                  acceptedFileTypes="image/*"
                  buttonLabel="画像を変更"
                />
              </div>
            </div>
            
            {/* 名前 */}
            <div className="mb-4">
              <label 
                htmlFor="displayName" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                名前
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Eメール */}
            <div className="mb-4">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Eメール
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* 電話番号 */}
            <div className="mb-4">
              <label 
                htmlFor="phoneNumber" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                電話番号
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* 居住地 */}
            <div className="mb-4">
              <label 
                htmlFor="location" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                居住地
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* 自己紹介 */}
            <div className="mb-6">
              <label 
                htmlFor="bio" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                自己紹介
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>
            
            {/* 興味・関心 */}
            <div className="mb-6">
              <span className="block text-sm font-medium text-gray-700 mb-2">
                興味・関心
              </span>
              
              <div className="flex flex-wrap gap-2">
                {interestCategories.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.interests.includes(interest)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            
            {/* ボタン */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    保存中...
                  </>
                ) : (
                  '変更を保存'
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        // 表示モード
        <>
          <ProfileView />
          <AttenderSection />
          <SettingsLinks />
        </>
      )}
    </div>
  );
};

export default EnhancedUserProfile;
