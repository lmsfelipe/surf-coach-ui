/**
 * API error envelope handling. Maps each API `code` to a pt-BR user message.
 * Source: FRONTEND_INTEGRATION.md §Error Code Reference; Overview §5.2.
 */

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** One entry per field from a VALIDATION_ERROR's details (FastAPI shape). */
export interface FieldErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** pt-BR user-facing message for this error code. */
  get userMessage(): string {
    return errorMessage(this.code);
  }

  /** Validation field errors keyed by field name, for RHF mapping. */
  get fieldErrors(): Record<string, string> {
    if (this.code !== 'VALIDATION_ERROR' || !Array.isArray(this.details)) return {};
    const out: Record<string, string> = {};
    for (const d of this.details as FieldErrorDetail[]) {
      const field = d.loc?.[d.loc.length - 1];
      if (typeof field === 'string') out[field] = d.msg;
    }
    return out;
  }
}

/** Network/parse failure with no envelope. */
export class NetworkError extends Error {
  constructor(message = 'Falha de conexão') {
    super(message);
    this.name = 'NetworkError';
  }
}

export const ERROR_MESSAGES_PT_BR: Record<string, string> = {
  MISSING_TOKEN: 'Sua sessão expirou. Entre novamente.',
  INVALID_TOKEN: 'Sua sessão expirou. Entre novamente.',
  UNAUTHORIZED: 'Sua sessão expirou. Entre novamente.',
  VALIDATION_ERROR: 'Confira os campos destacados.',
  NOT_FOUND: 'Não encontramos o que você procura.',
  FORBIDDEN: 'Você não tem acesso a esse recurso.',
  CONFLICT: 'Isso já existe.',
  INVALID_MEDIA_TYPE: 'Esse tipo de arquivo não é aceito.',
  INVALID_MEDIA: 'Não conseguimos processar esse arquivo.',
  FILE_TOO_LARGE: 'O arquivo passa de 100 MB.',
  VIDEO_TOO_LONG: 'O vídeo passa de 120 segundos.',
  NO_MEDIA_FOR_SESSION: 'Envie uma mídia antes de gerar a análise.',
  REVIEW_ALREADY_EXISTS: 'Essa sessão já tem uma análise.',
  TRAINING_PLAN_ALREADY_EXISTS: 'Essa análise já tem um treino.',
  SURFBOARD_NOT_FOUND: 'Prancha não encontrada.',
  SURFBOARD_FORBIDDEN: 'Essa prancha não é sua.',
  REVIEW_NOT_FOUND: 'Análise não encontrada.',
  REVIEW_NOT_RETRYABLE: 'Somente análises com falha podem ser reagendadas.',
  TRAINING_PLAN_NOT_RETRYABLE: 'Somente planos com falha podem ser reagendados.',
  STORAGE_UPLOAD_FAILED: 'Não conseguimos enviar o arquivo. Tente de novo?',
  MEDIA_NOT_SURF_RELATED: 'Este conteúdo não parece ser de surfe ou esportes aquáticos.',
  EXPLICIT_CONTENT: 'O arquivo contém conteúdo explícito ou ofensivo e não pode ser enviado.',
  AI_GENERATION_FAILED: 'Não conseguimos gerar agora. Tente de novo?',
  AI_PARSE_FAILED: 'A análise veio em um formato inesperado. Tente de novo?',
  INTERNAL_ERROR: 'Algo deu errado do nosso lado. Tente de novo?',
  HTTP_ERROR: 'Algo deu errado. Tente de novo?',
  NETWORK_ERROR: 'Sem conexão. Verifique sua internet.',
};

const FALLBACK_MESSAGE = 'Algo deu errado. Tente de novo?';

export function errorMessage(code: string): string {
  return ERROR_MESSAGES_PT_BR[code] ?? FALLBACK_MESSAGE;
}

/** Resolve any thrown value to a pt-BR message for toasts/inline display. */
export function toUserMessage(err: unknown): string {
  if (err instanceof ApiError) return err.userMessage;
  if (err instanceof NetworkError) return errorMessage('NETWORK_ERROR');
  return FALLBACK_MESSAGE;
}
