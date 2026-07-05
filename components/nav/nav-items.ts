import {
  LayoutDashboard,
  ListTodo,
  Mail,
  BookOpen,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/email-assistant", label: "Email", icon: Mail },
  { href: "/knowledge-base", label: "Knowledge", icon: BookOpen },
  { href: "/people", label: "People", icon: Users },
];
