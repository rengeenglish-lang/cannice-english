import { z } from "zod";

// Provider implementations will be server-only; this file is a vendor-neutral contract.
export const intentSchema = z.enum([
  "INFORMATIONAL",
  "NAVIGATIONAL",
  "COMMERCIAL",
  "TRANSACTIONAL",
  "PRACTICE",
  "EXAM_PREPARATION",
]);
const text = z.string().trim().min(1).max(1000);
const localPath = z
  .string()
  .max(500)
  .regex(/^\/(?!\/)/)
  .refine((v) => !/[\\\u0000-\u001f]/.test(v));
export const briefSchema = z
  .object({
    primaryKeyword: text,
    secondaryKeywords: z.array(text).max(20),
    searchIntent: intentSchema,
    targetReader: text,
    readerProblem: text,
    readerGoal: text,
    title: text,
    alternativeTitles: z.array(text).max(5),
    slug: z.string().regex(/^[a-z0-9-]{3,160}$/),
    h1: text,
    outline: z
      .array(
        z
          .object({ heading: text, subheadings: z.array(text).max(10) })
          .strict(),
      )
      .min(1)
      .max(20),
    questions: z.array(text).max(20),
    catalogueIds: z.array(text).max(20),
    differentiation: text,
    competitorGaps: z.array(text).max(20),
    cta: z.object({ text, href: localPath }).strict(),
    wordRange: z
      .object({
        min: z.number().int().min(100),
        max: z.number().int().max(10000),
      })
      .strict()
      .refine((r) => r.min <= r.max),
    warnings: z.array(text).max(30),
  })
  .strict();
export const metadataSchema = z
  .object({
    title: text,
    description: text,
    canonicalPath: localPath,
    ogTitle: text,
    ogDescription: text,
  })
  .strict();
export const articleSchema = z
  .object({
    title: text,
    markdown: z.string().min(100).max(100000),
    metadata: metadataSchema,
    warnings: z.array(text).max(30),
  })
  .strict();
export const linksSchema = z
  .array(
    z
      .object({
        sourcePath: localPath,
        anchor: text,
        destination: localPath,
        reason: text,
        relevance: z.number().min(0).max(100),
      })
      .strict(),
  )
  .max(30);
export const reviewSchema = z
  .object({
    score: z.number().min(0).max(100),
    issues: z.array(text).max(50),
    factualWarnings: z.array(text).max(50),
  })
  .strict();
export type ProviderContext = {
  languageCode: string;
  keyword: string;
  // Only relevant, curated catalogue entries, never personal/student/payment data.
  catalogue: { id: string; title: string; href: string; access: string }[];
  signal?: AbortSignal;
};
export type ProviderResult<T> = {
  output: T;
  provider: string;
  model: string;
  promptVersion: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number | null;
  };
};
export interface AIProvider {
  generateBrief(
    context: ProviderContext,
  ): Promise<ProviderResult<z.infer<typeof briefSchema>>>;
  generateArticle(
    context: ProviderContext,
    brief: z.infer<typeof briefSchema>,
  ): Promise<ProviderResult<z.infer<typeof articleSchema>>>;
  analyzeIntent(
    context: ProviderContext,
  ): Promise<ProviderResult<z.infer<typeof intentSchema>>>;
  generateMetadata(
    context: ProviderContext,
    markdown: string,
  ): Promise<ProviderResult<z.infer<typeof metadataSchema>>>;
  suggestInternalLinks(
    context: ProviderContext,
    markdown: string,
  ): Promise<ProviderResult<z.infer<typeof linksSchema>>>;
  evaluateContent(
    context: ProviderContext,
    markdown: string,
  ): Promise<ProviderResult<z.infer<typeof reviewSchema>>>;
  refreshArticle(
    context: ProviderContext,
    markdown: string,
  ): Promise<ProviderResult<z.infer<typeof articleSchema>>>;
}
export interface ImageProvider {
  generate(input: {
    prompt: string;
    alt: string;
    articleId: string;
    signal?: AbortSignal;
  }): Promise<{
    assetUrl: string;
    prompt: string;
    provider: string;
    model: string;
    generatedAt: string;
    alt: string;
    articleId: string;
  }>;
}
/** Always validate at the adapter boundary before any future persistence. */
export function parseProviderOutput<T>(
  schema: z.ZodType<T>,
  output: unknown,
): T {
  return schema.parse(output);
}
