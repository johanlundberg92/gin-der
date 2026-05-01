import { NextResponse } from "next/server";

import { buildSessionResults } from "@/lib/session-logic";
import { getSessionById } from "@/lib/session-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await getSessionById(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const participantToken = searchParams.get("participantToken");

  return NextResponse.json({
    results: buildSessionResults(session, participantToken),
  });
}
