"use client";

import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { buildReportHtml } from "../../lib/report";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function ExportScreen() {
  const { projects, activeProjectId, participants, testCases, summary, approvals } = useUat();
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
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          disabled={!project}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export HTML
        </button>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Final Report</h2>
        <p className="mt-2 text-sm text-slate-600">
          Exports Project Information, Participant List, Test Case Table, Results Summary, and Approval Sign-Off.
        </p>
      </div>
    </DashboardShell>
  );
}

