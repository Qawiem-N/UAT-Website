"use client";

import { FormEvent, useState } from "react";
import { DashboardShell } from "../dashboard-shell";
import { useUat } from "../uat-provider";
import { Participant, ParticipantType } from "../../lib/types";
import { newId } from "../../lib/id";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const participantTypes: ParticipantType[] = ["internal", "vendor", "external"];

export default function ParticipantsScreen() {
  const { participants, saveParticipant, removeParticipant, activeProjectId } = useUat();
  const [form, setForm] = useState<Participant>({
    id: newId(),
    projectId: activeProjectId ?? "",
    demoAccount: "",
    role: "",
    name: "",
    email: "",
    participantType: "external",
  });

  function resetForm() {
    setForm({
      id: newId(),
      projectId: activeProjectId ?? "",
      demoAccount: "",
      role: "",
      name: "",
      email: "",
      participantType: "external",
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!activeProjectId) return;
    await saveParticipant({ ...form, projectId: activeProjectId });
    resetForm();
  }

  return (
    <DashboardShell title="Participants">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Add Participant</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Demo Account</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.demoAccount}
              onChange={(e) => setForm((prev) => ({ ...prev, demoAccount: e.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Role</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Name</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.name}
              required
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input
              type="email"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.email}
              required
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Participant Type</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.participantType}
              onChange={(e) => setForm((prev) => ({ ...prev, participantType: e.target.value as ParticipantType }))}
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
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={!activeProjectId}
            >
              Add Participant
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Participant List</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
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
    </DashboardShell>
  );
}

