import { NextResponse } from "next/server";

import { emitSessionEvent } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { tastingNoteSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const payload = await request.json();
  const parsed = tastingNoteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "The tasting card is missing required fields." },
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
    return NextResponse.json({ error: "Participant session not found." }, { status: 404 });
  }

  const gin = await prisma.gin.findFirst({
    where: {
      id: parsed.data.ginId,
      sessionId,
    },
    select: { id: true },
  });

  if (!gin) {
    return NextResponse.json({ error: "Gin not found for this session." }, { status: 404 });
  }

  const note = await prisma.tastingNote.upsert({
    where: {
      participantId_ginId: {
        participantId: participant.id,
        ginId: gin.id,
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
      ginId: gin.id,
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
