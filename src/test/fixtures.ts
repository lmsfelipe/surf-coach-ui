import type { Session as SupabaseSession } from '@supabase/supabase-js';
import type {
  Exercise,
  Media,
  Profile,
  Review,
  Session,
  Surfboard,
  TrainingPlan,
  Workout,
} from '@/types/api';

export const makeProfile = (o: Partial<Profile> = {}): Profile => ({
  id: 'p1',
  email: 'surfer@example.com',
  surfLevel: 'intermediate',
  heightCm: 180,
  weightKg: 75,
  name: 'Surfista',
  gender: 'male',
  birthday: '1995-06-15',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...o,
});

export const makeSurfboard = (o: Partial<Surfboard> = {}): Surfboard => ({
  id: 'b1',
  profileId: 'p1',
  boardType: 'shortboard',
  boardSize: 6.2,
  volume: 28.5,
  label: 'Daily driver',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...o,
});

export const makeSession = (o: Partial<Session> = {}): Session => ({
  id: 's1',
  profileId: 'p1',
  sessionDate: '2026-05-20',
  location: 'Maresias',
  waveSize: 1.4,
  surfboardId: 'b1',
  notes: null,
  createdAt: '2026-05-20T14:00:00Z',
  updatedAt: '2026-05-20T14:00:00Z',
  ...o,
});

export const makeReview = (o: Partial<Review> = {}): Review => ({
  id: 'r1',
  sessionId: 's1',
  profileId: 'p1',
  status: 'completed',
  errorMessage: null,
  narrative: 'Boa sessão, bom fluxo nas manobras.',
  improvementTips: ['Abaixe o centro de gravidade', 'Olhe para onde quer ir', 'Pratique o drop'],
  scoreFlow: 7.2,
  scoreDrop: 6.8,
  scoreBalance: 7.5,
  scoreWaveSelection: 6.9,
  scoreManeuvers: 7.1,
  scoreArms: 6.5,
  overallScore: 7,
  aiModelVersion: 'gpt-review-v1',
  createdAt: '2026-05-20T15:00:00Z',
  ...o,
});

export const makeMedia = (o: Partial<Media> = {}): Media => ({
  id: 'm1',
  sessionId: 's1',
  mediaType: 'image',
  contentUrl: '/api/v1/media/m1/content?token=t',
  fileName: 'wave1.jpg',
  fileSizeBytes: 123456,
  durationSeconds: null,
  createdAt: '2026-05-20T14:05:00Z',
  ...o,
});

export const makeExercise = (o: Partial<Exercise> = {}): Exercise => ({
  id: 'ex1',
  sequenceNumber: 1,
  name: 'Prancha',
  description: 'Fortalecimento do core para pop-up mais rápido.',
  sets: 3,
  reps: '45s',
  videoUrl: null,
  createdAt: '2026-05-21T10:00:00Z',
  ...o,
});

export const makeWorkout = (o: Partial<Workout> = {}): Workout => ({
  id: 'w1',
  planId: 'plan1',
  sequenceNumber: 1,
  title: 'Dia 1 — Core & equilíbrio',
  focusArea: 'core',
  createdAt: '2026-05-21T10:00:00Z',
  exercises: [makeExercise()],
  ...o,
});

export const makeTrainingPlan = (o: Partial<TrainingPlan> = {}): TrainingPlan => ({
  id: 'plan1',
  reviewId: 'r1',
  profileId: 'p1',
  status: 'completed',
  errorMessage: null,
  generatedBy: 'ai',
  aiModelVersion: 'gpt-plan-v1',
  createdAt: '2026-05-21T10:00:00Z',
  workouts: [makeWorkout()],
  ...o,
});

/** Supabase session shaped for the auth store; mirrors authStore.test.ts. */
export const makeAuthSession = (userId = 'user-a'): SupabaseSession =>
  ({ access_token: `token-${userId}`, user: { id: userId } }) as SupabaseSession;
