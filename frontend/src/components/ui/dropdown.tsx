import { ReactNode, useState } from "react";

type Props = {
  trigger: ReactNode;
  children: ReactNode;
};

export function Dropdown({ trigger, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            {children}
          </div>
        </>
      )}
    </div>
  );
}
