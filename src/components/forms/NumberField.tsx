import { useEffect, useRef, useState } from 'react';
import { useFormContext, type ControllerRenderProps } from 'react-hook-form';
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

function formatValue(value: unknown) {
  return typeof value === 'number' && !Number.isNaN(value) ? String(value) : '';
}

interface NumberInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Input>,
    'value' | 'onChange' | 'onFocus' | 'onBlur' | 'type' | 'name' | 'ref'
  > {
  field: ControllerRenderProps;
}

/**
 * Keeps the input's raw text as local state, decoupled from `field.value`,
 * so intermediate strings the user is still typing (e.g. "6.", "-") never
 * get clobbered by a re-render. A native `type="number"` input can silently
 * swallow a Backspace once the value is down to one digit, making the field
 * feel stuck — `type="text"` avoids that browser quirk entirely.
 *
 * Forwards the rest of the props because `FormControl` uses a Radix `Slot`
 * to inject `id`/`aria-*` onto this element — without them the field's
 * `<FormLabel htmlFor>` association breaks.
 */
function NumberInput({ field, ...rest }: NumberInputProps) {
  const [rawValue, setRawValue] = useState(() => formatValue(field.value));
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setRawValue(formatValue(field.value));
    }
  }, [field.value]);

  return (
    <Input
      type="text"
      {...rest}
      className="font-display tabular-nums tracking-[-0.02em]"
      value={rawValue}
      onFocus={() => {
        isFocused.current = true;
      }}
      onChange={(e) => {
        const next = e.target.value;
        setRawValue(next);
        if (next === '') {
          field.onChange(undefined);
          return;
        }
        const parsed = Number(next);
        if (!Number.isNaN(parsed)) {
          field.onChange(parsed);
        }
      }}
      onBlur={() => {
        isFocused.current = false;
        setRawValue(formatValue(field.value));
        field.onBlur();
      }}
      name={field.name}
      ref={field.ref}
    />
  );
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
              <NumberInput
                field={field}
                inputMode={inputMode}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
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
