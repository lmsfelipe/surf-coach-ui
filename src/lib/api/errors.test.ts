import { describe, expect, it } from 'vitest';
import { ApiError, errorMessage, toUserMessage, NetworkError } from './errors';

describe('errorMessage', () => {
  it('maps known codes to pt-BR', () => {
    expect(errorMessage('NO_MEDIA_FOR_SESSION')).toMatch(/mídia/i);
    expect(errorMessage('REVIEW_ALREADY_EXISTS')).toMatch(/análise/i);
    expect(errorMessage('FILE_TOO_LARGE')).toMatch(/100 MB/);
  });

  it('falls back for unknown codes', () => {
    expect(errorMessage('SOMETHING_NEW')).toBe('Algo deu errado. Tente de novo?');
  });
});

describe('ApiError', () => {
  it('exposes a pt-BR userMessage', () => {
    const err = new ApiError('AI_GENERATION_FAILED', 'boom', 502);
    expect(err.userMessage).toMatch(/Tente de novo/);
  });

  it('extracts field errors from VALIDATION_ERROR details', () => {
    const err = new ApiError('VALIDATION_ERROR', 'bad', 400, [
      { loc: ['body', 'location'], msg: 'campo obrigatório', type: 'missing' },
    ]);
    expect(err.fieldErrors).toEqual({ location: 'campo obrigatório' });
  });

  it('returns empty field errors for non-validation codes', () => {
    expect(new ApiError('NOT_FOUND', 'x', 404).fieldErrors).toEqual({});
  });
});

describe('toUserMessage', () => {
  it('handles ApiError, NetworkError and unknowns', () => {
    expect(toUserMessage(new ApiError('FORBIDDEN', 'x', 403))).toMatch(/acesso/i);
    expect(toUserMessage(new NetworkError())).toMatch(/conexão/i);
    expect(toUserMessage('weird')).toBe('Algo deu errado. Tente de novo?');
  });
});
