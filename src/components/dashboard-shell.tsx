"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useUat } from "./uat-provider";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  PlayCircleIcon,
  Bars3Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/projects", label: "Projects", icon: ClipboardDocumentListIcon },
  { href: "/execution", label: "Execution", icon: PlayCircleIcon },
  { href: "/history", label: "History", icon: ClockIcon },
];

export function DashboardShell({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  const pathname = usePathname();
  const { user } = useUat();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sidebar-collapsed", String(collapsed));
    }
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const breadcrumbs = useMemo(() => {
    const labelMap: Record<string, string> = {
      dashboard: "Dashboard",
      projects: "Projects",
      execution: "Execution",
      history: "History",
      export: "Export",
    };

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return [{ label: "Dashboard", href: "/dashboard", active: true }];
    }

    let href = "";
    return segments.map((seg, idx) => {
      href += `/${seg}`;
      const label = labelMap[seg] ?? seg;
      const active = idx === segments.length - 1;
      return { label, href, active };
    });
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 z-50 flex ${collapsed ? "w-16" : "w-64"} translate-x-0 flex-col border-r border-slate-200 bg-white/90 backdrop-blur transition-all duration-200 md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{collapsed ? "UAT" : "UAT Manager"}</p>
            {!collapsed && <p className="text-xl font-semibold text-slate-900">Workspace</p>}
          </div>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((c) => !c)}
            className="hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 md:inline-flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronDoubleRightIcon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden"
          >
            {mobileOpen ? <ChevronDoubleLeftIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
        <nav className="flex-1 px-2 md:px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold md:px-3 ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500"
                    }`}
                    title={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-slate-200 px-4 py-3 text-sm">
          <p className="font-semibold text-slate-900 truncate">{user.name}</p>
          {!collapsed && <p className="text-slate-600 truncate">{user.email}</p>}
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="flex min-w-0 flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-5">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Toggle menu"
                onClick={() => setMobileOpen(true)}
                className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current page</p>
                <h1 className="text-2xl font-semibold">{title}</h1>
              </div>
            </div>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
              {breadcrumbs.map((crumb) => {
                const base = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition";
                const activeCls = "border-indigo-100 bg-indigo-50 text-indigo-800";
                const linkCls = "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700";
                return crumb.active ? (
                  <span key={crumb.href} className={`${base} ${activeCls}`}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link key={crumb.href} href={crumb.href} className={`${base} ${linkCls}`}>
                    {crumb.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </header>
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="space-y-5 px-4 py-5 md:px-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

