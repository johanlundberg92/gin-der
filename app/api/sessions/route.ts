import { NextResponse } from "next/server";

import { adminCookieName } from "@/lib/constants";
import { getRequestI18n } from "@/lib/request-locale";
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
  const { messages } = await getRequestI18n();
  const payload = await request.json();
  const parsed = createSessionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: messages.errors.invalidSessionPayload, issues: parsed.error.flatten() },
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
    return NextResponse.json({ error: messages.errors.invalidEventDate }, { status: 400 });
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

  const response = NextResponse.json({
    session,
    adminPin,
  });
  response.cookies.set(adminCookieName(session.id), adminPin, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return response;
}
