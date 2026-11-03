import Link from "next/link";
import { LayoutDashboard, FolderKanban, Settings, Plug } from "lucide-react";

const links = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Integrations", href: "/settings/integrations", icon: Plug },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="w-60 border-r bg-white p-5">
      <h1 className="mb-10 text-xl font-bold">TaskOS</h1>
      <nav className="space-y-2">
        {links.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-gray-100">
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
