import { z } from "zod";
export const linkSchema = z.object({ itemId: z.string().min(1).max(100), label: z.string().trim().min(2).max(160) }).strict();
export const linksSchema = z.array(linkSchema).max(12).refine(v => new Set(v.map(i => i.itemId)).size === v.length, "Bağlantılar tekrarlanamaz.");
export const clusterSchema = z.object({
  id: z.string().min(1).max(100), name: z.string().trim().min(3).max(160),
  pillarId: z.string().min(1).max(100), supportingIds: z.array(z.string().min(1).max(100)).min(1).max(30),
}).strict().refine(v => !v.supportingIds.includes(v.pillarId) && new Set(v.supportingIds).size === v.supportingIds.length, "Ana sayfa destekleyici sayfa olamaz; tekrar kullanmayın.");
export const clustersSchema = z.object({ revision: z.number().int().min(0), clusters: z.array(clusterSchema).max(100) }).strict();
export const CLUSTERS_KEY = "seo_clusters_v1";
