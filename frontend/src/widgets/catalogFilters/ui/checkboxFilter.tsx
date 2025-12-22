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
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-gray-300 text-[#FF6600] focus:ring-[#FF6600] cursor-pointer"
      />
      <span className="text-base font-sans text-[#181818]">{label}</span>
    </label>
  );
};

