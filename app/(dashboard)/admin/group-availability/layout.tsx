import { forbidden } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
export default async function GroupAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthContext();
  if (user?.role !== "ADMIN") forbidden();
  return children;
}
