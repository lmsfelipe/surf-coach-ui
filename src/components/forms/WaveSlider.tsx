import { useFormContext } from 'react-hook-form';
import { WAVE_SIZE_METERS } from '@/config/constants';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';

interface WaveSliderProps {
  name: string;
  label?: string;
}

/**
 * Wave-size slider in METERS (0–4, step 0.1), matching the API 1:1.
 * Big Inter Tight readout.
 */
export function WaveSlider({ name, label }: WaveSliderProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = typeof field.value === 'number' ? field.value : 0;
        return (
          <FormItem>
            <div className="flex items-baseline justify-between">
              {label ? (
                <FormLabel>{label}</FormLabel>
              ) : (
                <span className="text-xs text-muted-foreground">Arraste para ajustar</span>
              )}
              <span className="font-display text-[26px] font-medium tabular-nums tracking-[-0.03em] text-foreground">
                {value.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                <span className="ml-1 text-[13px] font-normal tracking-normal text-muted-foreground">
                  m
                </span>
              </span>
            </div>
            <FormControl>
              <Slider
                className="mt-3"
                min={WAVE_SIZE_METERS.min}
                max={WAVE_SIZE_METERS.max}
                step={WAVE_SIZE_METERS.step}
                value={[value]}
                onValueChange={(v) => field.onChange(v[0])}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
