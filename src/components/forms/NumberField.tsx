import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface NumberFieldProps {
  name: string;
  label?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  optional?: boolean;
  placeholder?: string;
}

/**
 * RHF-bound numeric input. Stores a `number` (or `undefined` when empty) in the
 * form so zod number schemas validate directly.
 */
export function NumberField({
  name,
  label,
  suffix,
  min,
  max,
  step,
  optional,
  placeholder,
}: NumberFieldProps) {
  const { control } = useFormContext();
  const inputMode = step && !Number.isInteger(step) ? 'decimal' : 'numeric';
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel optional={optional}>{label}</FormLabel>}
          <div className="relative">
            <FormControl>
              <Input
                type="number"
                inputMode={inputMode}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                className="font-display tabular-nums tracking-[-0.02em]"
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)
                }
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            {suffix && (
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {suffix}
              </span>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
