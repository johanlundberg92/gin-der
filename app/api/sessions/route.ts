import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { listSessions } from "@/lib/session-data";
import {
  generateAdminPin,
  generateJoinCodeCandidate,
  normalizeAdminPin,
} from "@/lib/session-logic";
import { createSessionSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function createUniqueJoinCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = generateJoinCodeCandidate();
    const existing = await prisma.session.findUnique({
      where: { joinCode: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique join code.");
}

export async function GET() {
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createSessionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid session payload.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const joinCode = await createUniqueJoinCode();
  const adminPin = normalizeAdminPin(parsed.data.adminPin ?? "") || generateAdminPin();
  const eventDate =
    parsed.data.eventDate && parsed.data.eventDate.trim().length > 0
      ? new Date(parsed.data.eventDate)
      : null;

  if (eventDate && Number.isNaN(eventDate.getTime())) {
    return NextResponse.json({ error: "Invalid event date." }, { status: 400 });
  }

  const session = await prisma.session.create({
    data: {
      name: parsed.data.name.trim(),
      eventDate,
      joinCode,
      adminPin,
      gins: {
        create: parsed.data.gins.map((gin, index) => ({
          order: index + 1,
          name: gin.name.trim(),
          distillery: gin.distillery?.trim() || null,
          abv: gin.abv ?? null,
          description: gin.description?.trim() || null,
        })),
      },
    },
    include: {
      gins: {
        orderBy: {
          order: "asc",
        },
      },
      participants: true,
    },
  });

  return NextResponse.json({
    session,
    adminPin,
  });
}
