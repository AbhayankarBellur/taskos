import { cn } from "@/lib/utils";

type Tab = { id: string; label: string; count?: number };
type Props = {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
};

export function Tabs({ tabs, activeId, onChange }: Props) {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition",
            activeId === t.id
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          )}
        >
          <span>{t.label}</span>
          {typeof t.count === "number" && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
