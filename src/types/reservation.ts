import { Experience } from './experience';
import { User } from './user';

export interface CancellationPolicy {
  id: string;
  hoursBeforeDeadline: number;
  refundPercentage: number;
  description: string;
}

export interface Reservation {
  id: string;
  user: User;
  experience: Experience;
  dateTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  cancellationPolicy?: CancellationPolicy;
  paymentMethod: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  hasReview: boolean;
}