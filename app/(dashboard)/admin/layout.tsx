import { forbidden } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthContext();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) forbidden();

  return <div>{children}</div>;
}
