"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { ApprovalSignoff, Participant, ParticipantType, TestCase, TestStatus, UatProject } from "../../lib/types";
import { newId } from "../../lib/id";
import { buildReportHtml } from "../../lib/report";
import { PlusIcon, TrashIcon, CheckCircleIcon, XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const statusOptions: TestStatus[] = ["", "Pass", "Partial", "Fail", "Inapplicable"];
const participantTypes: ParticipantType[] = ["internal", "vendor", "external"];

export function ProjectDetailScreen({ projectId }: { projectId: string }) {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    updateProject,
    testCases,
    participants,
    approvals,
    saveTestCase,
    removeTestCase,
    saveParticipant,
    removeParticipant,
    saveApproval,
    removeApproval,
    summary,
  } = useUat();

  const [projectForm, setProjectForm] = useState<UatProject | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const activeProject = useMemo(() => projects.find((p) => p.id === projectId) ?? null, [projects, projectId]);

  useEffect(() => {
    if (activeProjectId !== projectId) {
      setActiveProjectId(projectId);
    }
  }, [activeProjectId, projectId, setActiveProjectId]);

  useEffect(() => {
    if (activeProject) {
      setProjectForm(activeProject);
    } else {
      setProjectForm(null);
    }
  }, [activeProject]);

  async function onSaveProject() {
    if (!projectForm) return;
    setProjectError(null);
    await updateProject(projectForm);
    setModalSuccess("Project saved.");
    setTimeout(() => setModalSuccess(null), 1500);
  }

  function addTestCaseRow() {
    if (!projectId) return;
    const blank: TestCase = {
      id: newId(),
      projectId,
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

  function onTestCaseChange(row: TestCase, field: keyof TestCase, value: string) {
    void saveTestCase({ ...row, [field]: value });
  }

  function handleExport() {
    if (!activeProject) return;
    const html = buildReportHtml({
      project: activeProject,
      participants,
      testCases,
      summary,
      approvals,
    });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uat-report-${activeProject.name}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!activeProject) {
    return (
      <DashboardShell
        title="Project"
        actions={
          <Link href="/projects" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Projects
          </Link>
        }
      >
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Project not found. Return to Projects.</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={activeProject.name}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/projects" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100">
            <ArrowLeftIcon className="h-4 w-4" />
            Projects
          </Link>
          {modalSuccess && (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              <CheckCircleIcon className="h-4 w-4" />
              {modalSuccess}
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Project Details</h2>
              <p className="text-sm text-slate-600">Edit project info then save.</p>
            </div>
            <button
              onClick={onSaveProject}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Save Project
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Input label="Project Name" value={projectForm?.name ?? ""} onChange={(v) => setProjectForm((p) => (p ? { ...p, name: v } : p))} />
            <Input label="Test Version" value={projectForm?.testVersion ?? ""} onChange={(v) => setProjectForm((p) => (p ? { ...p, testVersion: v } : p))} />
            <Input label="Month" value={projectForm?.month ?? ""} onChange={(v) => setProjectForm((p) => (p ? { ...p, month: v } : p))} />
          </div>
          {projectError && <p className="mt-2 text-sm text-red-600">{projectError}</p>}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <StatCard label="Total Task" value={summary.total} />
          <StatCard label="Pass" value={summary.pass} />
          <StatCard label="Result %" value={`${summary.resultPercent.toFixed(1)}%`} highlight />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Test Cases</h2>
            <button
              type="button"
              onClick={addTestCaseRow}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100"
            >
              <PlusIcon className="h-4 w-4" />
              Add Row
            </button>
          </div>
          <div className="mt-4 overflow-auto rounded-lg border border-slate-200">
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
                    "",
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
                          onChange={(e) => onTestCaseChange(row, field, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 align-top">
                      <select
                        className="w-full rounded-md border border-slate-300 px-2 py-1"
                        value={row.status}
                        onChange={(e) => onTestCaseChange(row, "status", e.target.value)}
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
                        onChange={(e) => onTestCaseChange(row, "remarks", e.target.value)}
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
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Participants</h2>
          <ParticipantForm
            participantTypes={participantTypes}
            onSubmit={async (participant) => {
              await saveParticipant({ ...participant, projectId });
            }}
          />
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-[900px] text-sm">
              <thead className="sticky top-0 bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Demo Account</th>
                  <th className="px-3 py-2 text-left font-semibold">Role</th>
                  <th className="px-3 py-2 text-left font-semibold">Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Email</th>
                  <th className="px-3 py-2 text-left font-semibold">Participant Type</th>
                  <th className="px-3 py-2 text-left font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-slate-600" colSpan={6}>
                      No participants yet.
                    </td>
                  </tr>
                )}
                {participants.map((participant) => (
                  <tr key={participant.id} className="odd:bg-white even:bg-slate-50/70">
                    <td className="px-3 py-2">{participant.demoAccount}</td>
                    <td className="px-3 py-2">{participant.role}</td>
                    <td className="px-3 py-2">{participant.name}</td>
                    <td className="px-3 py-2">{participant.email}</td>
                    <td className="px-3 py-2 capitalize">{participant.participantType}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => void removeParticipant(participant.id)}
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

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Approvals</h2>
          <ApprovalTable approvals={approvals} onChange={saveApproval} onDelete={removeApproval} projectId={projectId} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Export</h2>
              <p className="text-sm text-slate-600">Generate HTML report for this project.</p>
            </div>
            <button
              onClick={handleExport}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Export HTML
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="rounded-md border border-slate-300 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        highlight ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ParticipantForm({
  participantTypes,
  onSubmit,
}: {
  participantTypes: ParticipantType[];
  onSubmit: (participant: Participant) => Promise<void>;
}) {
  const [form, setForm] = useState<Participant>({
    id: newId(),
    projectId: "",
    demoAccount: "",
    role: "",
    name: "",
    email: "",
    participantType: "external",
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(form);
    setForm({
      id: newId(),
      projectId: "",
      demoAccount: "",
      role: "",
      name: "",
      email: "",
      participantType: "external",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-5">
      <input
        className="rounded-md border border-slate-300 px-3 py-2"
        placeholder="Demo Account"
        value={form.demoAccount}
        onChange={(e) => setForm((p) => ({ ...p, demoAccount: e.target.value }))}
      />
      <input
        className="rounded-md border border-slate-300 px-3 py-2"
        placeholder="Role"
        value={form.role}
        onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
      />
      <input
        className="rounded-md border border-slate-300 px-3 py-2"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
      />
      <input
        className="rounded-md border border-slate-300 px-3 py-2"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
      />
      <div className="flex items-center gap-2">
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 capitalize"
          value={form.participantType}
          onChange={(e) => setForm((p) => ({ ...p, participantType: e.target.value as ParticipantType }))}
        >
          {participantTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add
        </button>
      </div>
    </form>
  );
}

function ApprovalTable({
  approvals,
  onChange,
  onDelete,
  projectId,
}: {
  approvals: ApprovalSignoff[];
  onChange: (approval: ApprovalSignoff) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  projectId: string;
}) {
  return (
    <div className="mt-3 overflow-auto rounded-lg border border-slate-200">
      <table className="min-w-[900px] text-sm">
        <thead className="sticky top-0 bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Role</th>
            <th className="px-3 py-2 text-left font-semibold">Name</th>
            <th className="px-3 py-2 text-left font-semibold">Unit</th>
            <th className="px-3 py-2 text-left font-semibold">Date</th>
            <th className="px-3 py-2 text-left font-semibold">Signature File Path</th>
            <th className="px-3 py-2 text-left font-semibold">Verified By</th>
            <th className="px-3 py-2 text-left font-semibold">Remarks</th>
            <th className="px-3 py-2 text-left font-semibold">Month</th>
            <th className="px-3 py-2 text-left font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {approvals.length === 0 && (
            <tr>
              <td className="px-3 py-3 text-slate-600" colSpan={9}>
                No approvals yet.
              </td>
            </tr>
          )}
          {approvals.map((row) => (
            <tr key={row.id} className="odd:bg-white even:bg-slate-50/70">
              {(
                ["role", "name", "unit", "date", "signatureFilePath", "verifiedBy", "remarks", "month"] as (keyof ApprovalSignoff)[]
              ).map((field) => (
                <td key={field} className="px-3 py-2 align-top">
                  <input
                    className="w-full rounded-md border border-slate-300 px-2 py-1"
                    value={(row[field] as string) ?? ""}
                    onChange={(e) => onChange({ ...row, [field]: e.target.value })}
                  />
                </td>
              ))}
              <td className="px-3 py-2 align-top">
                <button
                  type="button"
                  onClick={() => void onDelete(row.id)}
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
  );
}

