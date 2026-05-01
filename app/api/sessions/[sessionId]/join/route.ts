import { cookies } from "next/headers";
import { SessionStage } from "@prisma/client";
import { NextResponse } from "next/server";

import { participantCookieName } from "@/lib/constants";
import { emitSessionEvent } from "@/lib/events";
import { getRequestI18n } from "@/lib/request-locale";
import { prisma } from "@/lib/prisma";
import { normalizeParticipantName } from "@/lib/session-logic";
import { joinSessionSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { messages } = await getRequestI18n();
  const { sessionId } = await context.params;
  const payload = await request.json();
  const parsed = joinSessionSchema.safeParse(payload);
  const cookieStore = await cookies();

  if (!parsed.success) {
    return NextResponse.json(
      { error: messages.errors.validParticipantName },
      { status: 400 },
    );
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, stage: true },
  });

  if (!session) {
    return NextResponse.json({ error: messages.errors.sessionNotFound }, { status: 404 });
  }

  const existingToken = cookieStore.get(participantCookieName(sessionId))?.value ?? "";
  if (existingToken) {
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        sessionId,
        accessToken: existingToken,
      },
    });

    if (existingParticipant) {
      const response = NextResponse.json({ participant: existingParticipant, existing: true });
      response.cookies.set(participantCookieName(sessionId), existingParticipant.accessToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
      return response;
    }
  }

  if (session.stage === SessionStage.COMPLETED) {
    return NextResponse.json(
      { error: messages.errors.tastingSessionEnded },
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

  const response = NextResponse.json({ participant });
  response.cookies.set(participantCookieName(sessionId), participant.accessToken, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return response;
}
