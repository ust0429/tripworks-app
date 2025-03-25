// src/components/screens/CommunityScreen.tsx
import React, { useState, useEffect } from 'react';
import { Hammer, ShoppingBag, Paintbrush, Landmark, Search, Plus, Navigation, Filter } from 'lucide-react';
import { ProjectType, VolunteerType, UserContributionStat } from '../../types/community';
import CommunityProject from '../community/CommunityProject';
import ContributionCard from '../community/ContributionCard';
import VolunteerCard from '../community/VolunteerCard';
import { useNavigate } from 'react-router-dom';

const CommunityScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // ユーザーの貢献統計
  const userContributionStat: UserContributionStat = {
    totalAmount: 2850,
    nextLevelAmount: 4000,
    level: 2,
    projectsSupported: 3,
    nextMilestone: 5000
  };
  
  // コミュニティプロジェクトのサンプルデータ
  const communityProjects: ProjectType[] = [
    {
      id: 1,
      title: '伝統工芸の継承プロジェクト',
      location: '京都市',
      status: '進行中',
      description: '地域の若手職人を支援し、伝統技術を次世代に継承するためのワークショップや展示会を開催します。若い世代に伝統工芸の魅力を伝え、新たな担い手を育成することを目指しています。',
      progress: 65,
      icon: <Hammer size={24} />,
      currentAmount: 650000,
      goal: 1000000,
      supporterCount: 42,
      startDate: '2024年6月1日',
      endDate: '2024年8月31日',
      tags: ['伝統工芸', '技術継承', '文化保全', 'ワークショップ'],
      category: 'culture'
    },
    {
      id: 2,
      title: '商店街活性化プロジェクト',
      location: '神戸市',
      status: '計画中',
      description: 'シャッター街となりつつある商店街に若手クリエイターを誘致し、新しい魅力を創出するプロジェクト。空き店舗をクリエイティブスペースとして再利用し、地域の活気を取り戻します。',
      progress: 30,
      icon: <ShoppingBag size={24} />,
      currentAmount: 280000,
      goal: 800000,
      supporterCount: 28,
      startDate: '2024年7月15日',
      tags: ['商店街', '地域活性化', 'クリエイター支援'],
      category: 'business'
    },
    {
      id: 3,
      title: '地域アートフェスティバル',
      location: '福岡市',
      status: '進行中',
      description: '地域の歴史的建造物や公共スペースを活用した現代アートの展示イベント。地元のアーティストと国際的なクリエイターが協力し、街全体を美術館に変えます。',
      progress: 80,
      icon: <Paintbrush size={24} />,
      currentAmount: 1200000,
      goal: 1500000,
      supporterCount: 76,
      startDate: '2024年5月1日',
      endDate: '2024年9月30日',
      tags: ['アート', 'フェスティバル', '文化交流'],
      category: 'art'
    },
    {
      id: 4,
      title: '歴史的建造物保存活動',
      location: '金沢市',
      status: '進行中',
      description: '老朽化が進む歴史的価値のある建造物を保存・修復するプロジェクト。地域の観光資源としても活用できるよう、修復後の活用方法も検討しています。',
      progress: 50,
      icon: <Landmark size={24} />,
      currentAmount: 950000,
      goal: 2000000,
      supporterCount: 105,
      startDate: '2024年4月1日',
      endDate: '2024年12月31日',
      tags: ['歴史', '建築', '保存', '観光'],
      category: 'heritage'
    }
  ];

  // ボランティア募集のサンプルデータ
  const volunteers: VolunteerType[] = [
    {
      id: 101,
      title: '海岸清掃ボランティア',
      location: '神奈川県湘南',
      date: '2024年7月20日',
      time: '9:00〜12:00',
      organizer: '湘南環境保全の会',
      description: '美しい海岸を守るための清掃活動です。ごみ袋と軍手は主催者側で用意します。',
      requiredPeople: 30,
      currentPeople: 18,
      icon: <Navigation size={24} />,
      category: '環境保全'
    },
    {
      id: 102,
      title: '夏祭り運営スタッフ',
      location: '東京都墨田区',
      date: '2024年8月5日-6日',
      time: '16:00〜21:00',
      organizer: '墨田区商店街連合会',
      description: '地域の夏祭りを一緒に盛り上げてくれるスタッフを募集します。屋台の運営補助や会場案内などをお願いします。',
      requiredPeople: 50,
      currentPeople: 35,
      category: 'イベント'
    },
    {
      id: 103,
      title: '子ども向け工作教室サポート',
      location: '大阪市北区',
      date: '2024年7月15日',
      time: '13:00〜16:00',
      organizer: '大阪こどもクリエイティブ',
      description: '夏休みの子ども向け工作教室のサポートスタッフを募集します。子どもたちの創作活動をサポートしてください。',
      requiredPeople: 15,
      currentPeople: 6,
      category: '教育支援'
    }
  ];
  
  // カテゴリーによるフィルタリング
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    // 読み込み状態のシミュレーション
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  
  // フィルタリングされたプロジェクト
  const filteredProjects = activeFilter === 'all' 
    ? communityProjects 
    : communityProjects.filter(project => project.category === activeFilter);
  
  const handleViewContributionHistory = () => {
    navigate('/community/contribution-history');
  };
  
  const handleViewAllVolunteers = () => {
    navigate('/community/volunteers');
  };
  
  const handleViewAllProjects = () => {
    navigate('/community/projects');
  };
  
  useEffect(() => {
    // 本来はここでプロジェクトデータをAPIから取得する
    // fetchProjects();
  }, []);
  
  return (
    <div className="pb-16 space-y-6">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold mb-3">地域コミュニティ</h1>
        
        {/* 検索バー */}
        <div className="relative">
          <input 
            type="text"
            placeholder="プロジェクトを検索..."
            className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        {/* フィルター */}
        <div className="flex overflow-x-auto space-x-2 mt-3 no-scrollbar">
          <button 
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              activeFilter === 'all' ? 'bg-black text-white' : 'bg-white border border-gray-300'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            すべて
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              activeFilter === 'culture' ? 'bg-black text-white' : 'bg-white border border-gray-300'
            }`}
            onClick={() => handleFilterChange('culture')}
          >
            文化・伝統
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              activeFilter === 'business' ? 'bg-black text-white' : 'bg-white border border-gray-300'
            }`}
            onClick={() => handleFilterChange('business')}
          >
            商店街・ビジネス
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              activeFilter === 'art' ? 'bg-black text-white' : 'bg-white border border-gray-300'
            }`}
            onClick={() => handleFilterChange('art')}
          >
            アート
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              activeFilter === 'heritage' ? 'bg-black text-white' : 'bg-white border border-gray-300'
            }`}
            onClick={() => handleFilterChange('heritage')}
          >
            歴史・建造物
          </button>
        </div>
      </div>
      
      <div className="px-4 space-y-8">
        {/* 貢献カード */}
        <ContributionCard 
          contributionStat={userContributionStat}
          onViewHistory={handleViewContributionHistory}
        />
        
        {/* サポート中のプロジェクト */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">サポート中のプロジェクト</h2>
            <button 
              className="text-sm text-black font-medium"
              onClick={handleViewAllProjects}
            >
              すべて見る
            </button>
          </div>
          
          {loading ? (
            <div className="py-8 text-center text-gray-500">読み込み中...</div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <CommunityProject key={project.id} project={project} />
                ))
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 mb-3">選択したカテゴリーのプロジェクトが見つかりません</p>
                  <button 
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                    onClick={() => handleFilterChange('all')}
                  >
                    すべてのプロジェクトを表示
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button 
            className="w-full mt-4 py-2 border border-black text-black rounded-lg flex items-center justify-center"
            onClick={() => navigate('/community/create-project')}
          >
            <Plus size={18} className="mr-1" />
            プロジェクトを提案する
          </button>
        </div>
        
        {/* ボランティア募集 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">ボランティア募集</h2>
            <button 
              className="text-sm text-black font-medium"
              onClick={handleViewAllVolunteers}
            >
              すべて見る
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {volunteers.slice(0, 3).map(volunteer => (
              <VolunteerCard 
                key={volunteer.id} 
                volunteer={volunteer} 
                variant="compact" 
              />
            ))}
          </div>
        </div>
        
        {/* ボランティア募集バナー */}
        <div className="bg-gradient-to-r from-gray-800 to-black rounded-lg p-4 text-white">
          <h3 className="font-bold text-lg mb-2">地域イベントを一緒に創る</h3>
          <p className="text-sm mb-3">
            あなたのスキルや時間を活かして、地域の祭りやイベントを一緒に盛り上げませんか？様々な形での参加を募集しています。
          </p>
          <button 
            className="bg-white text-black font-medium py-2 px-4 rounded-lg text-sm"
            onClick={handleViewAllVolunteers}
          >
            参加可能なボランティアを見る
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityScreen;