import { getSupabaseClient } from "./supabase-client";
import { ApprovalSignoff, ChangeLog, Participant, TestCase, UatProject } from "./types";

type UpsertResult<T> = { data: T | null; error?: string };

const supabase = getSupabaseClient();

export async function fetchProjects(): Promise<UatProject[]> {
  const { data, error } = await supabase
    .from("uat_project")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchProjects error", error);
    return [];
  }
  return (data ?? []).map(mapProject);
}

export async function createProject(payload: Pick<UatProject, "name" | "testVersion" | "month">): Promise<UpsertResult<UatProject>> {
  const { data, error } = await supabase
    .from("uat_project")
    .insert({
      name: payload.name,
      test_version: payload.testVersion,
      month: payload.month,
    })
    .select()
    .single();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: mapProject(data) };
}

export async function updateProject(project: UatProject): Promise<UpsertResult<UatProject>> {
  const { data, error } = await supabase
    .from("uat_project")
    .update({
      name: project.name,
      test_version: project.testVersion,
      month: project.month,
    })
    .eq("id", project.id)
    .select()
    .single();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: mapProject(data) };
}

export async function fetchTestCases(projectId: string): Promise<TestCase[]> {
  const { data, error } = await supabase
    .from("test_case")
    .select("*")
    .eq("project_id", projectId)
    .order("test_number", { ascending: true });
  if (error) {
    console.error("fetchTestCases error", error);
    return [];
  }
  return (data ?? []).map(mapTestCase);
}

export async function upsertTestCase(testCase: TestCase, userName: string): Promise<UpsertResult<TestCase>> {
  const payload = unmapTestCase(testCase);
  const { data, error } = await supabase.from("test_case").upsert(payload).select().single();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: mapTestCase(data) };
}

export async function deleteTestCase(projectId: string, id: string, userName: string) {
  const { error } = await supabase.from("test_case").delete().eq("id", id);
  if (error) {
    console.error("deleteTestCase error", error);
    return;
  }
}

export async function fetchParticipants(projectId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from("participant")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchParticipants error", error);
    return [];
  }
  return (data ?? []).map(mapParticipant);
}

export async function upsertParticipant(participant: Participant, userName: string): Promise<UpsertResult<Participant>> {
  const { data, error } = await supabase.from("participant").upsert(unmapParticipant(participant)).select().single();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: mapParticipant(data) };
}

export async function deleteParticipant(projectId: string, id: string, userName: string) {
  const { error } = await supabase.from("participant").delete().eq("id", id);
  if (error) {
    console.error("deleteParticipant error", error);
    return;
  }
}

export async function fetchApprovals(projectId: string): Promise<ApprovalSignoff[]> {
  const { data, error } = await supabase
    .from("approval_signoff")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchApprovals error", error);
    return [];
  }
  return (data ?? []).map(mapApproval);
}

export async function upsertApproval(signoff: ApprovalSignoff, userName: string): Promise<UpsertResult<ApprovalSignoff>> {
  const { data, error } = await supabase.from("approval_signoff").upsert(unmapApproval(signoff)).select().single();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: mapApproval(data) };
}

export async function deleteApproval(projectId: string, id: string, userName: string) {
  const { error } = await supabase.from("approval_signoff").delete().eq("id", id);
  if (error) {
    console.error("deleteApproval error", error);
    return;
  }
}

export async function fetchChangeLog(projectId: string): Promise<ChangeLog[]> {
  const { data, error } = await supabase
    .from("change_log")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchChangeLog error", error);
    return [];
  }
  return (data ?? []).map(mapChange);
}

export async function logChange(
  projectId: string,
  entity: ChangeLog["entity"],
  entityId: string,
  field: string,
  oldValue: string | null,
  newValue: string | null,
  userName: string
) {
  const { error } = await supabase.from("change_log").insert({
    project_id: projectId,
    entity,
    entity_id: entityId,
    field,
    old_value: oldValue,
    new_value: newValue,
    user_name: userName,
  });
  if (error) {
    console.error("logChange error", error);
  }
}

function mapProject(row: any): UatProject {
  return {
    id: row.id,
    name: row.name ?? "",
    testVersion: row.test_version ?? "",
    month: row.month ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function mapTestCase(row: any): TestCase {
  return {
    id: row.id,
    projectId: row.project_id,
    testNumber: row.test_number ?? "",
    category: row.category ?? "",
    role: row.role ?? "",
    testScenario: row.test_scenario ?? "",
    preconditions: row.preconditions ?? "",
    testSteps: row.test_steps ?? "",
    expectedResults: row.expected_results ?? "",
    actualResults: row.actual_results ?? "",
    status: row.status ?? "",
    remarks: row.remarks ?? "",
  };
}

function unmapTestCase(tc: TestCase) {
  return {
    id: tc.id,
    project_id: tc.projectId,
    test_number: tc.testNumber,
    category: tc.category,
    role: tc.role,
    test_scenario: tc.testScenario,
    preconditions: tc.preconditions,
    test_steps: tc.testSteps,
    expected_results: tc.expectedResults,
    actual_results: tc.actualResults,
    status: tc.status,
    remarks: tc.remarks,
  };
}

function mapParticipant(row: any): Participant {
  return {
    id: row.id,
    projectId: row.project_id,
    demoAccount: row.demo_account ?? "",
    role: row.role ?? "",
    name: row.name ?? "",
    email: row.email ?? "",
    participantType: row.participant_type ?? "external",
  };
}

function unmapParticipant(p: Participant) {
  return {
    id: p.id,
    project_id: p.projectId,
    demo_account: p.demoAccount,
    role: p.role,
    name: p.name,
    email: p.email,
    participant_type: p.participantType,
  };
}

function mapApproval(row: any): ApprovalSignoff {
  return {
    id: row.id,
    projectId: row.project_id,
    role: row.role ?? "",
    name: row.name ?? "",
    unit: row.unit ?? "",
    date: row.date ?? "",
    signatureFilePath: row.signature_file_path ?? "",
    verifiedBy: row.verified_by ?? "",
    remarks: row.remarks ?? "",
    month: row.month ?? "",
  };
}

function unmapApproval(a: ApprovalSignoff) {
  return {
    id: a.id,
    project_id: a.projectId,
    role: a.role,
    name: a.name,
    unit: a.unit,
    date: a.date,
    signature_file_path: a.signatureFilePath,
    verified_by: a.verifiedBy,
    remarks: a.remarks,
    month: a.month,
  };
}

function mapChange(row: any): ChangeLog {
  return {
    id: row.id,
    projectId: row.project_id,
    entity: row.entity,
    entityId: row.entity_id,
    field: row.field,
    oldValue: row.old_value,
    newValue: row.new_value,
    userName: row.user_name ?? "Unknown",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

