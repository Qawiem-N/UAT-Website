import { ApprovalSignoff, Participant, TestCase, UatProject } from "./types";

export function buildReportHtml({
  project,
  participants,
  testCases,
  summary,
  approvals,
}: {
  project: Pick<UatProject, "name" | "testVersion" | "month">;
  participants: Participant[];
  testCases: TestCase[];
  summary: { total: number; pass: number; partial: number; fail: number; inapplicable: number; resultPercent: number };
  approvals: ApprovalSignoff[];
}) {
  const styles = `
    :root {
      color-scheme: light;
    }
    body { font-family: "Inter", system-ui, -apple-system, sans-serif; color: #0f172a; margin: 24px; background: #f8fafc; }
    h1, h2 { margin: 0 0 8px; }
    h1 { font-size: 22px; }
    h2 { font-size: 16px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; vertical-align: top; font-size: 12px; }
    th { background: #e2e8f0; color: #0f172a; }
    tbody tr:nth-child(every) { background: #fff; }
    tbody tr:nth-child(odd) { background: #f8fafc; }
    .section { margin-bottom: 24px; padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 9999px; background: #eef2ff; color: #3730a3; font-weight: 600; font-size: 11px; }
  `;

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

  const approvalRows = approvals
    .map(
      (a) => `
      <tr>
        <td>${a.role}</td>
        <td>${a.name}</td>
        <td>${a.unit}</td>
        <td>${a.date}</td>
        <td>${a.signatureFilePath}</td>
        <td>${a.verifiedBy}</td>
        <td>${a.remarks}</td>
        <td>${a.month}</td>
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
              ${approvalRows || '<tr><td colspan="8">No sign-offs recorded.</td></tr>'}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;
}

