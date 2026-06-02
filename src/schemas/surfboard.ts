import { z } from 'zod';
import { BOARD_TYPES, LABEL_MAX } from '@/config/constants';

export const boardTypeSchema = z.enum(BOARD_TYPES);

export const surfboardFormSchema = z.object({
  boardType: boardTypeSchema,
  boardSize: z
    .number({ invalid_type_error: 'Informe o tamanho' })
    .positive('O tamanho deve ser maior que 0'),
  volume: z
    .number({ invalid_type_error: 'Informe o volume' })
    .positive('O volume deve ser maior que 0')
    .optional(),
  label: z.string().trim().max(LABEL_MAX, `Máximo ${LABEL_MAX} caracteres`).optional(),
});
export type SurfboardFormValues = z.infer<typeof surfboardFormSchema>;
