import { NextResponse } from "next/server";

import { emitSessionEvent } from "@/lib/events";
import { getRequestI18n } from "@/lib/request-locale";
import { prisma } from "@/lib/prisma";
import {
  getAdvanceLabel,
  getNextStage,
  normalizeAdminPin,
} from "@/lib/session-logic";
import { advanceSessionSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { messages } = await getRequestI18n();
  const { sessionId } = await context.params;
  const payload = await request.json();
  const parsed = advanceSessionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: messages.errors.adminPinRequired }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      gins: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: messages.errors.sessionNotFound }, { status: 404 });
  }

  if (normalizeAdminPin(parsed.data.adminPin) !== session.adminPin) {
    return NextResponse.json({ error: messages.errors.invalidAdminPin }, { status: 403 });
  }

  const nextState = getNextStage(session.stage, session.currentGinIndex, session.gins.length);
  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: nextState,
    include: {
      gins: {
        orderBy: {
          order: "asc",
        },
      },
      participants: true,
    },
  });

  emitSessionEvent(sessionId, updated.stage);

  return NextResponse.json({
    session: updated,
    action: getAdvanceLabel(session.stage, session.currentGinIndex, session.gins.length),
  });
}
