import { Timestamp } from 'firebase/firestore';

export interface Message {
  id: string;
  user_id: string;
  user_message: string;
  assistant_response: string;
  created_at: Timestamp | null;
}

export interface UserProfile {
  roles: string[];
  interests: string[];
  goals: string[];
  pain_points: string[];
  preferences: Record<string, unknown>;
  updated_at?: Timestamp | null;
}
