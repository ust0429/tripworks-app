import React from 'react';
import { ProjectType } from '../../types/community';
import { IconProps } from '../../types/common';
import { useNavigate } from 'react-router-dom';

interface CommunityProjectProps {
  project: ProjectType;
}

const CommunityProject: React.FC<CommunityProjectProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/community/project/${project.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-32 bg-gray-100 relative flex items-center justify-center">
        {project.imageUrl ? (
          <img 
            src={project.imageUrl} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          project.icon && React.isValidElement(project.icon) && 
            React.cloneElement(project.icon as React.ReactElement<IconProps>, { size: 48, className: "text-gray-300" })
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
          <p className="text-white font-medium">{project.title}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600">{project.location}</div>
          <div className={`text-xs py-1 px-2 rounded-full ${
            project.status === '進行中' 
              ? 'bg-green-100 text-green-800' 
              : project.status === '計画中'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-blue-100 text-blue-800'
          }`}>
            {project.status}
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{project.description}</p>
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
  );
};

export default CommunityProject;