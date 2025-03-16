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