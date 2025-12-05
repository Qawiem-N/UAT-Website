"use client";

import { useMemo, useRef, useState } from "react";
import {
  ApprovalSignoff,
  AuthUser,
  Participant,
  ParticipantType,
  TestCase,
  TestStatus,
  UatProject,
} from "../lib/types";

const statusOptions: TestStatus[] = ["Pass", "Partial", "Fail", "Inapplicable", ""];

const participantTypes: ParticipantType[] = ["internal", "vendor", "external"];

type ProjectFormState = Pick<UatProject, "name" | "testVersion" | "month">;

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function buildEmptyTestCase(projectId: string): TestCase {
  return {
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
}

function buildEmptySignoff(projectId: string): ApprovalSignoff {
  return {
    id: newId(),
    projectId,
    role: "",
    name: "",
    unit: "",
    date: "",
    signatureFilePath: "",
    verifiedBy: "",
    remarks: "",
    month: "",
  };
}

type CsvRow = Record<string, string>;

function toCsv(testCases: TestCase[]): string {
  const headers = [
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
  ];
  const rows = testCases.map((tc) => [
    tc.testNumber,
    tc.category,
    tc.role,
    tc.testScenario,
    tc.preconditions,
    tc.testSteps,
    tc.expectedResults,
    tc.actualResults,
    tc.status,
    tc.remarks,
  ]);
  const csvLines = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))];
  return csvLines.join("\n");
}

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes("\n") || value.includes(`"`)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? "";
    });
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === `"` && line[i + 1] === `"`) {
      current += `"`;
      i += 1;
      continue;
    }
    if (char === `"`) {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function UatWorkspace({ user }: { user: AuthUser }) {
  const initialProject: UatProject = useMemo(
    () => ({
      id: newId(),
      name: "UAT Project",
      testVersion: "1.0",
      month: "January",
      createdAt: new Date().toISOString(),
    }),
    []
  );

  const [projects, setProjects] = useState<UatProject[]>([initialProject]);
  const [currentProjectId, setCurrentProjectId] = useState(initialProject.id);
  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    name: "",
    testVersion: "",
    month: "",
  });

  const [testCasesByProject, setTestCasesByProject] = useState<Record<string, TestCase[]>>({
    [initialProject.id]: [buildEmptyTestCase(initialProject.id)],
  });
  const [participantsByProject, setParticipantsByProject] = useState<Record<string, Participant[]>>({
    [initialProject.id]: [],
  });
  const [signoffsByProject, setSignoffsByProject] = useState<Record<string, ApprovalSignoff[]>>({
    [initialProject.id]: [buildEmptySignoff(initialProject.id)],
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const currentTestCases = testCasesByProject[currentProjectId] ?? [];
  const currentParticipants = participantsByProject[currentProjectId] ?? [];
  const currentSignoffs = signoffsByProject[currentProjectId] ?? [];

  function handleProjectSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!projectForm.name || !projectForm.testVersion || !projectForm.month) {
      return;
    }
    const newProject: UatProject = {
      id: newId(),
      name: projectForm.name,
      testVersion: projectForm.testVersion,
      month: projectForm.month,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    setProjectForm({ name: "", testVersion: "", month: "" });
    setTestCasesByProject((prev) => ({
      ...prev,
      [newProject.id]: [buildEmptyTestCase(newProject.id)],
    }));
    setParticipantsByProject((prev) => ({ ...prev, [newProject.id]: [] }));
    setSignoffsByProject((prev) => ({ ...prev, [newProject.id]: [buildEmptySignoff(newProject.id)] }));
  }

  function updateTestCase(testCaseId: string, field: keyof TestCase, value: string) {
    setTestCasesByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).map((tc) =>
        tc.id === testCaseId ? { ...tc, [field]: value } : tc
      ),
    }));
  }

  function addTestCaseRow() {
    setTestCasesByProject((prev) => ({
      ...prev,
      [currentProjectId]: [...(prev[currentProjectId] ?? []), buildEmptyTestCase(currentProjectId)],
    }));
  }

  function deleteTestCaseRow(id: string) {
    setTestCasesByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).filter((tc) => tc.id !== id),
    }));
  }

  function handleCsvExport() {
    const csv = toCsv(currentTestCases);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentProject?.name ?? "uat"}-test-cases.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleCsvImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString() ?? "";
      const rows = parseCsv(text);
      const mapped: TestCase[] = rows.map((row) => ({
        id: newId(),
        projectId: currentProjectId,
        testNumber: row["Test Number"] ?? "",
        category: row["Category"] ?? "",
        role: row["Role"] ?? "",
        testScenario: row["Test Scenario"] ?? "",
        preconditions: row["Preconditions"] ?? "",
        testSteps: row["Test Steps"] ?? "",
        expectedResults: row["Expected Results"] ?? "",
        actualResults: row["Actual Results"] ?? "",
        status: (row["Status"] as TestStatus) ?? "",
        remarks: row["Remarks"] ?? "",
      }));
      setTestCasesByProject((prev) => ({
        ...prev,
        [currentProjectId]: mapped.length ? mapped : [buildEmptyTestCase(currentProjectId)],
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  }

  function addParticipant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const demoAccount = (formData.get("demoAccount") as string) || "";
    const role = (formData.get("participantRole") as string) || "";
    const name = (formData.get("participantName") as string) || "";
    const email = (formData.get("participantEmail") as string) || "";
    const participantType = (formData.get("participantType") as ParticipantType) || "external";
    if (!name || !email) return;
    const participant: Participant = {
      id: newId(),
      projectId: currentProjectId,
      demoAccount,
      role,
      name,
      email,
      participantType,
    };
    setParticipantsByProject((prev) => ({
      ...prev,
      [currentProjectId]: [...(prev[currentProjectId] ?? []), participant],
    }));
    event.currentTarget.reset();
  }

  function updateSignoff(id: string, field: keyof ApprovalSignoff, value: string) {
    setSignoffsByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  }

  function addSignoffRow() {
    setSignoffsByProject((prev) => ({
      ...prev,
      [currentProjectId]: [...(prev[currentProjectId] ?? []), buildEmptySignoff(currentProjectId)],
    }));
  }

  function deleteSignoffRow(id: string) {
    setSignoffsByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).filter((row) => row.id !== id),
    }));
  }

  function handleSignatureUpload(id: string, file: File | null) {
    if (!file) return;
    const filePath = `uploads/${Date.now()}-${file.name}`;
    const previewUrl = URL.createObjectURL(file);
    setSignoffsByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).map((row) =>
        row.id === id ? { ...row, signatureFilePath: filePath, signaturePreviewUrl: previewUrl } : row
      ),
    }));
  }

  const summary = useMemo(() => {
    const total = currentTestCases.length;
    const pass = currentTestCases.filter((tc) => tc.status === "Pass").length;
    const partial = currentTestCases.filter((tc) => tc.status === "Partial").length;
    const fail = currentTestCases.filter((tc) => tc.status === "Fail").length;
    const inapplicable = currentTestCases.filter((tc) => tc.status === "Inapplicable").length;
    const denominator = Math.max(total - inapplicable, 0);
    const resultPercent = denominator ? (pass / denominator) * 100 : 0;
    return { total, pass, partial, fail, inapplicable, resultPercent };
  }, [currentTestCases]);

  function handleExportReport() {
    if (!currentProject) return;
    const reportHtml = buildReportHtml({
      project: currentProject,
      testCases: currentTestCases,
      participants: currentParticipants,
      summary,
      signoffs: currentSignoffs,
    });
    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uat-report-${currentProject.name}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-slate-50 px-6 py-10 text-slate-900">
      <header className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Signed in</p>
            <p className="text-lg font-semibold">
              {user.name} <span className="text-slate-500">({user.email})</span>
            </p>
            <p className="text-sm text-slate-500">
              Provider: {user.provider === "sso" ? "HRMS SSO (OIDC/SAML/JWT)" : "Magic link invitation"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500">Active project</p>
            <p className="text-lg font-semibold">
              {currentProject ? currentProject.name : "Create a project to begin"}
            </p>
            {currentProject && (
              <p className="text-sm text-slate-500">
                Version {currentProject.testVersion} · {currentProject.month}
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project Creation</h2>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <form className="mt-4 grid gap-3" onSubmit={handleProjectSubmit}>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Project Name</span>
              <input
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={projectForm.name}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Test Version</span>
              <input
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={projectForm.testVersion}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, testVersion: e.target.value }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Month</span>
              <input
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={projectForm.month}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, month: e.target.value }))}
              />
            </label>
            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create UAT Project
            </button>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold">Participant Entry</h2>
          <form className="mt-4 grid gap-3" onSubmit={addParticipant}>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">Demo Account</span>
                <input name="demoAccount" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">Role</span>
                <input name="participantRole" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input name="participantName" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  name="participantEmail"
                  required
                  type="email"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Participant Type</span>
              <select name="participantType" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                {participantTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add Participant
            </button>
          </form>
          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold">Demo Account</th>
                  <th className="px-3 py-2 font-semibold">Role</th>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Email</th>
                  <th className="px-3 py-2 font-semibold">Participant Type</th>
                </tr>
              </thead>
              <tbody>
                {currentParticipants.length === 0 && (
                  <tr>
                    <td className="px-3 py-2 text-slate-500" colSpan={5}>
                      No participants yet.
                    </td>
                  </tr>
                )}
                {currentParticipants.map((participant) => (
                  <tr key={participant.id} className="odd:bg-white even:bg-slate-50/60">
                    <td className="px-3 py-2">{participant.demoAccount}</td>
                    <td className="px-3 py-2">{participant.role}</td>
                    <td className="px-3 py-2">{participant.name}</td>
                    <td className="px-3 py-2">{participant.email}</td>
                    <td className="px-3 py-2 capitalize">{participant.participantType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">Test Case Builder</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addTestCaseRow}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Add Row
            </button>
            <button
              type="button"
              onClick={handleCsvExport}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Export CSV
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">
              Import CSV
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvImport}
              />
            </label>
          </div>
        </div>
        <div className="mt-4 overflow-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
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
              {currentTestCases.map((testCase) => (
                <tr key={testCase.id} className="odd:bg-white even:bg-slate-50/60">
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
                      <input
                        className="w-full rounded-md border border-slate-300 px-2 py-1"
                        value={(testCase[field] as string) ?? ""}
                        onChange={(e) => updateTestCase(testCase.id, field, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 align-top">
                    <select
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      value={testCase.status}
                      onChange={(e) => updateTestCase(testCase.id, "status", e.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status || "Select"}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="min-w-40 px-3 py-2 align-top">
                    <input
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      value={testCase.remarks}
                      onChange={(e) => updateTestCase(testCase.id, "remarks", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => deleteTestCaseRow(testCase.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold">Execution</h2>
        <p className="mt-1 text-sm text-slate-600">Only Actual Results, Status, and Remarks are editable here.</p>
        <div className="mt-4 overflow-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
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
              {currentTestCases.map((testCase) => (
                <tr key={testCase.id} className="odd:bg-white even:bg-slate-50/60">
                  {(
                    [
                      "testNumber",
                      "category",
                      "role",
                      "testScenario",
                      "preconditions",
                      "testSteps",
                      "expectedResults",
                    ] as (keyof TestCase)[]
                  ).map((field) => (
                    <td key={field} className="min-w-40 px-3 py-2 align-top">
                      <div className="whitespace-pre-wrap">{testCase[field]}</div>
                    </td>
                  ))}
                  <td className="min-w-40 px-3 py-2 align-top">
                    <textarea
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      value={testCase.actualResults}
                      onChange={(e) => updateTestCase(testCase.id, "actualResults", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      value={testCase.status}
                      onChange={(e) => updateTestCase(testCase.id, "status", e.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status || "Select"}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="min-w-40 px-3 py-2 align-top">
                    <textarea
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                      value={testCase.remarks}
                      onChange={(e) => updateTestCase(testCase.id, "remarks", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold">Results Summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <SummaryItem label="Total Task" value={summary.total} />
            <SummaryItem label="Pass" value={summary.pass} />
            <SummaryItem label="Partial" value={summary.partial} />
            <SummaryItem label="Fail" value={summary.fail} />
            <SummaryItem label="Inapplicable" value={summary.inapplicable} />
            <SummaryItem label="Result %" value={`${summary.resultPercent.toFixed(1)}%`} highlight />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Approval Sign-Off</h2>
            <button
              type="button"
              onClick={addSignoffRow}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Add Row
            </button>
          </div>
          <div className="mt-4 overflow-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Role",
                    "Name",
                    "Unit",
                    "Date",
                    "Representative Signature (upload)",
                    "Verified By",
                    "Remarks",
                    "Month",
                    "",
                  ].map((title) => (
                    <th key={title} className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentSignoffs.map((row) => (
                  <tr key={row.id} className="odd:bg-white even:bg-slate-50/60">
                    {(
                      [
                        "role",
                        "name",
                        "unit",
                        "date",
                        "verifiedBy",
                        "remarks",
                        "month",
                      ] as (keyof ApprovalSignoff)[]
                    ).map((field) => (
                      <td key={field} className="min-w-40 px-3 py-2 align-top">
                        <input
                          className="w-full rounded-md border border-slate-300 px-2 py-1"
                          value={row[field] as string}
                          onChange={(e) => updateSignoff(row.id, field, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="min-w-44 px-3 py-2 align-top">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleSignatureUpload(row.id, e.target.files?.[0] ?? null)}
                      />
                      {row.signatureFilePath && (
                        <div className="mt-2 text-xs text-slate-600">
                          Saved: {row.signatureFilePath}
                          {row.signaturePreviewUrl && (
                            <div className="mt-1">
                              <a
                                href={row.signaturePreviewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-900 underline"
                              >
                                Preview
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => deleteSignoffRow(row.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Export Final Report</h2>
            <p className="text-sm text-slate-600">
              Includes Project Information, Participant List, Test Case Table, Results Summary, and Approval Sign-Off.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportReport}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Export HTML
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        highlight ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function buildReportHtml({
  project,
  testCases,
  participants,
  summary,
  signoffs,
}: {
  project: UatProject;
  testCases: TestCase[];
  participants: Participant[];
  summary: {
    total: number;
    pass: number;
    partial: number;
    fail: number;
    inapplicable: number;
    resultPercent: number;
  };
  signoffs: ApprovalSignoff[];
}) {
  const styles = `
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
    h1, h2 { margin: 0 0 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; font-size: 12px; }
    th { background: #f8fafc; }
    .section { margin-bottom: 24px; }
  `;

  const testCaseRows = testCases
    .map(
      (tc) => `
      <tr>
        <td>${tc.testNumber}</td>
        <td>${tc.category}</td>
        <td>${tc.role}</td>
        <td>${tc.testScenario}</td>
        <td>${tc.preconditions}</td>
        <td>${tc.testSteps}</td>
        <td>${tc.expectedResults}</td>
        <td>${tc.actualResults}</td>
        <td>${tc.status}</td>
        <td>${tc.remarks}</td>
      </tr>
    `
    )
    .join("");

  const participantRows = participants
    .map(
      (p) => `
      <tr>
        <td>${p.demoAccount}</td>
        <td>${p.role}</td>
        <td>${p.name}</td>
        <td>${p.email}</td>
        <td>${p.participantType}</td>
      </tr>
    `
    )
    .join("");

  const signoffRows = signoffs
    .map(
      (s) => `
      <tr>
        <td>${s.role}</td>
        <td>${s.name}</td>
        <td>${s.unit}</td>
        <td>${s.date}</td>
        <td>${s.signatureFilePath}</td>
        <td>${s.verifiedBy}</td>
        <td>${s.remarks}</td>
        <td>${s.month}</td>
      </tr>
    `
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>UAT Report - ${project.name}</title>
        <style>${styles}</style>
      </head>
      <body>
        <h1>UAT Final Report</h1>
        <div class="section">
          <h2>Project Information</h2>
          <p><strong>Name:</strong> ${project.name}</p>
          <p><strong>Test Version:</strong> ${project.testVersion}</p>
          <p><strong>Month:</strong> ${project.month}</p>
        </div>

        <div class="section">
          <h2>Participant List</h2>
          <table>
            <thead>
              <tr>
                <th>Demo Account</th>
                <th>Role</th>
                <th>Name</th>
                <th>Email</th>
                <th>Participant Type</th>
              </tr>
            </thead>
            <tbody>
              ${participantRows || '<tr><td colspan="5">No participants recorded.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Test Case Table</h2>
          <table>
            <thead>
              <tr>
                <th>Test Number</th>
                <th>Category</th>
                <th>Role</th>
                <th>Test Scenario</th>
                <th>Preconditions</th>
                <th>Test Steps</th>
                <th>Expected Results</th>
                <th>Actual Results</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${testCaseRows || '<tr><td colspan="10">No test cases recorded.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Results Summary</h2>
          <table>
            <tbody>
              <tr><th>Total Task</th><td>${summary.total}</td></tr>
              <tr><th>Pass</th><td>${summary.pass}</td></tr>
              <tr><th>Partial</th><td>${summary.partial}</td></tr>
              <tr><th>Fail</th><td>${summary.fail}</td></tr>
              <tr><th>Inapplicable</th><td>${summary.inapplicable}</td></tr>
              <tr><th>Result %</th><td>${summary.resultPercent.toFixed(1)}%</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Approval Sign-Off</h2>
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Name</th>
                <th>Unit</th>
                <th>Date</th>
                <th>Signature File Path</th>
                <th>Verified By</th>
                <th>Remarks</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>
              ${signoffRows || '<tr><td colspan="8">No sign-offs recorded.</td></tr>'}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;
}

export default UatWorkspace;

