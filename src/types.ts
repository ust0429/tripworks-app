// src/types.ts
import React from 'react';

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
  icon: React.ReactElement<IconProps>; // LucideIconタイプとして修正
}

export interface ExperienceType {
  id: number;
  title: string;
  duration: string;
  price: number;
  description: string;
  image?: string;
}

export interface PastExperience {
  id: number;
  title: string;
  date: string;
  isReviewed: boolean;
  attenderId?: number; // アテンダーIDを追加
}

export interface ReviewType {
  id: number;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  userImage?: string;
}

export interface Review {
  id: string;
  attenderId: number;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  date: string;
  experienceTitle?: string;
  helpfulCount?: number;
  photoUrls?: string[]; // レビューに添付された写真のURL
  replyCount?: number;  // このレビューに対する返信数
  reportCount?: number; // このレビューに対する報告数
}

// レビューの「役に立った」記録の型定義
export interface ReviewHelpful {
  reviewId: string;
  userId: string;
  helpful: boolean;
  createdAt: string;
}

// レビュー写真の型定義
export interface ReviewPhoto {
  id: string;
  reviewId: string;
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  createdAt: string;
}

// レビュー返信の型定義
export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  userType: 'attender' | 'user' | 'admin';
  userImage?: string;
  content: string;
  date: string;
}

// レビュー報告の型定義
export interface ReviewReport {
  id: string;
  reviewId: string;
  userId: string;
  reason: string;
  detail?: string;
  status: 'pending' | 'reviewed' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
}

// 添付ファイル関連の型定義
export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'location' | 'date';
  url?: string;
  name?: string;
  size?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  date?: {
    start: string;
    end?: string;
    title?: string;
  };
}

// メッセージステータスの列挙型
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// メッセージ関連の型定義
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  status?: MessageStatus;
  attachments?: MessageAttachment[];
  // 後方互換性のため残す
  attachmentUrl?: string;
  attachmentType?: 'image' | 'location' | 'file';
  // グループチャット用
  conversationId?: string;
  mentions?: string[];
}

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group'
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isAdmin?: boolean;
  joinedAt: string;
}

export interface Conversation {
  id: string;
  type?: ConversationType;
  participantIds: string[];
  participants?: Participant[];
  lastMessage?: Message;
  updatedAt: string;
  unreadCount: number;
  isArchived?: boolean;
  isMuted?: boolean;
  name?: string; // グループチャットのみ
  avatar?: string; // グループチャットのみ
}

// AttenderDetailType を AttenderType から拡張して定義
export interface AttenderDetailType extends Omit<AttenderType, 'rating'> {
  rating: string;
  reviewCount: number;
  location: string;
  responseTime: string;
  languages: string[];
  about: string;
  experiences: ExperienceType[];
  reviews: ReviewType[];
  availableDates: string[];
  gallery: string[];
  specialties: string[];
}