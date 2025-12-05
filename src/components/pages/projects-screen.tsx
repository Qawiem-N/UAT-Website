"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { PlusIcon, CheckCircleIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function ProjectsScreen() {
  const { projects, setActiveProjectId, createProject } = useUat();

  const [createForm, setCreateForm] = useState({ name: "", testVersion: "", month: "" });
  const [projectError, setProjectError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

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

