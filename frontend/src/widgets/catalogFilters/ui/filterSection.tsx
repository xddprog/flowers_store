import { ReactNode } from "react";

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  showMore?: boolean;
  border?: boolean;
  onShowMore?: () => void;
}

export const FilterSection = ({
  title,
  children,
  showMore = false,
  onShowMore,
  border = true,
}: FilterSectionProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-[32px] font-sans font-medium text-[#3F3F3F] leading-[40px] mb-4">
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
      {showMore && (
        <button
          onClick={onShowMore}
          className="mt-3 text-sm font-sans text-[#FF6600] hover:opacity-80 transition-opacity"
        >
          Еще
        </button>
      )}
      {border && <div className="mt-6 border-b border-gray-300" />}
    </div>
  );
};
