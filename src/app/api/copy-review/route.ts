import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const storePath = path.resolve(
  process.cwd(),
  "..",
  "work",
  "site-copy-overrides.json",
);

type CopyOverrides = Record<string, string>;

async function readOverrides(): Promise<CopyOverrides> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as CopyOverrides)
      : {};
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ overrides: {} });
  }

  return NextResponse.json({ overrides: await readOverrides() });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Inline copy saving is available only on the local development site." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as { key?: unknown; value?: unknown };
  const key = typeof body.key === "string" ? body.key.trim() : "";
  const value = typeof body.value === "string" ? body.value.trim() : "";

  if (!/^[a-z0-9.-]{3,100}$/.test(key)) {
    return NextResponse.json({ error: "Invalid copy key." }, { status: 400 });
  }

  if (!value || value.length > 2000) {
    return NextResponse.json(
      { error: "Copy must contain between 1 and 2,000 characters." },
      { status: 400 },
    );
  }

  const overrides = await readOverrides();
  overrides[key] = value;

  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");

  return NextResponse.json({ saved: true, key, value });
}
