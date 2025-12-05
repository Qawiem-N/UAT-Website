"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { ApprovalSignoff, Participant, ParticipantType, TestCase, TestStatus, UatProject } from "../../lib/types";
import { newId } from "../../lib/id";
import { buildReportHtml } from "../../lib/report";
import { PlusIcon, TrashIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

const statusOptions: TestStatus[] = ["", "Pass", "Partial", "Fail", "Inapplicable"];
const participantTypes: ParticipantType[] = ["internal", "vendor", "external"];

export default function ProjectsScreen() {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
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

  const [createForm, setCreateForm] = useState({ name: "", testVersion: "", month: "" });
  const [projectForm, setProjectForm] = useState<UatProject | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const activeProject = useMemo(() => projects.find((p) => p.id === activeProjectId) ?? null, [projects, activeProjectId]);

  useEffect(() => {
    if (activeProject) {
      setProjectForm(activeProject);
    } else {
      setProjectForm(null);
    }
  }, [activeProject]);

  async function onCreateProject(event: FormEvent) {
    event.preventDefault();
    if (!createForm.name || !createForm.testVersion || !createForm.month) {
      setProjectError("All fields are required.");
      return;
    }
    setModalSaving(true);
    setProjectError(null);
    await createProject(createForm);
    setCreateForm({ name: "", testVersion: "", month: "" });
    setModalSaving(false);
    setShowModal(false);
    setModalSuccess("Project created and selected.");
    setTimeout(() => setModalSuccess(null), 2000);
  }

  async function onSaveProject() {
    if (!projectForm) return;
    setProjectError(null);
    await updateProject(projectForm);
  }

  function addTestCaseRow() {
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

  return (
    <DashboardShell title="Projects">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Projects</h2>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-slate-600">Select a project or create a new one.</p>
            <button
              onClick={() => {
                setShowModal(true);
                setProjectError(null);
                setModalSuccess(null);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <PlusIcon className="h-4 w-4" />
              Create Project
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-200">
            {projects.length === 0 && <p className="py-3 text-sm text-slate-600">No projects yet.</p>}
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-base font-semibold">{p.name}</p>
                  <p className="text-sm text-slate-600">
                    Version {p.testVersion} · {p.month}
                  </p>
                </div>
                <button
                  onClick={() => setActiveProjectId(p.id)}
                  className={`rounded-md border px-3 py-1 text-sm font-medium transition ${
                    activeProjectId === p.id
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {activeProjectId === p.id ? "Viewing" : "View / Edit"}
                </button>
              </div>
            ))}
          </div>
          {modalSuccess && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircleIcon className="h-4 w-4" />
              {modalSuccess}
            </p>
          )}
        </section>
      </div>

      {activeProject && projectForm && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
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
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Input label="Project Name" value={projectForm.name} onChange={(v) => setProjectForm((p) => (p ? { ...p, name: v } : p))} />
              <Input label="Test Version" value={projectForm.testVersion} onChange={(v) => setProjectForm((p) => (p ? { ...p, testVersion: v } : p))} />
              <Input label="Month" value={projectForm.month} onChange={(v) => setProjectForm((p) => (p ? { ...p, month: v } : p))} />
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <StatCard label="Total Task" value={summary.total} />
            <StatCard label="Pass" value={summary.pass} />
            <StatCard label="Result %" value={`${summary.resultPercent.toFixed(1)}%`} highlight />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
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
                if (!activeProjectId) return;
                await saveParticipant({ ...participant, projectId: activeProjectId });
              }}
            />
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
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
            <ApprovalTable approvals={approvals} onChange={saveApproval} onDelete={removeApproval} projectId={activeProjectId} />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Export</h2>
                <p className="text-sm text-slate-600">Generate HTML report for the selected project.</p>
              </div>
              <button
                onClick={handleExport}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Export HTML
              </button>
            </div>
          </section>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
          onClick={() => setShowModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowModal(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Project</h3>
              <button
                aria-label="Close"
                className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
                onClick={() => setShowModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form className="mt-4 grid gap-3" onSubmit={onCreateProject}>
              <Input
                label="Project Name"
                value={createForm.name}
                onChange={(v) => setCreateForm((p) => ({ ...p, name: v }))}
                required
              />
              <Input
                label="Test Version"
                value={createForm.testVersion}
                onChange={(v) => setCreateForm((p) => ({ ...p, testVersion: v }))}
                required
              />
              <Input label="Month" value={createForm.month} onChange={(v) => setCreateForm((p) => ({ ...p, month: v }))} required />
              {projectError && <p className="text-sm text-red-600">{projectError}</p>}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  disabled={modalSaving}
                >
                  {modalSaving ? "Saving..." : "Create"}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
            <p className="mt-2 text-xs text-slate-500">Press Enter to submit, Esc to close.</p>
          </div>
        </div>
      )}
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
    <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleSubmit}>
      <Input label="Demo Account" value={form.demoAccount} onChange={(v) => setForm((p) => ({ ...p, demoAccount: v }))} />
      <Input label="Role" value={form.role} onChange={(v) => setForm((p) => ({ ...p, role: v }))} />
      <Input label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
      <Input label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">Participant Type</span>
        <select
          className="rounded-md border border-slate-300 px-3 py-2"
          value={form.participantType}
          onChange={(e) => setForm((p) => ({ ...p, participantType: e.target.value as ParticipantType }))}
        >
          {participantTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <div className="md:col-span-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Save Participant
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
  onChange: (a: ApprovalSignoff) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  projectId?: string | null;
}) {
  function onFieldChange(row: ApprovalSignoff, field: keyof ApprovalSignoff, value: string) {
    void onChange({ ...row, [field]: value });
  }

  function addRow() {
    const blank: ApprovalSignoff = {
      id: newId(),
      projectId: approvals[0]?.projectId ?? projectId ?? "",
      role: "",
      name: "",
      unit: "",
      date: "",
      signatureFilePath: "",
      verifiedBy: "",
      remarks: "",
      month: "",
    };
    void onChange(blank);
  }

  return (
    <div className="mt-3 overflow-auto rounded-lg border border-slate-200">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold text-slate-800">Sign-Off</span>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100"
        >
          <PlusIcon className="h-4 w-4" />
          Add Row
        </button>
      </div>
      <table className="min-w-full text-sm">
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
                    onChange={(e) => onFieldChange(row, field, e.target.value)}
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

