"use client";

import { useState } from "react";

import { useLocale } from "@/components/locale-provider";

type JoinSessionCardProps = {
  sessionId: string;
  joinCode: string;
  sessionName: string;
};

export function JoinSessionCard({ sessionId, joinCode, sessionName }: JoinSessionCardProps) {
  const { messages } = useLocale();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(`/api/sessions/${sessionId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? messages.participant.joinError);
      setLoading(false);
      return;
    }

    window.location.replace(`/session/${joinCode}`);
  };

  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
        {messages.participant.joinSessionEyebrow.replace("{sessionName}", sessionName)}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-white">
        {messages.participant.joinSessionTitle}
      </h2>
      <p className="mt-3 text-sm leading-6 text-stone-300">
        {messages.participant.joinSessionDescription}
      </p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <input
          className="field-shell rounded-2xl px-4 py-4 text-base text-white outline-none placeholder:text-stone-500"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={messages.participant.yourNamePlaceholder}
          required
        />

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? messages.participant.joining : messages.participant.joinButton}
        </button>
      </form>
    </section>
  );
}
