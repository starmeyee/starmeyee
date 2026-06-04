"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  User,
  Clock,
  BookOpen,
  ShoppingBag,
  Eye,
  Music,
  Layout,
  Info,
  Mail,
  Settings,
} from "lucide-react";

const cmsLinks = [
  { title: "Novels", href: "/admin/novels", icon: BookOpen },
  { title: "Products", href: "/admin/products", icon: ShoppingBag },
  { title: "Observatory", href: "/admin/observatory", icon: Eye },
  { title: "Music", href: "/admin/music", icon: Music },
  { title: "Homepage Sections", href: "/admin/homepage", icon: Layout },
  { title: "About Page", href: "/admin/about", icon: Info },
  { title: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { title: "Site Settings", href: "/admin/settings", icon: Settings },
];

export default function DashboardHomePage() {
  const { profile, user } = useAuth();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold font-oleo tracking-tight text-brand-primary">
          Welcome back, {profile?.displayName || "Admin"}!
        </h1>
        <p className="text-muted-foreground font-klee mt-2 text-lg">
          Here&apos;s what&apos;s happening with StarMeyee today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Logged in as {profile?.email}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Role</CardTitle>
            <Shield className="h-4 w-4 text-brand-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize text-brand-accent">
              {profile?.role || "user"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Provides appropriate access level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">
              {user?.metadata.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                : "Just now"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.metadata.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleTimeString()
                : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CMS Quick Access */}
      <div>
        <h2 className="text-xl font-semibold font-oleo text-brand-primary mb-4">
          CMS Quick Access
        </h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {cmsLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="cursor-pointer border transition-colors hover:bg-brand-soft/10 hover:border-brand-accent h-full">
                  <CardContent className="flex flex-col items-center justify-center gap-3 py-6 px-4 text-center">
                    <div className="rounded-full bg-brand-primary/10 p-3">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                    <span className="text-sm font-medium font-klee leading-tight text-foreground">
                      {item.title}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
