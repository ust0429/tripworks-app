/**
 * Material-UI Icons のモックコンポーネント
 * 実際のプロジェクトでは @mui/icons-material パッケージをインストールして使用してください
 */
import React from 'react';

// シンプルなアイコンファクトリ関数
const createIcon = (name: string) => {
  return ({ ...props }: any) => {
    return React.createElement('span', { 
      'data-icon': name, 
      style: { 
        display: 'inline-flex', 
        width: '1em', 
        height: '1em',
        fontSize: 'inherit',
        ...props.style 
      },
      ...props 
    }, '□');
  };
};

// アイコンの定義
export const Add = createIcon('Add');
export const Edit = createIcon('Edit');
export const Delete = createIcon('Delete');
export const MoreVert = createIcon('MoreVert');
export const AccessTime = createIcon('AccessTime');
export const CalendarMonth = createIcon('CalendarMonth');
export const CalendarToday = createIcon('CalendarToday');
export const Event = createIcon('Event');
export const Person = createIcon('Person');
export const People = createIcon('People');
export const Place = createIcon('Place');
export const Money = createIcon('Money');
export const AccountBalance = createIcon('AccountBalance');
export const AccountBalanceWallet = createIcon('AccountBalanceWallet');
export const ShoppingCart = createIcon('ShoppingCart');
export const Star = createIcon('Star');
export const StarBorder = createIcon('StarBorder');
export const DateRange = createIcon('DateRange');
export const KeyboardArrowRight = createIcon('KeyboardArrowRight');
export const ChevronLeft = createIcon('ChevronLeft');
export const ChevronRight = createIcon('ChevronRight');
export const Check = createIcon('Check');
export const Close = createIcon('Close');
export const Info = createIcon('Info');
export const Warning = createIcon('Warning');
export const Error = createIcon('Error');
export const Help = createIcon('Help');
export const Settings = createIcon('Settings');
export const ExpandMore = createIcon('ExpandMore');
export const Notifications = createIcon('Notifications');
export const Search = createIcon('Search');
export const Home = createIcon('Home');
export const Dashboard = createIcon('Dashboard');
export const Visibility = createIcon('Visibility');
export const VisibilityOff = createIcon('VisibilityOff');
export const LocalOffer = createIcon('LocalOffer');
export const Public = createIcon('Public');
export const EmojiEvents = createIcon('EmojiEvents');
export const Category = createIcon('Category');
// 追加アイコン
export const FileDownload = createIcon('FileDownload');
export const TrendingUp = createIcon('TrendingUp');
export const PersonOutline = createIcon('PersonOutline');
export const LocalActivity = createIcon('LocalActivity');
export const Comment = createIcon('Comment');
export const Assignment = createIcon('Assignment');
export const MonetizationOn = createIcon('MonetizationOn');
export const CheckCircle = createIcon('CheckCircle');
export const Explore = createIcon('Explore');
export const Group = createIcon('Group');
export const AddPhotoAlternate = createIcon('AddPhotoAlternate');

// エクスポート
export default {
  Add,
  Edit,
  Delete,
  MoreVert,
  AccessTime,
  CalendarMonth,
  CalendarToday,
  Event,
  Person,
  People,
  Place,
  Money,
  AccountBalance,
  AccountBalanceWallet,
  ShoppingCart,
  Star,
  StarBorder,
  DateRange,
  KeyboardArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Close,
  Info,
  Warning,
  Error,
  Help,
  Settings,
  ExpandMore,
  Notifications,
  Search,
  Home,
  Dashboard,
  Visibility,
  VisibilityOff,
  LocalOffer,
  Public,
  EmojiEvents,
  Category,
  FileDownload,
  TrendingUp,
  PersonOutline,
  LocalActivity,
  Comment,
  Assignment,
  MonetizationOn,
  CheckCircle,
  Explore,
  Group,
  AddPhotoAlternate
};
