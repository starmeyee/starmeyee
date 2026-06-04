"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  ShoppingBag, 
  PenTool, 
  Users, 
  LineChart, 
  Settings, 
  User,
  LogOut,
  Layout,
  Telescope,
  Music,
  Mail,
  Info,
  Share2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const navGroups = [
  {
    title: "Dashboard",
    items: [
      { title: "Home", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Content",
    items: [
      { title: "Novels", href: "/admin/novels", icon: BookOpen },
      { title: "Products", href: "/admin/products", icon: ShoppingBag },
      { title: "Blogs", href: "/admin/blogs", icon: PenTool },
      { title: "Homepage", href: "/admin/homepage", icon: Layout },
    ],
  },
  {
    title: "Media",
    items: [
      { title: "Observatory", href: "/admin/observatory", icon: Telescope },
      { title: "Music", href: "/admin/music", icon: Music },
    ],
  },
  {
    title: "Audience",
    items: [
      { title: "Subscribers", href: "/admin/subscribers", icon: Users },
      { title: "Newsletter", href: "/admin/newsletter", icon: Mail },
    ],
  },
  {
    title: "Insights",
    items: [
      { title: "Analytics", href: "/admin/analytics", icon: LineChart },
    ],
  },
  {
    title: "Pages",
    items: [
      { title: "About", href: "/admin/about", icon: Info },
      { title: "Social Links", href: "/admin/social", icon: Share2 },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Site Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r w-64">
      <div className="p-6">
        <Link href="/admin">
          <h2 className="text-2xl font-bold font-oleo text-brand-primary">StarMeyee</h2>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {navGroups.map((group, i) => (
          <div key={i}>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-klee">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item, j) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={j}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-soft/20 text-brand-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        <div>
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-klee">
            Account
          </h3>
          <div className="space-y-1">
            <Link
              href="/admin/profile"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/admin/profile"
                  ? "bg-brand-soft/20 text-brand-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
