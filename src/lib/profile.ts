import type { Profile } from '@/types/api';

/**
 * A profile is "complete" once the onboarding essentials are set
 * (Overview §6, decision #9). Used by the onboarding gate.
 */
export function isProfileComplete(p: Profile): boolean {
  return !!p.surfLevel && p.heightCm != null && p.weightKg != null;
}
