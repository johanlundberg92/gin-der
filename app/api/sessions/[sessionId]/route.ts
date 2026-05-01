import { NextResponse } from "next/server";

import { emitSessionEvent } from "@/lib/events";
import { getRequestI18n } from "@/lib/request-locale";
import { prisma } from "@/lib/prisma";
import { getSessionById } from "@/lib/session-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { messages } = await getRequestI18n();
  const { sessionId } = await context.params;
  const session = await getSessionById(sessionId);

  if (!session) {
    return NextResponse.json({ error: messages.errors.sessionNotFound }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { messages } = await getRequestI18n();
  const { sessionId } = await context.params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: messages.errors.sessionNotFound }, { status: 404 });
  }

  emitSessionEvent(sessionId, "deleted");

  await prisma.session.delete({
    where: { id: sessionId },
  });

  return NextResponse.json({ ok: true });
}
