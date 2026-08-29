import { NextResponse } from "next/server";

// The prototype must not accept or log patient information. Replace this closed
// endpoint only when the practice has selected and approved its clinical
// communications workflow. A hosted clinical service should normally receive
// patient information directly rather than proxying it through this site.
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Contact submissions are not available in this prototype.",
    },
    { status: 503 },
  );
}
