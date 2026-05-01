import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { KeyRound } from "lucide-react";
import QRCode from "qrcode";

import { AdminSessionControls } from "@/components/admin/admin-session-controls";
import { DeleteSessionButton } from "@/components/admin/delete-session-button";
import { AdminUnlockCard } from "@/components/admin/admin-unlock-card";
import { ResultsPanel } from "@/components/results/results-panel";
import { SessionLiveSync } from "@/components/session-live-sync";
import { getParticipantJoinUrl } from "@/lib/app-url";
import { adminCookieName } from "@/lib/constants";
import { getAdvanceLabel, getStageLabel } from "@/lib/i18n";
import { getRequestI18n } from "@/lib/request-locale";
import { getSessionById } from "@/lib/session-data";
import { buildSessionResults } from "@/lib/session-logic";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminSessionPage({ params }: PageProps) {
  const { messages } = await getRequestI18n();
  const { sessionId } = await params;
  const session = await getSessionById(sessionId);

  if (!session) {
    notFound();
  }

  const cookieStore = await cookies();
  const storedPin = cookieStore.get(adminCookieName(session.id))?.value ?? "";
  const unlocked = storedPin === session.adminPin;
  const results = buildSessionResults(session);
  const participantJoinUrl = getParticipantJoinUrl(session.joinCode);
  const participantQrCodeDataUrl = await QRCode.toDataURL(participantJoinUrl, {
    width: 320,
    margin: 1,
    color: {
      dark: "#0f1c18",
      light: "#f7f2e7",
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 py-4">
      <SessionLiveSync sessionId={session.id} />

      <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
              {messages.admin.sessionControlsLabel} · join code {session.joinCode}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-serif)] text-4xl text-white">
              {session.name}
            </h1>
            <p className="mt-3 text-sm text-stone-300">
              {session.gins.length}{" "}
              {session.gins.length === 1
                ? messages.common.ginsSingular
                : messages.common.ginsPlural}{" "}
              · {session.participants.length}{" "}
              {session.participants.length === 1
                ? messages.common.guestsSingular
                : messages.common.guestsPlural}{" "}
              · {messages.admin.currentAction.toLowerCase()}{" "}
              {getAdvanceLabel(
                session.stage,
                session.currentGinIndex,
                session.gins.length,
                messages,
              ).toLowerCase()}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-100">
            {getStageLabel(session.stage, messages)}
          </span>
        </div>
      </section>

      {!unlocked ? (
        <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200">
            <KeyRound className="h-5 w-5" />
          </div>
          <h2 className="font-[family-name:var(--font-serif)] text-3xl text-white">
            {messages.admin.unlockTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            {messages.admin.unlockDescription}
          </p>
          <div className="mt-6 max-w-md">
            <AdminUnlockCard sessionId={session.id} />
          </div>
        </section>
      ) : (
        <>
          <AdminSessionControls
            sessionId={session.id}
            stage={session.stage}
            currentGinIndex={session.currentGinIndex}
            ginCount={session.gins.length}
            adminPin={storedPin}
            joinCode={session.joinCode}
            joinUrl={participantJoinUrl}
            qrCodeDataUrl={participantQrCodeDataUrl}
            participants={session.participants.map((participant) => ({
              id: participant.id,
              name: participant.name,
            }))}
            gins={session.gins.map((gin) => ({
              id: gin.id,
              order: gin.order,
              name: gin.name,
            }))}
          />

          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <h2 className="font-[family-name:var(--font-serif)] text-3xl text-white">
                {messages.admin.flightLineup}
              </h2>
              <div className="mt-5 grid gap-3">
                {session.gins.map((gin) => (
                  <div key={gin.id} className="field-shell rounded-3xl p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                      {messages.common.gin} {gin.order}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">{gin.name}</p>
                    <p className="mt-2 text-sm text-stone-300">
                      {gin.distillery ? `${gin.distillery} · ` : ""}
                      {gin.abv ? `${gin.abv}% ABV` : messages.common.noAbv}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
              <h2 className="font-[family-name:var(--font-serif)] text-3xl text-white">
                {messages.admin.participantRoom}
              </h2>
              <div className="mt-5 grid gap-3">
                {session.participants.length ? (
                  session.participants.map((participant) => (
                    <div key={participant.id} className="field-shell rounded-3xl p-4 text-sm text-stone-200">
                      {participant.name}
                    </div>
                  ))
                ) : (
                  <div className="field-shell rounded-3xl p-5 text-sm text-stone-300">
                    {messages.admin.noParticipants}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <h2 className="font-[family-name:var(--font-serif)] text-3xl text-white">
              {messages.admin.deleteSession}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
              {messages.admin.deleteSessionDescription}
            </p>
            <div className="mt-5 max-w-sm">
              <DeleteSessionButton
                sessionId={session.id}
                sessionName={session.name}
                storedAdminPin={storedPin}
                redirectTo="/admin"
                className="w-full rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </section>

          <ResultsPanel results={results} messages={messages} />
        </>
      )}
    </main>
  );
}
