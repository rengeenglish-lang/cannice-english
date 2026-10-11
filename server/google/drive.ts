import "server-only";
import { db } from "@/server/db";
import { getSiteUrl } from "@/server/env";
import { getSetting, setSetting } from "@/server/services/settings.service";
import { open, seal } from "@/lib/crypto/secret-box";

/**
 * Google Drive archive for invoices. An admin connects a Google account once (Yönetim →
 * Faturalar); the site keeps that account's refresh token, encrypted, and only ever asks for the
 * `drive.file` scope — it can see and change the files and folders it created, nothing else.
 */
const TOKEN_KEY = "google_drive_refresh_token";
const ACCOUNT_KEY = "google_drive_account";
const PURPOSE = "google-drive";
export const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.file", "openid", "email"];
const ROOT_FOLDER_NAME = "Netfener Faturalar";

export const driveClientConfigured = () => Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_CLIENT_SECRET);
export const driveRedirectUri = () => `${getSiteUrl().replace(/\/$/, "")}/api/admin/google-drive/callback`;

export function driveAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_DRIVE_CLIENT_ID ?? "",
    redirect_uri: driveRedirectUri(),
    response_type: "code",
    scope: DRIVE_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Exchanges the consent code and stores the refresh token (encrypted) and the account's email. */
export async function completeDriveConnection(code: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET missing");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_DRIVE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET ?? "",
      redirect_uri: driveRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { refresh_token?: string; id_token?: string; error?: string };
  if (!res.ok || !body.refresh_token) throw new Error(body.error ?? "Google did not return a refresh token");
  const email = body.id_token ? (JSON.parse(Buffer.from(body.id_token.split(".")[1] ?? "", "base64url").toString() || "{}") as { email?: string }).email ?? "" : "";
  await setSetting(TOKEN_KEY, seal(body.refresh_token, secret, PURPOSE));
  await setSetting(ACCOUNT_KEY, email);
  // A new account means new folders.
  await db.driveFolder.deleteMany({});
  await db.invoice.updateMany({ data: { driveDirty: true, driveFileId: null } });
}

export async function disconnectDrive() {
  await db.appSetting.deleteMany({ where: { key: { in: [TOKEN_KEY, ACCOUNT_KEY] } } });
  await db.driveFolder.deleteMany({});
}

export async function driveStatus() {
  const [token, account] = await Promise.all([getSetting(TOKEN_KEY, ""), getSetting(ACCOUNT_KEY, "")]);
  return { clientConfigured: driveClientConfigured(), connected: Boolean(token), account };
}

async function accessToken() {
  const secret = process.env.AUTH_SECRET;
  const sealed = await getSetting(TOKEN_KEY, "");
  const refresh = sealed && secret ? open(sealed, secret, PURPOSE) : null;
  if (!refresh || !driveClientConfigured()) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_DRIVE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET ?? "",
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string; error?: string };
  if (!res.ok || !body.access_token) throw new Error(`Google token refresh failed: ${body.error ?? res.status}`);
  return body.access_token;
}

async function driveFetch(token: string, url: string, init: RequestInit = {}) {
  const res = await fetch(url, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.headers ?? {}) } });
  if (!res.ok) throw new Error(`Google Drive ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

async function createFolder(token: string, name: string, parent?: string) {
  const res = await driveFetch(token, "https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", ...(parent ? { parents: [parent] } : {}) }),
  });
  return ((await res.json()) as { id: string }).id;
}

/** The site's folder for a key, created once and remembered (a folder deleted in Drive is recreated). */
async function folderFor(token: string, key: string, name: string, parent?: string) {
  const known = await db.driveFolder.findUnique({ where: { key } });
  if (known) {
    const check = await fetch(`https://www.googleapis.com/drive/v3/files/${known.folderId}?fields=id,trashed`, { headers: { authorization: `Bearer ${token}` } });
    const meta = check.ok ? ((await check.json()) as { trashed?: boolean }) : null;
    if (meta && !meta.trashed) return known.folderId;
  }
  const folderId = await createFolder(token, name, parent);
  await db.driveFolder.upsert({ where: { key }, create: { key, folderId }, update: { folderId } });
  return folderId;
}

const safeName = (s: string) => s.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);

/**
 * Puts a PDF in "Netfener Faturalar / <customer>" — a new file, or new contents for `fileId` when
 * the invoice was already archived (e.g. after it was voided). Returns the Drive file id, or null
 * when Drive isn't connected.
 */
export async function archivePdf(input: { customerKey: string; customerName: string; fileName: string; pdf: Uint8Array; fileId?: string | null }) {
  const token = await accessToken();
  if (!token) return null;
  const root = await folderFor(token, "root", ROOT_FOLDER_NAME);
  const folder = await folderFor(token, `customer:${input.customerKey}`, safeName(input.customerName), root);
  const boundary = `nf${Date.now().toString(36)}`;
  const metadata = input.fileId ? { name: input.fileName } : { name: input.fileName, parents: [folder], mimeType: "application/pdf" };
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\ncontent-type: application/pdf\r\n\r\n`),
    Buffer.from(input.pdf),
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const url = input.fileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${input.fileId}?uploadType=multipart&fields=id`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id";
  try {
    const res = await driveFetch(token, url, { method: input.fileId ? "PATCH" : "POST", headers: { "content-type": `multipart/related; boundary=${boundary}` }, body });
    return ((await res.json()) as { id: string }).id;
  } catch (error) {
    // The archived copy was removed in Drive: upload a fresh one instead of failing forever.
    if (input.fileId && error instanceof Error && error.message.includes(" 404:")) return archivePdf({ ...input, fileId: null });
    throw error;
  }
}

export function driveFileLink(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}
