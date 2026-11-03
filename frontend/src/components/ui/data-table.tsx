import { ReactNode } from "react";

export type Column<T> = {
  header: string;
  render: (item: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
};

export function DataTable<T>({ columns, data, keyField, onRowClick }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className="px-4 py-3">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr
              key={String(item[keyField])}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
            >
              {columns.map((c, i) => (
                <td key={i} className="px-4 py-3">{c.render(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
