import "server-only";
import { cache } from "react";
import { getAuthContext } from "@/server/auth/context";
import { getExamInterests } from "@/server/services/exam-interests.service";
import { allowedExamSlugs, type InterestCode } from "@/lib/exam-interests";

/**
 * Which exams' study material the current viewer may open (null = everything). Cached per request
 * so several checks on one page cost one query.
 */
export const viewerExamAccess = cache(async () => {
  const user = await getAuthContext();
  if (!user || user.role !== "STUDENT") return { allowed: null, interests: [] as InterestCode[] };
  const interests = (await getExamInterests(user.id)).map((i) => i.code);
  return { allowed: allowedExamSlugs(interests), interests };
});
