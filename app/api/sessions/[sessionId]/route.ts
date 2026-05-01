import { NextResponse } from "next/server";

import { emitSessionEvent } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { normalizeAdminPin } from "@/lib/session-logic";
import { getSessionById } from "@/lib/session-data";
import { advanceSessionSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await getSessionById(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const payload = await request.json();
  const parsed = advanceSessionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Admin PIN is required." }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      adminPin: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  if (normalizeAdminPin(parsed.data.adminPin) !== session.adminPin) {
    return NextResponse.json({ error: "Invalid admin PIN." }, { status: 403 });
  }

  emitSessionEvent(sessionId, "deleted");

  await prisma.session.delete({
    where: { id: sessionId },
  });

  return NextResponse.json({ ok: true });
}
