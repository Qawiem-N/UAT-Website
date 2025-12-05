"use client";

import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";

export default function HistoryScreen() {
  const { changes, projects, activeProjectId, setActiveProjectId } = useUat();

  return (
    <DashboardShell title="History">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Recent changes for the selected project.</p>
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
      </div>
      <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[720px] text-sm">
          <thead className="sticky top-0 bg-slate-100">
            <tr>
              {["When", "User", "Entity", "Field", "Old", "New"].map((title) => (
                <th key={title} className="px-3 py-2 text-left font-semibold">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {changes.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-600" colSpan={6}>
                  No changes recorded yet.
                </td>
              </tr>
            )}
            {changes.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-slate-50/70">
                <td className="px-3 py-2 align-top">{new Date(row.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2 align-top">{row.userName}</td>
                <td className="px-3 py-2 align-top">{row.entity}</td>
                <td className="px-3 py-2 align-top">{row.field}</td>
                <td className="px-3 py-2 align-top whitespace-pre-wrap text-slate-600">{row.oldValue ?? ""}</td>
                <td className="px-3 py-2 align-top whitespace-pre-wrap text-slate-800">{row.newValue ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

