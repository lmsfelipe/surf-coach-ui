import { z } from 'zod';
import { BOARD_SIZE_FEET, BOARD_TYPES, LABEL_MAX, VOLUME_L } from '@/config/constants';

export const boardTypeSchema = z.enum(BOARD_TYPES);

export const surfboardFormSchema = z.object({
  boardType: boardTypeSchema,
  boardSize: z
    .number({ invalid_type_error: 'Informe o tamanho' })
    .min(BOARD_SIZE_FEET.min, `Mínimo ${BOARD_SIZE_FEET.min} pés`)
    .max(BOARD_SIZE_FEET.max, `Máximo ${BOARD_SIZE_FEET.max} pés`),
  volume: z
    .number({ invalid_type_error: 'Informe o volume' })
    .min(VOLUME_L.min, `Mínimo ${VOLUME_L.min} L`)
    .max(VOLUME_L.max, `Máximo ${VOLUME_L.max} L`)
    .optional(),
  label: z.string().trim().max(LABEL_MAX, `Máximo ${LABEL_MAX} caracteres`).optional(),
});
export type SurfboardFormValues = z.infer<typeof surfboardFormSchema>;
