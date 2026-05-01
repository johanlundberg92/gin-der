import Link from "next/link";

import { CreateSessionForm } from "@/components/admin/create-session-form";
import { DeleteSessionButton } from "@/components/admin/delete-session-button";
import { getStageLabel } from "@/lib/i18n";
import { getRequestI18n } from "@/lib/request-locale";
import { listSessions } from "@/lib/session-data";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { messages } = await getRequestI18n();
  const sessions = await listSessions();

  return (
    <main className="grid flex-1 gap-5 py-4 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
          {messages.admin.dashboardLabel}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-serif)] text-4xl text-white">
          {messages.admin.createTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-300">
          {messages.admin.createDescription}
        </p>

        <div className="mt-6">
          <CreateSessionForm />
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <h2 className="font-[family-name:var(--font-serif)] text-3xl text-white">
          {messages.admin.sessionsTitle}
        </h2>
        <p className="mt-2 text-sm text-stone-300">
          {messages.admin.sessionsDescription}
        </p>

        <div className="mt-5 grid gap-3">
          {sessions.length ? (
            sessions.map((session) => (
              <div key={session.id} className="field-shell rounded-3xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                      Join code {session.joinCode}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{session.name}</h3>
                    <p className="mt-2 text-sm text-stone-300">
                      {session.eventDate
                        ? dateFormatter.format(session.eventDate)
                        : messages.common.noDateSet}{" "}
                      · {session.gins.length}{" "}
                      {session.gins.length === 1
                        ? messages.common.ginsSingular
                        : messages.common.ginsPlural}{" "}
                      · {session.participants.length}{" "}
                      {session.participants.length === 1
                        ? messages.common.guestsSingular
                        : messages.common.guestsPlural}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-100">
                    {getStageLabel(session.stage, messages)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/session/${session.id}`}
                    className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-200"
                  >
                    {messages.admin.openControls}
                  </Link>
                  <Link
                    href={`/session/${session.joinCode}`}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    {messages.admin.participantView}
                  </Link>
                  <DeleteSessionButton
                    sessionId={session.id}
                    sessionName={session.name}
                    className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="field-shell rounded-3xl p-5 text-sm leading-6 text-stone-300">
              {messages.admin.noSessions}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
