import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface TextareaFieldProps {
  name: string;
  label?: string;
  hint?: string;
  optional?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}

/** RHF-bound multiline input. */
export function TextareaField({
  name,
  label,
  hint,
  optional,
  rows = 3,
  maxLength,
  placeholder,
}: TextareaFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel optional={optional}>{label}</FormLabel>}
          <FormControl>
            <Textarea
              rows={rows}
              maxLength={maxLength}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ''}
            />
          </FormControl>
          {hint && <FormDescription>{hint}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
