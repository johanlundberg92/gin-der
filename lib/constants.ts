import { SessionStage } from "@prisma/client";

export const flavorFields = [
  "juniper",
  "citrus",
  "floral",
  "spice",
  "herbal",
  "sweetness",
] as const;

export type FlavorField = (typeof flavorFields)[number];

export const stageLabels: Record<SessionStage, string> = {
  SETUP: "Setup",
  LOBBY: "Lobby",
  TASTING: "Tasting",
  REVEAL: "Reveal",
  RESULTS: "Results",
  COMPLETED: "Completed",
};

export const adminCookieName = (sessionId: string) => `gin-der-admin-${sessionId}`;
export const participantCookieName = (sessionId: string) =>
  `gin-der-participant-${sessionId}`;

export const defaultRemotePort = Number(process.env.APP_HOST_PORT ?? 3000);
