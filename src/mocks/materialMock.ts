/**
 * Material-UI のモックコンポーネント
 * 実際のプロジェクトでは @mui/material パッケージをインストールして使用してください
 */
import React from 'react';

// シンプルなコンポーネントファクトリ関数
const createComponent = (name: string) => {
  return ({ children, ...props }: any) => {
    return React.createElement('div', { 
      'data-component': name, 
      ...props 
    }, children);
  };
};

// Paper
export const Paper = createComponent('Paper');

// Typography
export const Typography = createComponent('Typography');

// Button
export const Button = createComponent('Button');

// TextField
export const TextField = createComponent('TextField');

// Grid
export const Grid = createComponent('Grid');

// Box
export const Box = createComponent('Box');

// Avatar
export const Avatar = createComponent('Avatar');

// Badge
export const Badge = createComponent('Badge');

// CircularProgress
export const CircularProgress = createComponent('CircularProgress');

// FormControlLabel
export const FormControlLabel = createComponent('FormControlLabel');

// Switch
export const Switch = createComponent('Switch');

// Slider
export const Slider = createComponent('Slider');

// Chip
export const Chip = createComponent('Chip');

// Tab
export const Tab = createComponent('Tab');

// Tabs
export const Tabs = createComponent('Tabs');

// Alert
export const Alert = createComponent('Alert');

// Card
export const Card = createComponent('Card');

// CardContent
export const CardContent = createComponent('CardContent');

// CardMedia
export const CardMedia = createComponent('CardMedia');

// CardActions
export const CardActions = createComponent('CardActions');

// List
export const List = createComponent('List');

// ListItem
export const ListItem = createComponent('ListItem');

// ListItemIcon
export const ListItemIcon = createComponent('ListItemIcon');

// ListItemText
export const ListItemText = createComponent('ListItemText');

// Divider
export const Divider = createComponent('Divider');

// Rating
export const Rating = createComponent('Rating');

// LinearProgress
export const LinearProgress = createComponent('LinearProgress');

// ImageList
export const ImageList = createComponent('ImageList');

// ImageListItem
export const ImageListItem = createComponent('ImageListItem');

// Menu
export const Menu = createComponent('Menu');

// MenuItem
export const MenuItem = createComponent('MenuItem');

// IconButton
export const IconButton = createComponent('IconButton');

// InputAdornment
export const InputAdornment = createComponent('InputAdornment');

// Autocomplete
export const Autocomplete = createComponent('Autocomplete');

// Stepper
export const Stepper = createComponent('Stepper');

// Step
export const Step = createComponent('Step');

// StepLabel
export const StepLabel = createComponent('StepLabel');

// ButtonGroup
export const ButtonGroup = createComponent('ButtonGroup');

// Table
export const Table = createComponent('Table');

// TableHead
export const TableHead = createComponent('TableHead');

// TableBody
export const TableBody = createComponent('TableBody');

// TableRow
export const TableRow = createComponent('TableRow');

// TableCell
export const TableCell = createComponent('TableCell');

// TableContainer
export const TableContainer = createComponent('TableContainer');

// エクスポート
export default {
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Box,
  Avatar,
  Badge,
  CircularProgress,
  FormControlLabel,
  Switch,
  Slider,
  Chip,
  Tab,
  Tabs,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Rating,
  LinearProgress, 
  ImageList,
  ImageListItem,
  Menu,
  MenuItem,
  IconButton,
  InputAdornment,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  ButtonGroup,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
};
