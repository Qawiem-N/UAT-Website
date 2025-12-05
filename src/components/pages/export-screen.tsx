"use client";

import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { buildReportHtml } from "../../lib/report";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function ExportScreen() {
  const { projects, activeProjectId, setActiveProjectId, participants, testCases, summary, approvals } = useUat();
  const project = projects.find((p) => p.id === activeProjectId) ?? null;

  function handleExport() {
    if (!project) return;
    const html = buildReportHtml({
      project,
      participants,
      testCases,
      summary,
      approvals,
    });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uat-report-${project.name}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell
      title="Export"
      actions={
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
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            disabled={!project}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export HTML
          </button>
        </div>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Final Report</h2>
            <p className="mt-2 text-sm text-slate-600">
              Exports Project Information, Participant List, Test Case Table, Results Summary, and Approval Sign-Off.
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Selected Project</p>
            <p className="font-semibold text-slate-800">{project?.name ?? "None"}</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

