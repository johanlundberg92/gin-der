import Link from "next/link";
import { Martini, Sparkles, Users, Waves } from "lucide-react";

import { getRequestI18n } from "@/lib/request-locale";
import { getStageLabel } from "@/lib/i18n";
import { listSessions } from "@/lib/session-data";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const { messages } = await getRequestI18n();
  const sessions = await listSessions();

  return (
    <main className="flex flex-1 flex-col gap-8">
      <section className="glass-panel overflow-hidden rounded-[2rem] border px-5 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-amber-200/80">
              <Martini className="h-3.5 w-3.5" />
              {messages.home.badge}
            </p>
            <div className="space-y-3">
              <h1 className="max-w-2xl font-[family-name:var(--font-serif)] text-4xl leading-tight text-white sm:text-5xl">
                {messages.home.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
                {messages.home.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-200"
              >
                {messages.home.joinCta}
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {messages.home.adminCta}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: Users,
                title: messages.home.cards[0].title,
                description: messages.home.cards[0].description,
              },
              {
                icon: Waves,
                title: messages.home.cards[1].title,
                description: messages.home.cards[1].description,
              },
              {
                icon: Sparkles,
                title: messages.home.cards[2].title,
                description: messages.home.cards[2].description,
              },
            ].map((item) => (
              <div key={item.title} className="glass-panel rounded-3xl p-4">
                <item.icon className="mb-3 h-5 w-5 text-amber-200" />
                <h2 className="font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl text-white">
            {messages.home.flowTitle}
          </h2>
          <div className="mt-5 grid gap-3">
            {messages.home.flowSteps.map((step, index) => (
              <div key={step} className="field-shell rounded-3xl p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                  {messages.common.step} {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-200">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-serif)] text-2xl text-white">
                {messages.home.recentSessionsTitle}
              </h2>
              <p className="mt-1 text-sm text-stone-300">
                {messages.home.recentSessionsDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {sessions.length ? (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="field-shell rounded-3xl p-4 sm:flex sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                      Join code {session.joinCode}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{session.name}</h3>
                    <p className="mt-1 text-sm text-stone-300">
                      {session.eventDate
                        ? dateFormatter.format(session.eventDate)
                        : messages.common.noDate}{" "}
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
                  <div className="mt-4 flex items-center gap-3 sm:mt-0">
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-200">
                      {getStageLabel(session.stage, messages)}
                    </span>
                    <Link
                      href={`/session/${session.joinCode}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-stone-100"
                    >
                      {messages.home.open}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="field-shell rounded-3xl p-5 text-sm leading-6 text-stone-300">
                {messages.home.noSessions}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
