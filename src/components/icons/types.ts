import type { ComponentType } from 'react';

/**
 * Props every icon in this module accepts. `size` mirrors lucide's own
 * `number | string` so the local brand glyphs and the lucide re-exports are
 * interchangeable at call sites that store an icon in a variable.
 */
export interface IconProps {
  size?: number | string;
  className?: string;
}

/** Any icon exported from `@/components/icons`, local or lucide. */
export type IconComponent = ComponentType<IconProps>;
