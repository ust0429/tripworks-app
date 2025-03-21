/**
 * Material-UI Iconsのモックコンポーネント
 * 実際のコンポーネントがないときにビルドを通すためのモック
 */

// ダミーのアイコンコンポーネント関数
const createDummyIcon = (name: string) => {
  return (props: any) => {
    console.log(`Rendering mock ${name} icon`, props);
    return null;
  };
};

// 頻繁に使用されるアイコン
export const Add = createDummyIcon('Add');
export const Delete = createDummyIcon('Delete');
export const Edit = createDummyIcon('Edit');
export const Close = createDummyIcon('Close');
export const Check = createDummyIcon('Check');
export const Send = createDummyIcon('Send');
export const Search = createDummyIcon('Search');
export const Event = createDummyIcon('Event');
export const AccessTime = createDummyIcon('AccessTime');
export const PersonOutline = createDummyIcon('PersonOutline');
export const LocalActivity = createDummyIcon('LocalActivity');
export const Comment = createDummyIcon('Comment');
export const CalendarMonth = createDummyIcon('CalendarMonth');
export const MonetizationOn = createDummyIcon('MonetizationOn');
export const CheckCircle = createDummyIcon('CheckCircle');
export const Group = createDummyIcon('Group');
export const Place = createDummyIcon('Place');
export const Money = createDummyIcon('Money');
export const Info = createDummyIcon('Info');
export const AddPhotoAlternate = createDummyIcon('AddPhotoAlternate');
export const Visibility = createDummyIcon('Visibility');
export const VisibilityOff = createDummyIcon('VisibilityOff');
export const PhotoCamera = createDummyIcon('PhotoCamera');
export const Verified = createDummyIcon('Verified');

// 追加必要なアイコン
export const Star = createDummyIcon('Star');
export const Assignment = createDummyIcon('Assignment');
export const MoreVert = createDummyIcon('MoreVert');
export const LocationOn = createDummyIcon('LocationOn');
export const NotInterested = createDummyIcon('NotInterested');
export const DateRange = createDummyIcon('DateRange');
export const FileDownload = createDummyIcon('FileDownload');
export const AccountBalanceWallet = createDummyIcon('AccountBalanceWallet');
export const TrendingUp = createDummyIcon('TrendingUp');
export const Explore = createDummyIcon('Explore');

// 特定のパスからインポートされるアイコン
export default {
  Add: createDummyIcon('Add')
};
