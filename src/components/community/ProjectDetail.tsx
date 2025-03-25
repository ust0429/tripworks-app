import React, { useState } from 'react';
import { ChevronLeft, MapPin, Calendar, Heart, Share2, Clock, Users, Image } from 'lucide-react';
import { ProjectType, ProjectUpdateType } from '../../types/community';
import { IconProps } from '../../types/common';
import { useNavigate } from 'react-router-dom';

interface ProjectDetailProps {
  project: ProjectType;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'about' | 'updates' | 'gallery'>('about');
  const [contributionAmount, setContributionAmount] = useState(1000);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleContribute = () => {
    alert(`${contributionAmount}円の貢献を処理します`);
  };
  
  // 仮の更新情報
  const updates: ProjectUpdateType[] = project.updates || [
    {
      id: 1,
      date: '2024年6月15日',
      title: 'プロジェクト開始のお知らせ',
      content: `${project.title}が正式に始動しました。多くの地域住民やボランティアの方々にご参加いただき、第一段階の準備が整いました。今後とも応援よろしくお願いします。`,
      author: '渡辺 プロジェクトリーダー'
    },
    {
      id: 2,
      date: '2024年7月1日',
      title: '第一回ワークショップ開催報告',
      content: '先週末に開催した第一回ワークショップには20名以上の方にご参加いただきました。様々なアイデアが集まり、プロジェクトの方向性がより明確になりました。',
      author: '渡辺 プロジェクトリーダー'
    }
  ];
  
  // 仮のギャラリー画像
  const galleryImages = project.galleryImages || Array(6).fill('https://via.placeholder.com/300');
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  };
  
  return (
    <div className="pb-24">
      {/* ヘッダー */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 px-4 py-3 flex items-center border-b">
        <button onClick={handleBack} className="mr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">{project.title}</h1>
        <div className="flex space-x-2">
          <button className="w-8 h-8 flex items-center justify-center">
            <Heart size={20} className="text-gray-600" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center">
            <Share2 size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="pt-16">
        {/* プロジェクト画像 */}
        <div className="aspect-video bg-gray-100 relative">
          {project.imageUrl ? (
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {project.icon && React.isValidElement(project.icon) && 
                React.cloneElement(project.icon as React.ReactElement<IconProps>, { size: 64, className: "text-gray-300" })}
            </div>
          )}
          <div className={`absolute top-4 left-4 text-xs py-1 px-2 rounded-full ${
            project.status === '進行中' 
              ? 'bg-green-100 text-green-800' 
              : project.status === '計画中'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-blue-100 text-blue-800'
          }`}>
            {project.status}
          </div>
        </div>
        
        {/* プロジェクト基本情報 */}
        <div className="p-4">
          <h1 className="text-xl font-bold">{project.title}</h1>
          
          <div className="flex items-center mt-2 text-gray-600">
            <MapPin size={16} className="mr-1" />
            <span className="text-sm">{project.location}</span>
            {project.startDate && (
              <>
                <span className="mx-2">•</span>
                <Calendar size={16} className="mr-1" />
                <span className="text-sm">{project.startDate}</span>
              </>
            )}
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <span className="font-bold">{formatCurrency(project.currentAmount || 0)}</span>
                {project.goal && (
                  <span className="text-gray-600 text-sm ml-1">/ {formatCurrency(project.goal)}</span>
                )}
              </div>
              <span className="text-sm text-gray-600">{project.progress}% 達成</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-black h-2.5 rounded-full" 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>{project.supporterCount || 0}人が支援</span>
              {project.endDate && <span>終了日: {project.endDate}</span>}
            </div>
          </div>
          
          {/* タブ切り替え */}
          <div className="border-b mt-6">
            <div className="flex">
              <button 
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'about' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('about')}
              >
                概要
              </button>
              <button 
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'updates' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('updates')}
              >
                更新情報
              </button>
              <button 
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'gallery' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('gallery')}
              >
                ギャラリー
              </button>
            </div>
          </div>
          
          {/* タブコンテンツ */}
          <div className="mt-4">
            {activeTab === 'about' && (
              <div>
                <p className="text-gray-700">{project.description}</p>
                
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-800 text-xs py-1 px-2 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <h3 className="font-bold mb-2">このプロジェクトに貢献する</h3>
                  <div className="flex border rounded-lg overflow-hidden">
                    <button 
                      className="w-10 flex-shrink-0 flex items-center justify-center bg-gray-100"
                      onClick={() => setContributionAmount(Math.max(500, contributionAmount - 500))}
                    >
                      -
                    </button>
                    <div className="flex-1 flex items-center justify-center py-2 font-bold">
                      {formatCurrency(contributionAmount)}
                    </div>
                    <button 
                      className="w-10 flex-shrink-0 flex items-center justify-center bg-gray-100"
                      onClick={() => setContributionAmount(contributionAmount + 500)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="w-full py-3 bg-black text-white rounded-lg font-medium mt-3"
                    onClick={handleContribute}
                  >
                    この金額で貢献する
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'updates' && (
              <div className="space-y-4">
                {updates.map(update => (
                  <div key={update.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">{update.title}</h3>
                      <span className="text-xs text-gray-600">{update.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{update.content}</p>
                    {update.images && update.images.length > 0 && (
                      <div className="mt-3 flex space-x-2 overflow-x-auto">
                        {update.images.map((img, i) => (
                          <img 
                            key={i}
                            src={img}
                            alt={`Update ${i}`}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-2">投稿者: {update.author}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'gallery' && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="aspect-square rounded-md overflow-hidden">
                      <img 
                        src={img}
                        alt={`Gallery ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 固定ボタン */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 flex items-center">
        <button 
          className="flex-1 py-3 bg-black text-white rounded-lg font-medium"
          onClick={handleContribute}
        >
          このプロジェクトに貢献する
        </button>
      </div>
    </div>
  );
};

export default ProjectDetail;