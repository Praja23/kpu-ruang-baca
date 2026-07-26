"use client";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const isSelected = selected === category;
        return (
          <label
            key={category}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group ${
              isSelected
                ? "bg-surface-container-low border-l-4 border-primary"
                : "hover:bg-surface-container-low"
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(isSelected ? "" : category)}
              className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span
              className={`font-body-md text-body-md ${isSelected ? "text-primary font-bold" : "text-on-surface-variant group-hover:text-primary"}`}
            >
              {category}
            </span>
          </label>
        );
      })}
    </div>
  );
}
