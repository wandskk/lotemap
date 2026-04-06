import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_BYTES = 8 * 1024 * 1024;

function mimeFromFilename(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  };
  return map[ext] ?? null;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Storage nao configurado (BLOB_READ_WRITE_TOKEN)" },
        { status: 503 },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
    }

    const effectiveType =
      file.type || mimeFromFilename(file.name) || "";

    if (!ALLOWED_TYPES.has(effectiveType)) {
      return NextResponse.json(
        {
          error:
            "Tipo nao permitido. Use JPEG, PNG, WebP, GIF ou SVG.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Arquivo muito grande (max 8 MB)" },
        { status: 400 },
      );
    }

    const safeName =
      file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
    const pathname = `lotemap/${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
      token,
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Erro ao enviar arquivo para o Blob";
    console.error("[upload/blob]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
