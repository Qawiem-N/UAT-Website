"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ApprovalSignoff,
  AuthUser,
  ChangeLog,
  Participant,
  TestCase,
  UatProject,
} from "../lib/types";
import {
  createProject,
  deleteApproval,
  deleteParticipant,
  deleteTestCase,
  fetchApprovals,
  fetchChangeLog,
  fetchParticipants,
  fetchProjects,
  fetchTestCases,
  logChange,
  updateProject,
  upsertApproval,
  upsertParticipant,
  upsertTestCase,
} from "../lib/data-service";

type ContextValue = {
  user: AuthUser;
  projects: UatProject[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  loading: boolean;
  error: string | null;
  testCases: TestCase[];
  participants: Participant[];
  approvals: ApprovalSignoff[];
  changes: ChangeLog[];
  summary: {
    total: number;
    pass: number;
    partial: number;
    fail: number;
    inapplicable: number;
    resultPercent: number;
  };
  createProject: (data: Pick<UatProject, "name" | "testVersion" | "month">) => Promise<void>;
  updateProject: (project: UatProject) => Promise<void>;
  saveTestCase: (tc: TestCase) => Promise<void>;
  removeTestCase: (id: string) => Promise<void>;
  saveParticipant: (p: Participant) => Promise<void>;
  removeParticipant: (id: string) => Promise<void>;
  saveApproval: (a: ApprovalSignoff) => Promise<void>;
  removeApproval: (id: string) => Promise<void>;
};

const UatContext = createContext<ContextValue | null>(null);

export function UatProvider({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const [projects, setProjects] = useState<UatProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [approvals, setApprovals] = useState<ApprovalSignoff[]>([]);
  const [changes, setChanges] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const projectList = await fetchProjects();
      setProjects(projectList);
      const firstId = projectList[0]?.id ?? null;
      setActiveProjectId((prev) => prev ?? firstId);
      if (firstId) {
        await loadProjectData(firstId);
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!activeProjectId) return;
    loadProjectData(activeProjectId);
  }, [activeProjectId]);

  async function loadProjectData(projectId: string) {
    setLoading(true);
    const [cases, parts, appr, logs] = await Promise.all([
      fetchTestCases(projectId),
      fetchParticipants(projectId),
      fetchApprovals(projectId),
      fetchChangeLog(projectId),
    ]);
    setTestCases(cases);
    setParticipants(parts);
    setApprovals(appr);
    setChanges(logs);
    setLoading(false);
  }

  async function handleCreateProject(payload: Pick<UatProject, "name" | "testVersion" | "month">) {
    setLoading(true);
    const result = await createProject(payload);
    if (result.error || !result.data) {
      setError(result.error ?? "Unable to create project");
      setLoading(false);
      return;
    }
    setProjects((prev) => [result.data!, ...prev]);
    setActiveProjectId(result.data!.id);
    setError(null);
    setLoading(false);
  }

  async function handleUpdateProject(project: UatProject) {
    const previous = projects.find((p) => p.id === project.id);
    const result = await updateProject(project);
    if (result.error || !result.data) {
      setError(result.error ?? "Unable to update project");
      return;
    }
    setProjects((prev) => prev.map((p) => (p.id === project.id ? result.data! : p)));
    await logDiffs("project", previous, result.data, user.name, ["name", "testVersion", "month"]);
    await refreshChanges();
  }

  async function saveTestCase(tc: TestCase) {
    const previous = testCases.find((item) => item.id === tc.id);
    const result = await upsertTestCase(tc, user.name);
    if (result.data) {
      setTestCases((prev) => {
        const exists = prev.some((item) => item.id === tc.id);
        if (exists) {
          return prev.map((item) => (item.id === tc.id ? result.data! : item));
        }
        return [...prev, result.data!];
      });
      await logDiffs("test_case", previous, result.data, user.name, [
        "testNumber",
        "category",
        "role",
        "testScenario",
        "preconditions",
        "testSteps",
        "expectedResults",
        "actualResults",
        "status",
        "remarks",
      ]);
      await refreshChanges();
    }
  }

  async function removeTestCase(id: string) {
    if (!activeProjectId) return;
    const previous = testCases.find((tc) => tc.id === id);
    await deleteTestCase(activeProjectId, id, user.name);
    setTestCases((prev) => prev.filter((item) => item.id !== id));
    if (previous) {
      await logChange(activeProjectId, "test_case", id, "deleted", previous.testScenario, null, user.name);
    }
    await refreshChanges();
  }

  async function saveParticipant(p: Participant) {
    const previous = participants.find((item) => item.id === p.id);
    const result = await upsertParticipant(p, user.name);
    if (result.data) {
      setParticipants((prev) => {
        const exists = prev.some((item) => item.id === p.id);
        if (exists) {
          return prev.map((item) => (item.id === p.id ? result.data! : item));
        }
        return [...prev, result.data!];
      });
      await logDiffs("participant", previous, result.data, user.name, [
        "demoAccount",
        "role",
        "name",
        "email",
        "participantType",
      ]);
      await refreshChanges();
    }
  }

  async function removeParticipant(id: string) {
    if (!activeProjectId) return;
    const previous = participants.find((p) => p.id === id);
    await deleteParticipant(activeProjectId, id, user.name);
    setParticipants((prev) => prev.filter((item) => item.id !== id));
    if (previous) {
      await logChange(activeProjectId, "participant", id, "deleted", previous.name, null, user.name);
    }
    await refreshChanges();
  }

  async function saveApproval(a: ApprovalSignoff) {
    const previous = approvals.find((item) => item.id === a.id);
    const result = await upsertApproval(a, user.name);
    if (result.data) {
      setApprovals((prev) => {
        const exists = prev.some((item) => item.id === a.id);
        if (exists) {
          return prev.map((item) => (item.id === a.id ? result.data! : item));
        }
        return [...prev, result.data!];
      });
      await logDiffs("approval_signoff", previous, result.data, user.name, [
        "role",
        "name",
        "unit",
        "date",
        "signatureFilePath",
        "verifiedBy",
        "remarks",
        "month",
      ]);
      await refreshChanges();
    }
  }

  async function removeApproval(id: string) {
    if (!activeProjectId) return;
    const previous = approvals.find((p) => p.id === id);
    await deleteApproval(activeProjectId, id, user.name);
    setApprovals((prev) => prev.filter((item) => item.id !== id));
    if (previous) {
      await logChange(activeProjectId, "approval_signoff", id, "deleted", previous.name, null, user.name);
    }
    await refreshChanges();
  }

  async function refreshChanges() {
    if (!activeProjectId) return;
    const logs = await fetchChangeLog(activeProjectId);
    setChanges(logs);
  }

  const summary = useMemo(() => {
    const total = testCases.length;
    const pass = testCases.filter((tc) => tc.status === "Pass").length;
    const partial = testCases.filter((tc) => tc.status === "Partial").length;
    const fail = testCases.filter((tc) => tc.status === "Fail").length;
    const inapplicable = testCases.filter((tc) => tc.status === "Inapplicable").length;
    const denominator = Math.max(total - inapplicable, 0);
    const resultPercent = denominator ? (pass / denominator) * 100 : 0;
    return { total, pass, partial, fail, inapplicable, resultPercent };
  }, [testCases]);

  const value: ContextValue = {
    user,
    projects,
    activeProjectId,
    setActiveProjectId,
    loading,
    error,
    testCases,
    participants,
    approvals,
    changes,
    summary,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    saveTestCase,
    removeTestCase,
    saveParticipant,
    removeParticipant,
    saveApproval,
    removeApproval,
  };

  return <UatContext.Provider value={value}>{children}</UatContext.Provider>;
}

async function logDiffs<T extends { projectId?: string; id: string }>(
  entity: "test_case" | "participant" | "approval_signoff" | "project",
  previous: T | undefined,
  next: T,
  userName: string,
  fields: (keyof T)[]
) {
  for (const field of fields) {
    const before = previous ? (previous[field] as any) ?? null : null;
    const after = (next[field] as any) ?? null;
    if (before === after) continue;
    await logChange(
      (next as any).projectId ?? next.id,
      entity,
      next.id,
      String(field),
      before !== null ? String(before) : null,
      after !== null ? String(after) : null,
      userName
    );
  }
}

export function useUat() {
  const ctx = useContext(UatContext);
  if (!ctx) {
    throw new Error("useUat must be used inside UatProvider");
  }
  return ctx;
}

