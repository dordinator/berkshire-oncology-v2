import { NextResponse } from "next/server";

// Contact form endpoint. Currently a validating stub that accepts the enquiry.
// TODO (go-live): send the enquiry to practicemanager@berkshire-oncology.org.uk
// via an email provider (e.g. Resend) or the practice's SMTP — see the plan.
// Do not persist message bodies; forward only.
export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { firstName, lastName, email, subject, message, company } = data as Record<
    string,
    string
  >;

  // Honeypot — silently accept and drop.
  if (company) return NextResponse.json({ ok: true });

  if (!firstName || !lastName || !email || !subject || !message) {
    return NextResponse.json(
      { ok: false, error: "Please complete all fields." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Placeholder until the mail provider is wired up.
  console.log("[contact] enquiry received:", { firstName, lastName, email, subject });

  return NextResponse.json({ ok: true });
}
