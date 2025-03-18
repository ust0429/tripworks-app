// src/components/screens/CommunityScreen.tsx
import React from 'react';
import { Hammer, ShoppingBag } from 'lucide-react';

const CommunityScreen: React.FC = () => {
  // コミュニティプロジェクトのサンプルデータ
  const communityProjects = [
    {
      id: 1,
      title: '伝統工芸の継承プロジェクト',
      location: '京都市',
      status: '進行中',
      description: '地域の若手職人を支援し、伝統技術を次世代に継承するためのワークショップや展示会を開催します。',
      progress: 65,
      icon: <Hammer size={24} />
    },
    {
      id: 2,
      title: '商店街活性化プロジェクト',
      location: '神戸市',
      status: '計画中',
      description: 'シャッター街となりつつある商店街に若手クリエイターを誘致し、新しい魅力を創出するプロジェクト。',
      progress: 30,
      icon: <ShoppingBag size={24} />
    },
  ];
  
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">地域コミュニティ</h1>
      
      {/* あなたの貢献 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold mb-2">あなたの貢献</h2>
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-700">これまでの貢献額</p>
          <p className="text-xl font-bold text-black">¥2,850</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-black h-2.5 rounded-full" style={{ width: '65%' }}></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">次のレベルまで ¥1,150</p>
      </div>
      
      {/* サポート中のプロジェクト */}
      <div>
        <h2 className="text-xl font-bold mb-3">サポート中のプロジェクト</h2>
        <div className="space-y-3">
          {communityProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-32 bg-gray-100 relative flex items-center justify-center">
                {project.icon && React.cloneElement(project.icon, { size: 48, className: "text-gray-300" })}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <p className="text-white font-medium">{project.title}</p>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-600">{project.location}</div>
                  <div className="bg-gray-100 text-gray-800 text-xs py-1 px-2 rounded-full">
                    {project.status}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{project.description}</p>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>達成率</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button className="w-full py-2 bg-black text-white rounded-lg text-sm">
                  さらに貢献する
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 地域イベントボランティア */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-bold text-lg mb-2">イベントボランティア募集</h3>
        <p className="text-sm text-gray-700 mb-3">
          地域のお祭りや文化イベントのボランティアに参加して、地元住民と共に楽しみながら貢献しませんか？
        </p>
        <button className="bg-black text-white font-medium py-2 px-4 rounded-lg text-sm w-full">
          募集中のボランティアを見る
        </button>
      </div>
    </div>
  );
};

export default CommunityScreen;