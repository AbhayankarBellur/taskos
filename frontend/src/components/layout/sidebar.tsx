"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navLinks } from "./nav-links";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { UserMenu } from "./user-menu";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-white p-5">
      <h1 className="mb-6 text-xl font-bold">TaskOS</h1>
      <WorkspaceSwitcher />
      <nav className="mt-6 flex-1 space-y-1">
        {navLinks.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn("flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-gray-100",
              pathname === href && "bg-indigo-50 font-medium text-indigo-700")}>
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
      <UserMenu />
    </aside>
  );
}
