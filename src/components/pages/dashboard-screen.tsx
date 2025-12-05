"use client";

import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function DashboardScreen() {
  const { projects, summary, loading, testCases } = useUat();

  return (
    <DashboardShell title="Dashboard">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Test Cases" value={testCases.length} />
        <StatCard label="Pass" value={summary.pass} />
        <StatCard label="Partial" value={summary.partial} />
        <StatCard label="Fail" value={summary.fail} />
        <StatCard label="Result %" value={`${summary.resultPercent.toFixed(1)}%`} highlight />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
          {loading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>
        <div className="mt-3 divide-y divide-slate-200">
          {projects.length === 0 && <p className="py-3 text-sm text-slate-600">No projects yet.</p>}
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-base font-semibold">{project.name}</p>
                <p className="text-sm text-slate-600">
                  Version {project.testVersion} · {project.month}
                </p>
              </div>
              <div className="text-sm text-slate-600">{new Date(project.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 shadow-sm ${
        highlight ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

