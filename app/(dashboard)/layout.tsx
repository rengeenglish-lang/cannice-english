import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { DashboardShell } from "@/components/admin/AdminShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");

  return <DashboardShell role={user.role}>{children}</DashboardShell>;
}
