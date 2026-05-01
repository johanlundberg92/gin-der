import { SessionStage } from "@prisma/client";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Info, Users } from "lucide-react";

import { JoinSessionCard } from "@/components/participant/join-session-card";
import { TastingNoteForm } from "@/components/participant/tasting-note-form";
import { ResultsPanel } from "@/components/results/results-panel";
import { SessionLiveSync } from "@/components/session-live-sync";
import { participantCookieName } from "@/lib/constants";
import { getStageLabel } from "@/lib/i18n";
import { getRequestI18n } from "@/lib/request-locale";
import { getSessionByJoinCode } from "@/lib/session-data";
import { buildSessionResults, getCurrentGin, normalizeJoinCode } from "@/lib/session-logic";

type PageProps = {
  params: Promise<{ joinCode: string }>;
};

export const dynamic = "force-dynamic";

export default async function SessionPage({ params }: PageProps) {
  const { messages } = await getRequestI18n();
  const { joinCode } = await params;
  const session = await getSessionByJoinCode(normalizeJoinCode(joinCode));

  if (!session) {
    notFound();
  }

  const cookieStore = await cookies();
  const participantToken = cookieStore.get(participantCookieName(session.id))?.value ?? null;
  const participant =
    session.participants.find((candidate) => candidate.accessToken === participantToken) ?? null;
  const currentGin = getCurrentGin(session);
  const currentNote =
    currentGin && participant
      ? participant.tastingNotes.find((note) => note.ginId === currentGin.id) ?? null
      : null;
  const results = buildSessionResults(session, participantToken);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 py-4 sm:py-6">
      <SessionLiveSync sessionId={session.id} />

      <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
              Join code {session.joinCode}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-white sm:text-4xl">
              {session.name}
            </h1>
            <p className="mt-2 text-sm text-stone-300">
              {messages.join.description}
            </p>
          </div>

          <div className="space-y-2 text-right">
            <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-100">
              {getStageLabel(session.stage, messages)}
            </span>
            <p className="text-sm text-stone-300">
              {session.participants.length}{" "}
              {session.participants.length === 1
                ? messages.common.participantsSingular
                : messages.common.participantsPlural}
            </p>
          </div>
        </div>
      </section>

      {!participant ? (
        <JoinSessionCard sessionId={session.id} joinCode={session.joinCode} sessionName={session.name} />
      ) : null}

      {participant ? (
        <>
          <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                  {messages.session.signedInAs}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">{participant.name}</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm text-stone-200">
                <Users className="h-4 w-4 text-amber-200" />
                {results.notesSubmitted}/{results.expectedNotes || session.gins.length}{" "}
                {messages.session.cardsSubmitted}
              </div>
            </div>
          </section>

          {(session.stage === SessionStage.SETUP || session.stage === SessionStage.LOBBY) && (
            <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <p className="inline-flex items-center gap-2 text-sm text-amber-200">
                <Info className="h-4 w-4" />
                {messages.session.lobbyEyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-3xl text-white">
                {messages.session.lobbyTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
                {messages.session.lobbyDescription}
              </p>
            </section>
          )}

          {session.stage === SessionStage.TASTING && currentGin && (
            <TastingNoteForm
              sessionId={session.id}
              participantToken={participant.accessToken}
              ginId={currentGin.id}
              ginOrder={currentGin.order}
              existingNote={currentNote}
            />
          )}

          {session.stage === SessionStage.REVEAL && currentGin && (
            <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                {messages.session.revealTitle} {currentGin.order}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-3xl text-white">
                {currentGin.name}
              </h2>
              <p className="mt-2 text-sm text-stone-300">
                {currentGin.distillery ? `${currentGin.distillery} · ` : ""}
                {currentGin.abv ? `${currentGin.abv}% ABV` : messages.common.noAbv}
              </p>
              {currentGin.description ? (
                <p className="mt-4 text-sm leading-6 text-stone-200">{currentGin.description}</p>
              ) : null}

              {currentNote ? (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                    {messages.session.yourCard}
                  </p>
                  <p className="mt-2 text-sm text-stone-200">
                    {messages.session.overallScore}:{" "}
                    <span className="font-semibold text-white">{currentNote.overallScore}/10</span>
                  </p>
                  {currentNote.customNotes ? (
                    <p className="mt-3 text-sm leading-6 text-stone-300">{currentNote.customNotes}</p>
                  ) : null}
                </div>
              ) : null}
            </section>
          )}

          {(session.stage === SessionStage.RESULTS || session.stage === SessionStage.COMPLETED) && (
            <ResultsPanel results={results} messages={messages} showParticipantPerspective />
          )}
        </>
      ) : null}
    </main>
  );
}
