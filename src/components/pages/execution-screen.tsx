"use client";

import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { TestCase, TestStatus } from "../../lib/types";

const statusOptions: TestStatus[] = ["", "Pass", "Partial", "Fail", "Inapplicable"];

export default function ExecutionScreen() {
  const { testCases, saveTestCase, activeProjectId, projects, setActiveProjectId } = useUat();

  function onFieldChange(row: TestCase, field: keyof TestCase, value: string) {
    void saveTestCase({ ...row, [field]: value });
  }

  return (
    <DashboardShell title="Execution">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Only Actual Results, Status, and Remarks are editable.</p>
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
      {!activeProjectId && <p className="mt-3 text-sm text-red-600">Select a project to begin.</p>}
      <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1100px] text-sm">
          <thead className="sticky top-0 bg-slate-100">
            <tr>
              {[
                "Test Number",
                "Category",
                "Role",
                "Test Scenario",
                "Preconditions",
                "Test Steps",
                "Expected Results",
                "Actual Results",
                "Status",
                "Remarks",
              ].map((title) => (
                <th key={title} className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {testCases.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-600" colSpan={11}>
                  No test cases yet.
                </td>
              </tr>
            )}
            {testCases.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-slate-50">
                {(
                  ["testNumber", "category", "role", "testScenario", "preconditions", "testSteps", "expectedResults"] as (
                    | "testNumber"
                    | "category"
                    | "role"
                    | "testScenario"
                    | "preconditions"
                    | "testSteps"
                    | "expectedResults"
                  )[]
                ).map((field) => (
                  <td key={field} className="min-w-40 px-3 py-2 align-top">
                    <div className="whitespace-pre-wrap text-slate-800">{row[field]}</div>
                  </td>
                ))}
                <td className="min-w-40 px-3 py-2 align-top">
                  <textarea
                    className="w-full rounded-md border border-slate-300 px-2 py-1"
                    value={row.actualResults}
                    onChange={(e) => onFieldChange(row, "actualResults", e.target.value)}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <select
                    className="w-full rounded-md border border-slate-300 px-2 py-1"
                    value={row.status}
                    onChange={(e) => onFieldChange(row, "status", e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select"}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="min-w-40 px-3 py-2 align-top">
                  <textarea
                    className="w-full rounded-md border border-slate-300 px-2 py-1"
                    value={row.remarks}
                    onChange={(e) => onFieldChange(row, "remarks", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

