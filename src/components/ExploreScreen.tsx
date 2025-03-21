// src/components/ExploreScreen.tsx
import React from 'react';
import Explore from './explore';
import { AttenderType, ExperienceType } from '../types';
import { Music, Camera, Coffee, Hammer, Utensils, MapPin, Map, Users } from 'lucide-react';

// 明示的な型定義
interface ExploreScreenProps {
  onAttenderClick: (id: number) => void;
  onExperienceClick?: (id: number) => void;
  attendersData: AttenderType[];
}

// サンプルデータ - 体験
const experiencesData: ExperienceType[] = [
  {
    id: 1,
    title: '音楽家と巡る 下北沢ライブハウスツアー',
    duration: '3時間',
    price: 5000,
    description: 'ローカルミュージシャンと一緒に、下北沢の歴史あるライブハウスを巡ります。各会場で内部の見学や簡単な楽器演奏体験ができます。',
    image: 'https://source.unsplash.com/random/400x300/?music,liveshow',
  },
  {
    id: 2,
    title: '街の裏側を知る 昭和レトロ商店街ツアー',
    duration: '2時間',
    price: 3500,
    description: '古き良き昭和の雰囲気が残る商店街を地元民と一緒に散策。普段は入れないお店の裏側や、商店街の歴史についてのストーリーを聞きながら、レトロな世界を体験します。',
    image: 'https://source.unsplash.com/random/400x300/?japan,showa,market',
  },
  {
    id: 3,
    title: 'クラフトビール醸造所見学と試飲体験',
    duration: '2.5時間',
    price: 6000,
    description: 'ローカルクラフトビール醸造所のマスターブリュワーと一緒に、ビール造りの過程を学びます。醸造所見学の後は、できたてのビールを複数種類試飲できます。',
    image: 'https://source.unsplash.com/random/400x300/?beer,brewery',
  },
  {
    id: 4,
    title: '路地裏アートスタジオめぐり',
    duration: '4時間',
    price: 4500,
    description: '地元アーティストと一緒に、普段は入れない路地裏のアトリエやスタジオを訪問。制作現場を見学しながら、クリエイティブな世界を体験します。',
    image: 'https://source.unsplash.com/random/400x300/?art,studio',
  },
  {
    id: 5,
    title: '朝市でプロに学ぶ 魚の目利きと料理体験',
    duration: '5時間',
    price: 8000,
    description: '早朝の魚市場で、プロの目利きを持つアテンダーと一緒に新鮮な魚介を選びます。その後、選んだ魚を使った郷土料理を一緒に作って食べる体験ができます。',
    image: 'https://source.unsplash.com/random/400x300/?fish,market,food',
  },
  {
    id: 6,
    title: '地元民と行く 夜の屋台街散策',
    duration: '3時間',
    price: 5500,
    description: '夜になると活気づく屋台街を、地元のグルメ通と一緒に巡ります。定番の屋台から隠れた名店まで、本当においしい店をガイドします。',
    image: 'https://source.unsplash.com/random/400x300/?night,food,stall',
  },
  {
    id: 7,
    title: '古民家でゆったり 伝統工芸体験',
    duration: '3.5時間',
    price: 7000,
    description: '築100年以上の古民家で、地元の職人から伝統工芸を学びます。陶芸、織物、木工など、季節に合わせた作品を作ることができます。',
    image: 'https://source.unsplash.com/random/400x300/?craft,traditional,japan',
  },
  {
    id: 8,
    title: '地元写真家と巡る インスタ映えスポット',
    duration: '4時間',
    price: 4000,
    description: 'プロの写真家と一緒に、観光ガイドには載っていない絶景スポットを巡ります。撮影テクニックも教えてもらえるので、SNS映えする写真が撮れます。',
    image: 'https://source.unsplash.com/random/400x300/?photo,instagram,spot',
  },
];

const ExploreScreen: React.FC<ExploreScreenProps> = ({ 
  onAttenderClick, 
  onExperienceClick = () => {}, 
  attendersData 
}) => {
  return (
    <Explore
      onAttenderClick={onAttenderClick}
      onExperienceClick={onExperienceClick}
      attendersData={attendersData}
      experiencesData={experiencesData}
    />
  );
};

export default ExploreScreen;