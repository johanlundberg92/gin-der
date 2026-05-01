import { SessionStage } from "@prisma/client";

import { flavorFields, type FlavorField } from "@/lib/constants";
import type { SessionDetail } from "@/lib/session-data";

type NoteLike = {
  overallScore: number;
  customNotes: string | null;
} & Record<FlavorField, number>;

type GinResult = {
  id: string;
  order: number;
  name: string;
  distillery: string | null;
  abv: number | null;
  description: string | null;
  noteCount: number;
  averageOverall: number;
  flavorAverages: Record<FlavorField, number>;
  participantNote: NoteLike | null;
};

export type SessionResults = {
  sessionId: string;
  sessionName: string;
  joinCode: string;
  stage: SessionStage;
  totalParticipants: number;
  notesSubmitted: number;
  expectedNotes: number;
  completionRate: number;
  gins: GinResult[];
  topRatedGin: GinResult | null;
};

export function normalizeJoinCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

export function normalizeParticipantName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function normalizeAdminPin(value: string) {
  return value.trim().replace(/\s+/g, "").slice(0, 32);
}

export function generateAdminPin(length = 4) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export function generateJoinCodeCandidate(length = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
    "",
  );
}

export function getCurrentGin(session: Pick<SessionDetail, "gins" | "currentGinIndex">) {
  return session.gins[session.currentGinIndex] ?? session.gins[0] ?? null;
}

export function getNextStage(
  stage: SessionStage,
  currentGinIndex: number,
  ginCount: number,
) {
  switch (stage) {
    case SessionStage.SETUP:
      return { stage: SessionStage.LOBBY, currentGinIndex: 0 };
    case SessionStage.LOBBY:
      return { stage: SessionStage.TASTING, currentGinIndex: 0 };
    case SessionStage.TASTING:
      return { stage: SessionStage.REVEAL, currentGinIndex };
    case SessionStage.REVEAL:
      return currentGinIndex < ginCount - 1
        ? { stage: SessionStage.TASTING, currentGinIndex: currentGinIndex + 1 }
        : { stage: SessionStage.RESULTS, currentGinIndex };
    case SessionStage.RESULTS:
      return { stage: SessionStage.COMPLETED, currentGinIndex };
    case SessionStage.COMPLETED:
      return { stage: SessionStage.COMPLETED, currentGinIndex };
    default:
      return { stage, currentGinIndex };
  }
}

export function getAdvanceLabel(stage: SessionStage, currentGinIndex: number, ginCount: number) {
  switch (stage) {
    case SessionStage.SETUP:
      return "Open lobby";
    case SessionStage.LOBBY:
      return "Start tasting";
    case SessionStage.TASTING:
      return `Reveal gin ${currentGinIndex + 1}`;
    case SessionStage.REVEAL:
      return currentGinIndex < ginCount - 1 ? `Move to gin ${currentGinIndex + 2}` : "Show results";
    case SessionStage.RESULTS:
      return "Close session";
    case SessionStage.COMPLETED:
      return "Session completed";
    default:
      return "Advance";
  }
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function toNoteSnapshot(note?: Partial<NoteLike> | null): NoteLike | null {
  if (!note) {
    return null;
  }

  return {
    overallScore: note.overallScore ?? 0,
    customNotes: note.customNotes ?? null,
    juniper: note.juniper ?? 0,
    citrus: note.citrus ?? 0,
    floral: note.floral ?? 0,
    spice: note.spice ?? 0,
    herbal: note.herbal ?? 0,
    sweetness: note.sweetness ?? 0,
  };
}

export function buildSessionResults(
  session: SessionDetail,
  participantToken?: string | null,
): SessionResults {
  const participant = participantToken
    ? session.participants.find((candidate) => candidate.accessToken === participantToken)
    : null;

  const gins = session.gins.map((gin) => {
    const notes = gin.tastingNotes;
    const participantNote = participant?.tastingNotes.find((note) => note.ginId === gin.id) ?? null;

    const flavorAverages = flavorFields.reduce<Record<FlavorField, number>>((carry, field) => {
      carry[field] = average(notes.map((note) => note[field]));
      return carry;
    }, {} as Record<FlavorField, number>);

    return {
      id: gin.id,
      order: gin.order,
      name: gin.name,
      distillery: gin.distillery,
      abv: gin.abv,
      description: gin.description,
      noteCount: notes.length,
      averageOverall: average(notes.map((note) => note.overallScore)),
      flavorAverages,
      participantNote: toNoteSnapshot(participantNote),
    };
  });

  const notesSubmitted = session.gins.reduce((sum, gin) => sum + gin.tastingNotes.length, 0);
  const expectedNotes = session.gins.length * session.participants.length;
  const completionRate =
    expectedNotes === 0 ? 0 : Number(((notesSubmitted / expectedNotes) * 100).toFixed(1));
  const topRatedGin = [...gins].sort((left, right) => right.averageOverall - left.averageOverall)[0] ?? null;

  return {
    sessionId: session.id,
    sessionName: session.name,
    joinCode: session.joinCode,
    stage: session.stage,
    totalParticipants: session.participants.length,
    notesSubmitted,
    expectedNotes,
    completionRate,
    gins,
    topRatedGin,
  };
}
