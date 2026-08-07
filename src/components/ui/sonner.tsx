import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * App toaster. Dark theme bound to SurfRise surfaces; success/info/error,
 * no exclamation marks in copy (StyleGuide). Mounted once in __root.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group rounded-[12px] border border-border bg-card text-foreground shadow-[var(--shadow-md)]',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-white',
          cancelButton: 'bg-secondary text-foreground',
          success: 'text-success',
          error: 'text-danger',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
