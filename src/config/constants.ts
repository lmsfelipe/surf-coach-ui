/**
 * Frontend mirrors of the API limits and enums. The server stays authoritative;
 * these exist for fast client-side feedback and pt-BR option labels.
 * Source: SPEC_FRONTEND_Overview.md §7/§8 + FRONTEND_INTEGRATION.md.
 */
import { env } from './env';

// ---- Media upload rules -------------------------------------------------
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
] as const;
export const ACCEPTED_MEDIA_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
] as const;

/** `accept` attribute value for file inputs. */
export const MEDIA_ACCEPT_ATTR = ACCEPTED_MEDIA_TYPES.join(",");

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE_BYTES = 60 * 1024 * 1024; // 60 MB
export const MAX_VIDEO_DURATION_SECONDS = 120;

// Client-side image compression before upload. Re-encodes session photos to
// JPEG, capped by longest edge + quality to cut upload time while keeping
// enough detail for the AI technique analysis.
export const IMAGE_COMPRESSION = {
  quality: 0.6,
  maxDimension: 1920, // applied to both maxWidth and maxHeight
} as const;
// Photo count per session — configurable via VITE_MIN/MAX_IMAGES_PER_SESSION
// so ops can raise/lower the cap without a code change (must match the API).
export const MIN_IMAGES_PER_SESSION = env.minImagesPerSession;
export const MAX_IMAGES_PER_SESSION = env.maxImagesPerSession; // 1 video OR up to N images

// ---- Enums + pt-BR option lists ----------------------------------------
export const SURF_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "pro",
] as const;
export type SurfLevel = (typeof SURF_LEVELS)[number];

export const SURF_LEVEL_OPTIONS: ReadonlyArray<{
  value: SurfLevel;
  label: string;
}> = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
  { value: "pro", label: "Profissional" },
];

export const BOARD_TYPES = [
  "shortboard",
  "longboard",
  "funboard",
  "bodyboard",
  "other",
] as const;
export type BoardType = (typeof BOARD_TYPES)[number];

// Surfer-English kept untranslated per StyleGuide §11.
export const BOARD_TYPE_OPTIONS: ReadonlyArray<{
  value: BoardType;
  label: string;
}> = [
  { value: "shortboard", label: "Shortboard" },
  { value: "longboard", label: "Longboard" },
  { value: "funboard", label: "Funboard" },
  { value: "bodyboard", label: "Bodyboard" },
  { value: "other", label: "Outra" },
];

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_OPTIONS: ReadonlyArray<{ value: Gender; label: string }> = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
];

// ---- Score dimensions (StyleGuide §9) ----------------------------------
export const SCORE_DIMENSIONS = [
  "scoreFlow",
  "scoreDrop",
  "scoreBalance",
  "scoreWaveSelection",
  "scoreManeuvers",
  "scoreArms",
] as const;
export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export const SCORE_DIMENSION_LABELS: Record<ScoreDimension, string> = {
  scoreFlow: "Fluxo",
  scoreDrop: "Drop",
  scoreBalance: "Postura & equilíbrio",
  scoreWaveSelection: "Escolha da onda",
  scoreManeuvers: "Manobras",
  scoreArms: "Braços",
};

export const OVERALL_SCORE_LABEL = "Nota geral";

// ---- Validation bounds (mirror API; StyleGuide §8) ---------------------
export const HEIGHT_CM = { min: 100, max: 250 } as const;
export const WEIGHT_KG = { min: 30, max: 200 } as const;
export const BOARD_SIZE_FEET = { min: 3, max: 15 } as const;
export const VOLUME_L = { min: 5, max: 200 } as const;
export const NAME_MAX = 200;
export const LOCATION_MAX = 200;
export const NOTES_MAX = 1000;
export const LABEL_MAX = 200;
/**
 * UX cap for the board nickname input — deliberately shorter than the server's
 * LABEL_MAX so long names can't blow out card/badge layouts. Display surfaces
 * still truncate as a backstop for any legacy label above this length.
 */
export const BOARD_LABEL_MAX = 20;

// ---- Units (StyleGuide §8) ---------------------------------------------
export const WAVE_SIZE_METERS = { min: 0, max: 4, step: 0.1 } as const;
