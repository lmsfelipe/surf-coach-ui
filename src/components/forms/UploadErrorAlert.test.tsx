import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploadErrorAlert } from './UploadErrorAlert';
import { ApiError } from '@/lib/api/errors';

describe('UploadErrorAlert', () => {
  it('renders amber warning alert for MEDIA_NOT_SURF_RELATED', () => {
    const error = new ApiError('MEDIA_NOT_SURF_RELATED', 'Not surf.', 422);
    render(<UploadErrorAlert error={error} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-warning/10');
    expect(screen.getByText('Este conteúdo não parece ser de surfe ou esportes aquáticos.')).toBeInTheDocument();
  });

  it('renders red destructive alert for EXPLICIT_CONTENT', () => {
    const error = new ApiError('EXPLICIT_CONTENT', 'Explicit.', 422);
    render(<UploadErrorAlert error={error} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-danger/10');
    expect(screen.getByText('O arquivo contém conteúdo explícito ou ofensivo e não pode ser enviado.')).toBeInTheDocument();
  });
});
