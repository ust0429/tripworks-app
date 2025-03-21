export interface User {
  id: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  interests: string[];
  profileImage?: string;
  isAttender: boolean;
  createdAt: string;
}