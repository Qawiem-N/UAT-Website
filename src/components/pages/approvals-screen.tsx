"use client";

import { FormEvent, useState } from "react";
import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { ApprovalSignoff } from "../../lib/types";
import { newId } from "../../lib/id";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function ApprovalsScreen() {
  const { approvals, saveApproval, removeApproval, activeProjectId } = useUat();
  const [form, setForm] = useState<ApprovalSignoff>({
    id: newId(),
    projectId: activeProjectId ?? "",
    role: "",
    name: "",
    unit: "",
    date: "",
    signatureFilePath: "",
    verifiedBy: "",
    remarks: "",
    month: "",
  });

  function reset() {
    setForm({
      id: newId(),
      projectId: activeProjectId ?? "",
      role: "",
      name: "",
      unit: "",
      date: "",
      signatureFilePath: "",
      verifiedBy: "",
      remarks: "",
      month: "",
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!activeProjectId) return;
    await saveApproval({ ...form, projectId: activeProjectId });
    reset();
  }

  function onFieldChange(id: string, field: keyof ApprovalSignoff, value: string) {
    const row = approvals.find((r) => r.id === id);
    if (!row) return;
    void saveApproval({ ...row, [field]: value });
  }

  return (
    <DashboardShell title="Approvals">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Add Approval</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={onSubmit}>
          <Input label="Role" value={form.role} onChange={(v) => setForm((p) => ({ ...p, role: v }))} />
          <Input label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Input label="Unit" value={form.unit} onChange={(v) => setForm((p) => ({ ...p, unit: v }))} />
          <Input label="Date" value={form.date} type="date" onChange={(v) => setForm((p) => ({ ...p, date: v }))} />
          <Input
            label="Signature File Path"
            value={form.signatureFilePath}
            onChange={(v) => setForm((p) => ({ ...p, signatureFilePath: v }))}
          />
          <Input label="Verified By" value={form.verifiedBy} onChange={(v) => setForm((p) => ({ ...p, verifiedBy: v }))} />
          <Input label="Remarks" value={form.remarks} onChange={(v) => setForm((p) => ({ ...p, remarks: v }))} />
          <Input label="Month" value={form.month} onChange={(v) => setForm((p) => ({ ...p, month: v }))} />
          <div className="md:col-span-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={!activeProjectId}
            >
              Add Row
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Approval Sign-Off</h2>
        <div className="mt-3 overflow-auto rounded-lg border border-slate-200">
          <table className="min-w-[900px] text-sm">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                {["Role", "Name", "Unit", "Date", "Signature Path", "Verified By", "Remarks", "Month", ""].map((title) => (
                  <th key={title} className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvals.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-slate-600" colSpan={9}>
                    No approval rows yet.
                  </td>
                </tr>
              )}
              {approvals.map((row) => (
                <tr key={row.id} className="odd:bg-white even:bg-slate-50/70">
                  {(
                    ["role", "name", "unit", "date", "signatureFilePath", "verifiedBy", "remarks", "month"] as (
                      | "role"
                      | "name"
                      | "unit"
                      | "date"
                      | "signatureFilePath"
                      | "verifiedBy"
                      | "remarks"
                      | "month"
                    )[]
                  ).map((field) => (
                    <td key={field} className="min-w-40 px-3 py-2 align-top">
                      <input
                        className="w-full rounded-md border border-slate-300 px-2 py-1"
                        type={field === "date" ? "date" : "text"}
                        value={row[field] as string}
                        onChange={(e) => onFieldChange(row.id, field, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => void removeApproval(row.id)}
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
      </section>
    </DashboardShell>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        type={type}
        className="rounded-md border border-slate-300 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

