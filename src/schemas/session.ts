import { z } from 'zod';
import { LOCATION_MAX, NOTES_MAX, WAVE_SIZE_METERS } from '@/config/constants';

/** Session form. `waveSize` is captured in meters, matching the API. */
export const sessionFormSchema = z.object({
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  location: z
    .string()
    .trim()
    .min(1, 'Informe o pico')
    .max(LOCATION_MAX, `Máximo ${LOCATION_MAX} caracteres`),
  waveSize: z
    .number({ invalid_type_error: 'Informe o tamanho da onda' })
    .gt(0, 'O tamanho deve ser maior que 0')
    .max(WAVE_SIZE_METERS.max, `Máximo ${WAVE_SIZE_METERS.max} m`),
  surfboardId: z.string().uuid().optional(),
  notes: z.string().trim().max(NOTES_MAX, `Máximo ${NOTES_MAX} caracteres`).optional(),
});
export type SessionFormValues = z.infer<typeof sessionFormSchema>;
