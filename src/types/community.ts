import { ReactElement } from 'react';
import { IconProps } from './common';

export interface ProjectType {
  id: string | number;
  title: string;
  location: string;
  status: '進行中' | '計画中' | '完了' | '募集中';
  description: string;
  progress: number;
  icon?: ReactElement<IconProps>; // 更新: IconPropsを使用
  imageUrl?: string;
  goal?: number;
  currentAmount?: number;
  startDate?: string;
  endDate?: string;
  organizer?: string;
  supporterCount?: number;
  category?: string;
  tags?: string[];
  updates?: ProjectUpdateType[];
  galleryImages?: string[];
}

export interface ProjectUpdateType {
  id: string | number;
  date: string;
  title: string;
  content: string;
  images?: string[];
  author: string;
}

export interface ContributionType {
  id: string | number;
  amount: number;
  date: string;
  projectId: string | number;
  projectTitle: string;
  projectImage?: string;
}

export interface VolunteerType {
  id: string | number;
  title: string;
  location: string;
  date: string;
  time: string;
  organizer: string;
  description: string;
  requiredPeople: number;
  currentPeople: number;
  imageUrl?: string;
  icon?: ReactElement<IconProps>; // 更新: IconPropsを使用
  category?: string;
}

export interface UserContributionStat {
  totalAmount: number;
  nextLevelAmount: number;
  level: number;
  projectsSupported: number;
  nextMilestone: number;
}
