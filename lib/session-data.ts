import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const orderedGinInclude = Prisma.validator<Prisma.GinDefaultArgs>()({
  include: {
    tastingNotes: true,
  },
});

export const sessionDetailInclude = Prisma.validator<Prisma.SessionInclude>()({
  gins: {
    orderBy: {
      order: "asc",
    },
    include: {
      tastingNotes: true,
    },
  },
  participants: {
    orderBy: {
      joinedAt: "asc",
    },
    include: {
      tastingNotes: true,
    },
  },
});

export type SessionDetail = Prisma.SessionGetPayload<{
  include: typeof sessionDetailInclude;
}>;

export async function getSessionById(sessionId: string) {
  return prisma.session.findUnique({
    where: { id: sessionId },
    include: sessionDetailInclude,
  });
}

export async function getSessionByJoinCode(joinCode: string) {
  return prisma.session.findUnique({
    where: { joinCode },
    include: sessionDetailInclude,
  });
}

export async function listSessions() {
  return prisma.session.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      gins: {
        orderBy: {
          order: "asc",
        },
      },
      participants: true,
    },
  });
}
