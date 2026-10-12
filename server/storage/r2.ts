import "server-only";
import { AwsClient } from "aws4fetch";

/**
 * Cloudflare R2 (S3-compatible) for videos. Browsers upload and play straight from R2 through
 * short-lived signed URLs, so files never pass through (or count against) Vercel. Both buckets are
 * private; every read goes through a URL this server signed after checking who is asking.
 *
 * Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_REVIEWS_BUCKET, R2_LESSONS_BUCKET.
 */
export type R2Bucket = "reviews" | "lessons";

function bucketName(bucket: R2Bucket) {
  return (bucket === "reviews" ? process.env.R2_REVIEWS_BUCKET : process.env.R2_LESSONS_BUCKET)?.trim() || "";
}

export function r2Configured(bucket: R2Bucket) {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && bucketName(bucket));
}

let client: AwsClient | null = null;
function r2() {
  client ??= new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!.trim(),
    service: "s3",
    region: "auto",
  });
  return client;
}

function objectUrl(bucket: R2Bucket, key: string) {
  if (!r2Configured(bucket)) throw new Error("Video depolama henüz ayarlanmadı.");
  const path = key.split("/").map(encodeURIComponent).join("/");
  return new URL(`https://${process.env.R2_ACCOUNT_ID!.trim()}.r2.cloudflarestorage.com/${bucketName(bucket)}/${path}`);
}

async function presign(bucket: R2Bucket, key: string, method: string, expiresSec: number, headers?: Record<string, string>, query?: Record<string, string>) {
  const url = objectUrl(bucket, key);
  url.searchParams.set("X-Amz-Expires", String(expiresSec));
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);
  const signed = await r2().sign(url.toString(), { method, headers, aws: { signQuery: true } });
  return signed.url;
}

/** URL the browser PUTs the file to. The Content-Type is signed, so it must match exactly. */
export function presignUpload(bucket: R2Bucket, key: string, contentType: string, expiresSec = 60 * 30) {
  return presign(bucket, key, "PUT", expiresSec, { "content-type": contentType });
}

/** URL a <video> element can stream from (range requests work). */
export function presignDownload(bucket: R2Bucket, key: string, expiresSec = 60 * 60) {
  return presign(bucket, key, "GET", expiresSec);
}

/** Size and type of an uploaded object, or null when it isn't there. */
export async function headObject(bucket: R2Bucket, key: string) {
  const res = await r2().fetch(objectUrl(bucket, key).toString(), { method: "HEAD" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`R2 HEAD ${res.status}`);
  return { size: Number(res.headers.get("content-length") ?? 0), contentType: res.headers.get("content-type") ?? "" };
}

export async function deleteObject(bucket: R2Bucket, key: string) {
  const res = await r2().fetch(objectUrl(bucket, key).toString(), { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`R2 DELETE ${res.status}`);
}

// Multipart uploads, for lesson videos larger than a single PUT comfortably allows.

export async function createMultipartUpload(bucket: R2Bucket, key: string, contentType: string) {
  const url = objectUrl(bucket, key);
  url.searchParams.set("uploads", "");
  const res = await r2().fetch(url.toString(), { method: "POST", headers: { "content-type": contentType } });
  if (!res.ok) throw new Error(`R2 multipart start ${res.status}`);
  const uploadId = /<UploadId>([^<]+)<\/UploadId>/.exec(await res.text())?.[1];
  if (!uploadId) throw new Error("R2 multipart start: no UploadId");
  return uploadId;
}

export function presignUploadPart(bucket: R2Bucket, key: string, uploadId: string, partNumber: number, expiresSec = 60 * 60) {
  return presign(bucket, key, "PUT", expiresSec, undefined, { partNumber: String(partNumber), uploadId });
}

export async function completeMultipartUpload(bucket: R2Bucket, key: string, uploadId: string, parts: { partNumber: number; etag: string }[]) {
  const url = objectUrl(bucket, key);
  url.searchParams.set("uploadId", uploadId);
  const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = `<CompleteMultipartUpload>${parts
    .sort((a, b) => a.partNumber - b.partNumber)
    .map((p) => `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>${xmlEscape(p.etag)}</ETag></Part>`)
    .join("")}</CompleteMultipartUpload>`;
  const res = await r2().fetch(url.toString(), { method: "POST", body, headers: { "content-type": "application/xml" } });
  if (!res.ok) throw new Error(`R2 multipart complete ${res.status}`);
}

export async function abortMultipartUpload(bucket: R2Bucket, key: string, uploadId: string) {
  const url = objectUrl(bucket, key);
  url.searchParams.set("uploadId", uploadId);
  await r2().fetch(url.toString(), { method: "DELETE" }).catch(() => undefined);
}
