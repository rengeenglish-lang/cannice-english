import "server-only";
import { db } from "@/server/db";

export function listStudentsForAdmin(search?: string) {
  return db.user.findMany({
    where: {
      role: "STUDENT",
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {}),
    },
    orderBy: { name: "asc" },
    take: 100,
  });
}

export function getStudentForAdmin(id: string) {
  return db.user.findFirst({ where: { id, role: "STUDENT" } });
}
