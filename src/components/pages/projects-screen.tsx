"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { PlusIcon, CheckCircleIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ProjectsScreen() {
  const { projects, setActiveProjectId, createProject } = useUat();

  const [createForm, setCreateForm] = useState({ name: "", testVersion: "", month: "" });
  const [projectError, setProjectError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; testVersion?: string; month?: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [monthOpen, setMonthOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  async function onCreateProject(event: FormEvent) {
    event.preventDefault();
    const errors: { name?: string; testVersion?: string; month?: string } = {};
    if (!createForm.name.trim()) errors.name = "Project Name is required.";
    if (createForm.name.trim().length > 30) errors.name = "Project Name must be 30 characters or less.";
    if (!createForm.testVersion.trim()) errors.testVersion = "Test Version is required.";
    if (/[A-Za-z]/.test(createForm.testVersion)) errors.testVersion = "Test Version cannot contain letters.";
    if (!createForm.month.trim()) errors.month = "Month is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setModalSaving(true);
    setProjectError(null);
    await createProject(createForm);
    setCreateForm({ name: "", testVersion: "", month: "" });
    setFieldErrors({});
    setModalSaving(false);
    setShowModal(false);
    setModalSuccess("Project created and selected.");
    setTimeout(() => setModalSuccess(null), 2000);
  }

  function formatDate(value?: string | null) {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <DashboardShell title="Projects">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Projects</h2>
            <p className="text-sm text-slate-600">Select a project or create a new one.</p>
          </div>
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 && <p className="py-3 text-sm text-slate-600">No projects yet.</p>}
          {projects.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{p.name}</p>
                  <p className="text-sm text-slate-600">
                    Version {p.testVersion} · {p.month}
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                <p>Created {formatDate(p.createdAt)}</p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Link
                  href={`/projects/${p.id}`}
                  onClick={() => setActiveProjectId(p.id)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  Open
                </Link>
              </div>
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
          onClick={() => setShowModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowModal(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            className="flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-none bg-white shadow-lg sm:h-auto sm:max-w-xl sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <h3 className="text-lg font-semibold">Create Project</h3>
              <button
                aria-label="Close"
                className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
                onClick={() => setShowModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form className="mt-4 grid flex-1 gap-3 overflow-y-auto px-4 pb-4 sm:px-5" onSubmit={onCreateProject}>
              <Input
                label="Project Name"
                hint="e.g. Mobile App UAT Feb"
                value={createForm.name}
                onChange={(v) => setCreateForm((p) => ({ ...p, name: v.slice(0, 30) }))}
                required
                error={fieldErrors.name}
                maxLength={30}
                placeholder="Max 30 characters"
              />
              <Input
                label="Test Version"
                hint="e.g. 1.0.2-beta"
                value={createForm.testVersion}
                onChange={(v) => setCreateForm((p) => ({ ...p, testVersion: v.slice(0, 30) }))}
                required
                error={fieldErrors.testVersion}
                placeholder="Letters, numbers and special characters only"
                maxLength={30}
              />
              <Input
                label="Month"
                hint="e.g. March"
                value={createForm.month}
                onChange={(v) => {
                  setCreateForm((p) => ({ ...p, month: v }));
                  setMonthOpen(true);
                }}
                required
                error={fieldErrors.month}
                listId="month-options"
                placeholder="Select or type month"
                onBlur={() => setMonthOpen(false)}
                dropdownOpen={monthOpen}
                setDropdownOpen={setMonthOpen}
              />
              {projectError && <p className="text-sm text-red-600">{projectError}</p>}
              <div className="flex flex-wrap items-center gap-2">
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
            <p className="px-4 pb-4 text-xs text-slate-500 sm:px-5">Press Enter to submit, Esc to close.</p>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Input({
  label,
  hint,
  value,
  onChange,
  required,
  error,
  maxLength,
  listId,
  placeholder,
  onBlur,
  dropdownOpen,
  setDropdownOpen,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  maxLength?: number;
  listId?: string;
  placeholder?: string;
  onBlur?: () => void;
  dropdownOpen?: boolean;
  setDropdownOpen?: (open: boolean) => void;
}) {
  const filteredMonths = useMemo(() => {
    if (listId !== "month-options") return monthOptions;
    const term = value.toLowerCase();
    if (!term.trim()) return [];
    return monthOptions.filter((m) => m.toLowerCase().includes(term));
  }, [listId, value]);

  return (
    <label className="grid gap-1 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
      <div className="flex items-stretch gap-2">
        <input
          className={`flex-1 rounded-md border px-3 py-2 ${error ? "border-red-500 focus-visible:outline-red-500" : "border-slate-300"}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${label}-error` : undefined}
          maxLength={maxLength}
          list={listId}
          placeholder={placeholder}
        onFocus={() => setDropdownOpen?.(true)}
        onBlur={onBlur}
        />
      </div>
      {error && (
        <span id={`${label}-error`} className="text-xs text-red-600">
          {error}
        </span>
      )}
    {listId === "month-options" && dropdownOpen && filteredMonths.length > 0 && (
        <div className="relative">
          <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
            {filteredMonths.map((m) => (
              <button
                type="button"
                key={m}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(m);
                setDropdownOpen?.(false);
              }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </label>
  );
}

