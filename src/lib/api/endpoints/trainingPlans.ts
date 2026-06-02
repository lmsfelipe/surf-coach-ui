import { api } from '../client';
import type { CreateTrainingPlanPayload, TrainingPlan, Workout } from '@/types/api';

export const trainingPlansApi = {
  /** May 404 until a plan is generated for the review. */
  byReview: (reviewId: string) =>
    api.get<TrainingPlan>(`/api/v1/reviews/${reviewId}/training-plan`),
  detail: (planId: string) => api.get<TrainingPlan>(`/api/v1/training-plans/${planId}`),
  workout: (workoutId: string) => api.get<Workout>(`/api/v1/workouts/${workoutId}`),
  /** Slow AI call (5–20s) — explicit pending UI. */
  create: (payload: CreateTrainingPlanPayload) =>
    api.post<TrainingPlan>('/api/v1/training-plans', payload),
  // NOTE: GET /api/v1/training-plans (list) is a pending backend dependency
  // for the Treinos tab (Overview §13). Add `list()` once it ships.
};
