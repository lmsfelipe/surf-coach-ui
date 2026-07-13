import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface DateFieldProps {
  name: string;
  label?: string;
  optional?: boolean;
}

/** RHF-bound native date input, emits `YYYY-MM-DD`. */
export function DateField({ name, label, optional }: DateFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel optional={optional}>{label}</FormLabel>}
          <FormControl>
            <Input
              type="date"
              {...field}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || undefined)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
