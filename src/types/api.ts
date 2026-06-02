/**
 * TS types mirroring the Surf Coach API data models (camelCase JSON).
 * Source: FRONTEND_INTEGRATION.md §Data Models.
 */
import type { BoardType, Gender, SurfLevel } from '@/config/constants';

export type { BoardType, Gender, SurfLevel };

export type MediaType = 'image' | 'video';
export type ISODateTime = string; // ISO 8601
export type ISODate = string; // YYYY-MM-DD

export interface Profile {
  id: string;
  email: string;
  surfLevel: SurfLevel | null;
  heightCm: number | null;
  weightKg: number | null;
  name: string | null;
  gender: Gender | null;
  birthday: ISODate | null;
  avatarUrl: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Surfboard {
  id: string;
  profileId: string;
  boardType: BoardType;
  boardSize: number; // feet
  volume: number | null; // litres
  label: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Session {
  id: string;
  profileId: string;
  sessionDate: ISODate;
  location: string;
  waveSize: number; // feet (convert to meters in UI)
  surfboardId: string | null;
  notes: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Media {
  id: string;
  sessionId: string;
  mediaType: MediaType;
  storageUrl: string;
  fileName: string;
  fileSizeBytes: number | null;
  durationSeconds: number | null;
  createdAt: ISODateTime;
}

export interface Review {
  id: string;
  sessionId: string;
  profileId: string;
  narrative: string;
  improvementTips: string[]; // exactly 3
  scoreFlow: number | null;
  scoreDrop: number | null;
  scoreBalance: number | null;
  scoreWaveSelection: number | null;
  scoreManeuvers: number | null;
  scoreArms: number | null;
  overallScore: number | null;
  aiModelVersion: string | null;
  createdAt: ISODateTime;
}

export interface Exercise {
  id: string;
  sequenceNumber: number;
  name: string;
  description: string;
  sets: number;
  reps: string;
  videoUrl: string | null;
  createdAt: ISODateTime;
}

export interface Workout {
  id: string;
  planId: string;
  sequenceNumber: number;
  title: string;
  focusArea: string;
  createdAt: ISODateTime;
  exercises: Exercise[];
}

export interface TrainingPlan {
  id: string;
  reviewId: string;
  profileId: string;
  generatedBy: string;
  aiModelVersion: string | null;
  createdAt: ISODateTime;
  workouts: Workout[];
}

// ---- Request payloads ---------------------------------------------------
export interface UpdateProfilePayload {
  name?: string;
  surfLevel?: SurfLevel;
  gender?: Gender;
  birthday?: ISODate;
  heightCm?: number;
  weightKg?: number;
  avatarUrl?: string;
}

export interface CreateSurfboardPayload {
  boardType: BoardType;
  boardSize: number;
  volume?: number;
  label?: string;
}
export type UpdateSurfboardPayload = Partial<CreateSurfboardPayload>;

export interface CreateSessionPayload {
  sessionDate: ISODate;
  location: string;
  waveSize: number; // feet (already converted from meters)
  surfboardId?: string;
  notes?: string;
}

export interface CreateReviewPayload {
  sessionId: string;
}

export interface CreateTrainingPlanPayload {
  reviewId: string;
}
