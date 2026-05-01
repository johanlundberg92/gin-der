import type { SessionResults } from "@/lib/session-logic";
import type { Messages } from "@/lib/i18n";

import { FlavorProfileChart } from "@/components/results/flavor-profile-chart";

type ResultsPanelProps = {
  results: SessionResults;
  messages: Messages;
  showParticipantPerspective?: boolean;
};

export function ResultsPanel({
  results,
  messages,
  showParticipantPerspective = false,
}: ResultsPanelProps) {
  const flavorLabels = {
    juniper: messages.flavors.juniper.label,
    citrus: messages.flavors.citrus.label,
    floral: messages.flavors.floral.label,
    spice: messages.flavors.spice.label,
    herbal: messages.flavors.herbal.label,
    sweetness: messages.flavors.sweetness.label,
  } as const;

  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
            {messages.results.reveal}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-white">
            {messages.results.title}
          </h2>
          <p className="mt-2 text-sm text-stone-300">
            {results.notesSubmitted}{" "}
            {results.notesSubmitted === 1
              ? messages.common.notesSingular
              : messages.common.notesPlural}{" "}
            {messages.results.capturedAcross} {results.totalParticipants}{" "}
            {results.totalParticipants === 1
              ? messages.common.guestsSingular
              : messages.common.guestsPlural}
          </p>
        </div>
        {results.topRatedGin ? (
          <div className="rounded-3xl border border-amber-200/20 bg-amber-300/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
              {messages.results.topRated}
            </p>
            <p className="mt-1 text-lg font-semibold text-white">{results.topRatedGin.name}</p>
            <p className="text-sm text-amber-100">
              {results.topRatedGin.averageOverall}/10 {messages.common.average.toLowerCase()}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {results.gins.map((gin) => (
          <div key={gin.id} className="rounded-[1.75rem] border border-white/10 bg-white/4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                  {messages.common.gin} {gin.order}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">{gin.name}</h3>
                <p className="mt-2 text-sm text-stone-300">
                  {gin.distillery ? `${gin.distillery} · ` : ""}
                  {gin.abv ? `${gin.abv}% ABV` : messages.common.noAbv} · {gin.noteCount}{" "}
                  {gin.noteCount === 1
                    ? messages.common.notesSingular
                    : messages.common.notesPlural}
                </p>
              </div>
              <div className="rounded-2xl bg-white/8 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
                  {messages.common.average}
                </p>
                <p className="mt-1 text-lg font-semibold text-white">{gin.averageOverall}/10</p>
              </div>
            </div>

            {gin.description ? (
              <p className="mt-4 text-sm leading-6 text-stone-300">{gin.description}</p>
            ) : null}

            <div className="mt-5">
              <FlavorProfileChart
                title={
                  showParticipantPerspective && gin.participantNote
                    ? messages.results.youVsRoom
                    : messages.results.roomConsensus
                }
                groupAverages={gin.flavorAverages}
                labels={flavorLabels}
                participantNote={showParticipantPerspective ? gin.participantNote : null}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
