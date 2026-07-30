import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { IconEye, IconEyeOff } from '@/components/icons';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  hint?: string;
  optional?: boolean;
  icon?: React.ReactNode;
}

/** RHF-bound password input with a show/hide toggle and optional leading icon. */
export function PasswordField({
  name,
  label,
  hint,
  optional,
  icon,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const { control } = useFormContext();
  const [show, setShow] = React.useState(false);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel optional={optional}>{label}</FormLabel>}
          <div className="relative">
            {icon && (
              <span className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
                {icon}
              </span>
            )}
            <FormControl>
              <Input
                className={cn('pr-[42px]', icon && 'pl-[42px]', className)}
                type={show ? 'text' : 'password'}
                {...field}
                value={field.value ?? ''}
                {...inputProps}
              />
            </FormControl>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3.5 top-1/2 flex -translate-y-1/2 text-muted-foreground hover:text-foreground [&_svg]:size-4"
            >
              {show ? <IconEyeOff size={17} /> : <IconEye size={17} />}
            </button>
          </div>
          {hint && <FormDescription>{hint}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
