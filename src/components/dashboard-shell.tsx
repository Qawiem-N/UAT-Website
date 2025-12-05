"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useUat } from "./uat-provider";
import { HomeIcon, ClipboardDocumentListIcon, ClockIcon, PlayCircleIcon } from "@heroicons/react/24/outline";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/projects", label: "Projects", icon: ClipboardDocumentListIcon },
  { href: "/execution", label: "Execution", icon: PlayCircleIcon },
  { href: "/history", label: "History", icon: ClockIcon },
];

export function DashboardShell({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  const pathname = usePathname();
  const { user, projects, activeProjectId, setActiveProjectId } = useUat();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white/90 backdrop-blur">
        <div className="px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">UAT Manager</p>
          <p className="text-xl font-semibold text-slate-900">Workspace</p>
        </div>
        <nav className="flex-1 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-slate-200 px-4 py-3 text-sm">
          <p className="font-semibold text-slate-900">{user.name}</p>
          <p className="text-slate-600">{user.email}</p>
        </div>
      </aside>
      <main className="flex flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current page</p>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={activeProjectId ?? ""}
              onChange={(e) => setActiveProjectId(e.target.value)}
            >
              {projects.length === 0 && <option value="">No projects</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {actions}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="space-y-5 px-4 py-5 md:px-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

