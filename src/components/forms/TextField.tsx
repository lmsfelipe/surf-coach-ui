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

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  hint?: string;
  optional?: boolean;
  icon?: React.ReactNode;
}

/** RHF-bound text input with optional leading icon, label, hint, error. */
export function TextField({
  name,
  label,
  hint,
  optional,
  icon,
  className,
  ...inputProps
}: TextFieldProps) {
  const { control } = useFormContext();
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
                className={cn(icon && 'pl-[42px]', className)}
                {...field}
                value={field.value ?? ''}
                {...inputProps}
              />
            </FormControl>
          </div>
          {hint && <FormDescription>{hint}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
