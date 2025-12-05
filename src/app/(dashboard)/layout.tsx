import { ReactNode } from "react";
import { requireAuth } from "../../lib/auth";
import { UatProvider } from "../../components/uat-provider";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();
  return <UatProvider user={user}>{children}</UatProvider>;
}

