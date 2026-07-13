import { api } from '../client';
import type { CreateTrainingPlanPayload, TrainingPlan, Workout } from '@/types/api';

export const trainingPlansApi = {
  /** All plans for the current profile (Treinos tab). Response is `{ items, total }`. */
  list: async (): Promise<TrainingPlan[]> => {
    const res = await api.get<{ items: TrainingPlan[]; total: number }>(
      '/api/v1/training-plans/',
    );
    return res.items;
  },
  /** May 404 until a plan is generated for the review. */
  byReview: (reviewId: string) =>
    api.get<TrainingPlan>(`/api/v1/reviews/${reviewId}/training-plan`),
  detail: (planId: string) => api.get<TrainingPlan>(`/api/v1/training-plans/${planId}`),
  workout: (workoutId: string) => api.get<Workout>(`/api/v1/workouts/${workoutId}`),
  /** Slow AI call (5–20s) — explicit pending UI. */
  create: (payload: CreateTrainingPlanPayload) =>
    api.post<TrainingPlan>('/api/v1/training-plans', payload),
};
