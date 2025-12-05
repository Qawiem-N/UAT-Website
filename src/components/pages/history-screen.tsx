"use client";

import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";

export default function HistoryScreen() {
  const { changes } = useUat();

  return (
    <DashboardShell title="History">
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
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

