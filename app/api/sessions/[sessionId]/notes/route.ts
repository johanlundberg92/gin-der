import { SessionStage } from "@prisma/client";
import { NextResponse } from "next/server";

import { emitSessionEvent } from "@/lib/events";
import { getRequestI18n } from "@/lib/request-locale";
import { prisma } from "@/lib/prisma";
import { tastingNoteSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { messages } = await getRequestI18n();
  const { sessionId } = await context.params;
  const payload = await request.json();
  const parsed = tastingNoteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: messages.errors.tastingCardMissingFields },
      { status: 400 },
    );
  }

  const participant = await prisma.participant.findFirst({
    where: {
      sessionId,
      accessToken: parsed.data.participantToken,
    },
    select: { id: true },
  });

  if (!participant) {
    return NextResponse.json(
      { error: messages.errors.participantSessionNotFound },
      { status: 404 },
    );
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      stage: true,
      currentGinIndex: true,
      gins: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: messages.errors.sessionNotFound }, { status: 404 });
  }

  if (session.stage !== SessionStage.TASTING) {
    return NextResponse.json({ error: messages.errors.tastingNotOpen }, { status: 409 });
  }

  const currentGin = session.gins[session.currentGinIndex] ?? null;

  if (!currentGin) {
    return NextResponse.json({ error: messages.errors.ginNotFoundForSession }, { status: 404 });
  }

  if (currentGin.id !== parsed.data.ginId) {
    return NextResponse.json({ error: messages.errors.currentGinOnly }, { status: 409 });
  }

  const note = await prisma.tastingNote.upsert({
    where: {
        participantId_ginId: {
          participantId: participant.id,
          ginId: currentGin.id,
        },
      },
    update: {
      overallScore: parsed.data.overallScore,
      juniper: parsed.data.juniper,
      citrus: parsed.data.citrus,
      floral: parsed.data.floral,
      spice: parsed.data.spice,
      herbal: parsed.data.herbal,
      sweetness: parsed.data.sweetness,
      customNotes: parsed.data.customNotes?.trim() || null,
      submittedAt: new Date(),
    },
    create: {
      participantId: participant.id,
      ginId: currentGin.id,
      overallScore: parsed.data.overallScore,
      juniper: parsed.data.juniper,
      citrus: parsed.data.citrus,
      floral: parsed.data.floral,
      spice: parsed.data.spice,
      herbal: parsed.data.herbal,
      sweetness: parsed.data.sweetness,
      customNotes: parsed.data.customNotes?.trim() || null,
    },
  });

  emitSessionEvent(sessionId);

  return NextResponse.json({ note });
}
