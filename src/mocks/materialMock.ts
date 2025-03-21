/**
 * Material-UIのモックコンポーネント
 * 実際のコンポーネントがないときにビルドを通すためのモック
 */

// ダミーのコンポーネント関数
const createDummyComponent = (name: string) => {
  return ({ children, ...props }: any) => {
    console.log(`Rendering mock ${name} component`, props);
    return children || null;
  };
};

// Material-UIのコンポーネントモック
export const Box = createDummyComponent('Box');
export const Paper = createDummyComponent('Paper');
export const Typography = createDummyComponent('Typography');
export const Button = createDummyComponent('Button');
export const Grid = createDummyComponent('Grid');
export const TextField = createDummyComponent('TextField');
export const MenuItem = createDummyComponent('MenuItem');
export const Select = createDummyComponent('Select');
export const FormControl = createDummyComponent('FormControl');
export const FormHelperText = createDummyComponent('FormHelperText');
export const InputLabel = createDummyComponent('InputLabel');
export const Chip = createDummyComponent('Chip');
export const Avatar = createDummyComponent('Avatar');
export const CircularProgress = createDummyComponent('CircularProgress');
export const Table = createDummyComponent('Table');
export const TableBody = createDummyComponent('TableBody');
export const TableCell = createDummyComponent('TableCell');
export const TableContainer = createDummyComponent('TableContainer');
export const TableHead = createDummyComponent('TableHead');
export const TableRow = createDummyComponent('TableRow');
export const Alert = createDummyComponent('Alert');
export const Card = createDummyComponent('Card');
export const CardContent = createDummyComponent('CardContent');
export const CardHeader = createDummyComponent('CardHeader');
export const CardActions = createDummyComponent('CardActions');
export const IconButton = createDummyComponent('IconButton');
export const Divider = createDummyComponent('Divider');
export const Tabs = createDummyComponent('Tabs');
export const Tab = createDummyComponent('Tab');
export const Slider = createDummyComponent('Slider');
export const Switch = createDummyComponent('Switch');
export const Rating = createDummyComponent('Rating');
export const LinearProgress = createDummyComponent('LinearProgress');
export const Stepper = createDummyComponent('Stepper');
export const Step = createDummyComponent('Step');
export const StepLabel = createDummyComponent('StepLabel');
export const List = createDummyComponent('List');
export const ListItem = createDummyComponent('ListItem');
export const ListItemText = createDummyComponent('ListItemText');
export const ListItemIcon = createDummyComponent('ListItemIcon');
export const Badge = createDummyComponent('Badge');
export const Skeleton = createDummyComponent('Skeleton');
export const Autocomplete = createDummyComponent('Autocomplete');
export const Dialog = createDummyComponent('Dialog');
export const DialogTitle = createDummyComponent('DialogTitle');
export const DialogContent = createDummyComponent('DialogContent');
export const DialogActions = createDummyComponent('DialogActions');
export const ImageList = createDummyComponent('ImageList');
export const ImageListItem = createDummyComponent('ImageListItem');

export const ToggleButton = createDummyComponent('ToggleButton');
export const ToggleButtonGroup = createDummyComponent('ToggleButtonGroup');
export const FormControlLabel = createDummyComponent('FormControlLabel');
export const InputAdornment = createDummyComponent('InputAdornment');
export const CardMedia = createDummyComponent('CardMedia');
export const Menu = createDummyComponent('Menu');
export const ButtonGroup = createDummyComponent('ButtonGroup');

