import { requireAuth } from "../lib/auth";
import UatWorkspace from "../components/uat-workspace";

export default async function HomePage() {
  const user = await requireAuth();
  return <UatWorkspace user={user} />;
}
