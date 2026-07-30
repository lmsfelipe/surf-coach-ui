import { BOARD_LABEL_MAX, BOARD_SIZE_FEET, BOARD_TYPE_OPTIONS, VOLUME_L } from '@/config/constants';
import { Card } from '@/components/ui/card';
import { SelectField } from './SelectField';
import { NumberField } from './NumberField';
import { TextField } from './TextField';

/** Shared board create/edit fields (board size stays in FEET). */
export function BoardFormFields() {
  return (
    <Card>
      <SelectField
        name="boardType"
        label="Tipo"
        options={BOARD_TYPE_OPTIONS}
        placeholder="Selecione o tipo"
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <NumberField
            name="boardSize"
            label="Tamanho (pés)"
            suffix="pés"
            step={0.1}
            min={BOARD_SIZE_FEET.min}
            max={BOARD_SIZE_FEET.max}
            placeholder="5.10"
          />
        </div>
        <div className="flex-1">
          <NumberField
            name="volume"
            label="Volume (L)"
            optional
            suffix="L"
            step={0.5}
            min={VOLUME_L.min}
            max={VOLUME_L.max}
          />
        </div>
      </div>
      <TextField
        name="label"
        label="Apelido"
        optional
        placeholder="Ex.: Pranchinha"
        maxLength={BOARD_LABEL_MAX}
      />
    </Card>
  );
}
