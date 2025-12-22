import { X } from "lucide-react";

interface ActiveFilter {
  id: string;
  label: string;
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onRemove: (id: string) => void;
}

export const ActiveFilters = ({ filters, onRemove }: ActiveFiltersProps) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onRemove(filter.id)}
          className="flex items-center gap-2 px-4 py-2 border border-black bg-white text-sm font-sans text-[#181818] hover:bg-gray-100 transition-colors"
        >
          <span>{filter.label}</span>
          <X size={16} className="text-[#181818]" />
        </button>
      ))}
    </div>
  );
};
