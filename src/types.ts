<<<<<<< HEAD
import { ReactElement } from 'react';

export interface IconProps {
  size?: number;
  className?: string;
}

export interface AttenderType {
  id: number;
  name: string;
  type: string;
  description: string;
  rating: string;
  distance: string;
  icon: ReactElement<IconProps>;
=======
import { ReactElement } from 'react';

export interface IconProps {
  size?: number;
  className?: string;
}

export interface AttenderType {
  id: number;
  name: string;
  type: string;
  description: string;
  rating: string;
  distance: string;
  icon: ReactElement<IconProps>;
>>>>>>> 7b9c74b (初期コミット: プロジェクト基本構造)
}