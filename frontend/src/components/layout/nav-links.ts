import { LayoutDashboard, FolderKanban, Users, Settings } from "lucide-react";

export const navLinks = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Members", href: "/members", icon: Users },
  { label: "Workspace settings", href: "/settings", icon: Settings }
];

export const pageTitle = (pathname: string) =>
  navLinks.find((link) => link.href === pathname)?.label ?? "Overview";
