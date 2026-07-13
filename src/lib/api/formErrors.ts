import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';
import { ApiError, toUserMessage } from './errors';

/**
 * Mutation onError helper (Overview §5.2): map a server VALIDATION_ERROR back
 * onto the RHF form via setError; anything else becomes a pt-BR toast.
 */
export function handleMutationError<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): void {
  if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
    const fieldErrors = err.fieldErrors;
    const entries = Object.entries(fieldErrors);
    if (entries.length > 0) {
      for (const [field, message] of entries) {
        setError(field as Path<T>, { message });
      }
      return;
    }
  }
  toast.error(toUserMessage(err));
}
