import { Alert } from '@/components/feedback/Alert';
import { IconAlert, IconAlertCircle } from '@/components/icons';
import { ApiError, errorMessage } from '@/lib/api/errors';

const MODERATION_CODES = new Set(['MEDIA_NOT_SURF_RELATED', 'EXPLICIT_CONTENT']);

export function isModerationError(err: unknown): err is ApiError {
  return err instanceof ApiError && MODERATION_CODES.has(err.code);
}

interface UploadErrorAlertProps {
  error: ApiError;
}

export function UploadErrorAlert({ error }: UploadErrorAlertProps) {
  const isExplicit = error.code === 'EXPLICIT_CONTENT';
  return (
    <Alert
      tone={isExplicit ? 'danger' : 'warning'}
      icon={isExplicit ? <IconAlertCircle /> : <IconAlert />}
      className="mt-3"
    >
      {errorMessage(error.code)}
    </Alert>
  );
}
