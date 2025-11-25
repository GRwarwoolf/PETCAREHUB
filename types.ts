

export enum ViewState {
  LANGUAGE_SELECT = 'LANGUAGE_SELECT',
  WELCOME = 'WELCOME',
  PET_ID = 'PET_ID',
  DASHBOARD = 'DASHBOARD',
  BREED_INFO = 'BREED_INFO',
  TRAINING = 'TRAINING',
  NUTRITION = 'NUTRITION',
  SPECIAL_TRAITS = 'SPECIAL_TRAITS',
  ACTIVITY_IDEAS = 'ACTIVITY_IDEAS',
  VET_TIPS = 'VET_TIPS',
  HEALTH_LOG = 'HEALTH_LOG',
  COMMUNITY = 'COMMUNITY',
  PROFILE = 'PROFILE',
  LEGAL = 'LEGAL',
  AI_CHAT = 'AI_CHAT'
}

export type Language = 'en' | 'el';

export interface Pet {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  species: 'Dog' | 'Cat' | 'Other';
  breed: string;
  photoUrl: string; // Base64
}

export type HealthRecordType = 'Vaccine' | 'Vet Visit' | 'Medication' | 'Symptom' | 'Other';

export interface HealthRecord {
  id: string;
  date: string;
  type: HealthRecordType;
  title: string;
  note: string;
}

export interface WeightRecord {
  id: string;
  date: string;
  weight: number; // in kg
  note?: string;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  user: string;
  petName: string;
  imageUrl: string; // Base64 or URL
  caption: string;
  likes: number;
  isLiked: boolean; // Track if current user liked it
  commentsList: Comment[]; // Array of actual comments
  breedTag?: string;
  timestamp: number;
  isUserPost: boolean;
}

export interface TrainingGuide {
  title: string;
  goal: string;
  requirements: string[];
  steps: string[];
  tips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageUrl?: string;
  timestamp: number;
}