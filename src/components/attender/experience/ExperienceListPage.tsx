import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthComponents';
import { getExperiences } from '../../../services/AttenderService';
import { ChevronLeft, Plus, Clock, MapPin, Users, Calendar, Edit, Trash, MoreHorizontal, Search, Filter, Loader } from 'lucide-react';
import { ExperienceSample } from '../../../types/attender/profile';

const ExperienceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<ExperienceSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // カテゴリーのリスト
  const categories = [
    'すべて',
    'アート・クラフト', 
    '料理・グルメ', 
    '音楽・ライブ', 
    '伝統文化', 
    '自然・アウトドア', 
    '地元の歴史',
    'サブカルチャー', 
    'スポーツ・体験', 
    'フェス・イベント'
  ];

  useEffect(() => {
    const fetchExperiences = async () => {
      if (!user?.id) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }
      
      try {
        const data = await getExperiences(user.id);
        setExperiences(data);
      } catch (err) {
        setError('体験プランの取得に失敗しました');
        console.error('Failed to fetch experiences:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExperiences();
  }, [user?.id]);

  const handleCreateExperience = () => {
    navigate('/experiences/create');
  };

  const handleEditExperience = (id: string) => {
    navigate(`/experiences/${id}/edit`);
  };

  const handleViewExperience = (id: string) => {
    navigate(`/experiences/${id}`);
  };

  const handleDeleteExperience = (id: string) => {
    // TODO: 削除処理とダイアログ
    if (window.confirm('本当にこの体験プランを削除しますか？この操作は元に戻せません。')) {
      console.log('Delete experience:', id);
    }
  };

  // 検索とフィルタリング
  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = searchQuery === '' || 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      selectedCategory === 'すべて' || 
      (exp.categories && exp.categories.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/profile')}
        className="flex items-center text-gray-600 mb-6"
      >
        <ChevronLeft size={20} />
        <span>プロフィールに戻る</span>
      </button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">体験プラン一覧</h1>
        <button
          onClick={handleCreateExperience}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={18} className="mr-1" />
          新規作成
        </button>
      </div>
      
      {/* 検索・フィルターセクション */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="タイトルや説明で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Filter size={18} />
              </span>
              <select
                value={selectedCategory || 'すべて'}
                onChange={(e) => setSelectedCategory(e.target.value === 'すべて' ? null : e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredExperiences.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedCategory
              ? '検索条件に一致する体験プランはありません'
              : '体験プランがまだありません。新しく作成してみましょう！'
            }
          </p>
          {!searchQuery && !selectedCategory && (
            <button
              onClick={handleCreateExperience}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Plus size={18} className="mr-2" />
              体験プランを作成する
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExperiences.map((experience) => (
            <div 
              key={experience.id} 
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 bg-gray-200">
                {experience.imageUrl ? (
                  <img
                    src={experience.imageUrl}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    画像がありません
                  </div>
                )}
                
                <div className="absolute top-2 right-2">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const menu = document.getElementById(`menu-${experience.id}`);
                        if (menu) {
                          menu.classList.toggle('hidden');
                        }
                      }}
                      className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    
                    <div 
                      id={`menu-${experience.id}`} 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden"
                    >
                      <ul className="py-1">
                        <li>
                          <button
                            onClick={() => handleEditExperience(experience.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Edit size={14} className="mr-2" />
                            編集
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleDeleteExperience(experience.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                          >
                            <Trash size={14} className="mr-2" />
                            削除
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 
                  className="text-lg font-bold mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => handleViewExperience(experience.id)}
                >
                  {experience.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {experience.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {experience.categories && experience.categories.map((category) => (
                    <span 
                      key={category} 
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-auto">
                  {experience.duration && (
                    <div className="flex items-center mr-4">
                      <Clock size={14} className="mr-1" />
                      <span>{experience.duration}分</span>
                    </div>
                  )}
                  
                  {experience.price && (
                    <div className="mr-4">
                      ¥{experience.price.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceListPage;
