"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/locale-provider";
import { normalizeJoinCode } from "@/lib/session-logic";

export function JoinCodeLookupForm() {
  const router = useRouter();
  const { messages } = useLocale();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const normalized = normalizeJoinCode(joinCode);
          if (!normalized) {
            setError(messages.join.invalidCode);
            return;
          }

          setError("");
          router.push(`/session/${normalized}`);
        }}
    >
      <input
        className="field-shell rounded-2xl px-4 py-4 text-lg uppercase tracking-[0.3em] text-white outline-none placeholder:text-stone-500"
        value={joinCode}
        onChange={(event) => {
          setJoinCode(event.target.value);
          if (error) {
            setError("");
          }
        }}
        placeholder={messages.join.codePlaceholder}
        maxLength={8}
        required
      />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button
        type="submit"
        className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-200"
      >
        {messages.join.openTasting}
      </button>
    </form>
  );
}
