import { Checkbox } from "@/shared/ui/checkbox/checkbox";

interface CheckboxFilterProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const CheckboxFilter = ({
  id,
  label,
  checked,
  onChange,
}: CheckboxFilterProps) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onChange(checked === true)}
        className="w-6 h-6 data-[state=checked]:bg-[#FF6600] data-[state=checked]:border-[#FF6600] border-gray-300"
      />
      <span className="text-base font-sans text-[#181818]">{label}</span>
    </label>
  );
};
