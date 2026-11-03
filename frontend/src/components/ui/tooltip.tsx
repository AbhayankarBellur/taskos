import { ReactNode, useState } from "react";

type Props = {
  content: string;
  children: ReactNode;
};

export function Tooltip({ content, children }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-[11px] text-white shadow-md whitespace-nowrap">
          {content}
        </div>
      )}
    </div>
  );
}
