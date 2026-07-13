import { describe, expect, it, vi } from 'vitest';
import type { UseFormSetError } from 'react-hook-form';
import { handleMutationError } from './formErrors';
import { ApiError } from './errors';

describe('handleMutationError', () => {
  it('maps VALIDATION_ERROR details onto form fields', () => {
    const setError = vi.fn() as unknown as UseFormSetError<{ location: string }>;
    const err = new ApiError('VALIDATION_ERROR', 'invalid', 422, [
      { loc: ['body', 'location'], msg: 'Campo obrigatório', type: 'value_error' },
    ]);

    handleMutationError(err, setError);

    expect(setError).toHaveBeenCalledWith('location', { message: 'Campo obrigatório' });
  });

  it('does not call setError for non-validation errors', () => {
    const setError = vi.fn() as unknown as UseFormSetError<Record<string, unknown>>;
    handleMutationError(new ApiError('NOT_FOUND', 'nope', 404), setError);
    expect(setError).not.toHaveBeenCalled();
  });
});
