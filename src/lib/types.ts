export type AuthProvider = "sso" | "magic-link";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  isInternal: boolean;
};

export type UatProject = {
  id: string;
  name: string;
  testVersion: string;
  month: string;
  createdAt: string;
};

export type ParticipantType = "internal" | "vendor" | "external";

export type Participant = {
  id: string;
  projectId: string;
  demoAccount: string;
  role: string;
  name: string;
  email: string;
  participantType: ParticipantType;
};

export type TestStatus = "Pass" | "Partial" | "Fail" | "Inapplicable" | "";

export type TestCase = {
  id: string;
  projectId: string;
  testNumber: string;
  category: string;
  role: string;
  testScenario: string;
  preconditions: string;
  testSteps: string;
  expectedResults: string;
  actualResults: string;
  status: TestStatus;
  remarks: string;
};

export type ApprovalSignoff = {
  id: string;
  projectId: string;
  role: string;
  name: string;
  unit: string;
  date: string;
  signatureFilePath: string;
  signaturePreviewUrl?: string;
  verifiedBy: string;
  remarks: string;
  month: string;
};

