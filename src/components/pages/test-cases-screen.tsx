"use client";

import { useMemo } from "react";
import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { TestCase, TestStatus } from "../../lib/types";
import { newId } from "../../lib/id";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const statusOptions: TestStatus[] = ["", "Pass", "Partial", "Fail", "Inapplicable"];

export default function TestCasesScreen() {
  const { testCases, saveTestCase, removeTestCase, activeProjectId, loading } = useUat();

  const rows = useMemo(() => testCases, [testCases]);

  function addRow() {
    if (!activeProjectId) return;
    const blank: TestCase = {
      id: newId(),
      projectId: activeProjectId,
      testNumber: "",
      category: "",
      role: "",
      testScenario: "",
      preconditions: "",
      testSteps: "",
      expectedResults: "",
      actualResults: "",
      status: "",
      remarks: "",
    };
    void saveTestCase(blank);
  }

  function onFieldChange(row: TestCase, field: keyof TestCase, value: string) {
    void saveTestCase({ ...row, [field]: value });
  }

  return (
    <DashboardShell title="Test Cases" actions={<AddRowButton onClick={addRow} disabled={loading || !activeProjectId} />}>
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
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
                "",
              ].map((title) => (
                <th key={title} className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-600" colSpan={11}>
                  No test cases yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-slate-50/70">
                {(
                  [
                    "testNumber",
                    "category",
                    "role",
                    "testScenario",
                    "preconditions",
                    "testSteps",
                    "expectedResults",
                    "actualResults",
                  ] as (keyof TestCase)[]
                ).map((field) => (
                  <td key={field} className="min-w-40 px-3 py-2 align-top">
                    <textarea
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      value={(row[field] as string) ?? ""}
                      onChange={(e) => onFieldChange(row, field, e.target.value)}
                    />
                  </td>
                ))}
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
                <td className="px-3 py-2 align-top">
                  <button
                    type="button"
                    onClick={() => void removeTestCase(row.id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

function AddRowButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
    <PlusIcon className="h-4 w-4" />
      Add Row
    </button>
  );
}

