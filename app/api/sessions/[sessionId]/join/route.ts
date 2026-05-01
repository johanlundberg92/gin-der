import { SessionStage } from "@prisma/client";
import { NextResponse } from "next/server";

import { emitSessionEvent } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { normalizeParticipantName } from "@/lib/session-logic";
import { joinSessionSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const payload = await request.json();
  const parsed = joinSessionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid participant name." },
      { status: 400 },
    );
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, stage: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  if (session.stage === SessionStage.COMPLETED) {
    return NextResponse.json(
      { error: "This tasting session has already ended." },
      { status: 400 },
    );
  }

  const participant = await prisma.participant.create({
    data: {
      sessionId,
      name: normalizeParticipantName(parsed.data.name),
      accessToken: crypto.randomUUID(),
    },
  });

  emitSessionEvent(sessionId, session.stage);

  return NextResponse.json({ participant });
}
