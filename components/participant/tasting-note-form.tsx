"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

import { useLocale } from "@/components/locale-provider";

type ExistingNote = {
  overallScore: number;
  juniper: number;
  citrus: number;
  floral: number;
  spice: number;
  herbal: number;
  sweetness: number;
  customNotes: string | null;
} | null;

type TastingNoteFormProps = {
  sessionId: string;
  participantToken: string;
  ginId: string;
  ginOrder: number;
  existingNote: ExistingNote;
};

export function TastingNoteForm({
  sessionId,
  participantToken,
  ginId,
  ginOrder,
  existingNote,
}: TastingNoteFormProps) {
  const { messages } = useLocale();
  const [values, setValues] = useState({
    overallScore: existingNote?.overallScore ?? 7,
    juniper: existingNote?.juniper ?? 3,
    citrus: existingNote?.citrus ?? 3,
    floral: existingNote?.floral ?? 3,
    spice: existingNote?.spice ?? 3,
    herbal: existingNote?.herbal ?? 3,
    sweetness: existingNote?.sweetness ?? 2,
    customNotes: existingNote?.customNotes ?? "",
  });
  const [status, setStatus] = useState(existingNote ? messages.participant.saveLoaded : "");
  const [submitting, setSubmitting] = useState(false);

  const flavorCopy = useMemo(
    () => [
      {
        key: "juniper",
        label: messages.flavors.juniper.label,
        hint: messages.flavors.juniper.hint,
      },
      {
        key: "citrus",
        label: messages.flavors.citrus.label,
        hint: messages.flavors.citrus.hint,
      },
      {
        key: "floral",
        label: messages.flavors.floral.label,
        hint: messages.flavors.floral.hint,
      },
      {
        key: "spice",
        label: messages.flavors.spice.label,
        hint: messages.flavors.spice.hint,
      },
      {
        key: "herbal",
        label: messages.flavors.herbal.label,
        hint: messages.flavors.herbal.hint,
      },
      {
        key: "sweetness",
        label: messages.flavors.sweetness.label,
        hint: messages.flavors.sweetness.hint,
      },
    ] as const,
    [messages],
  );

  const fieldSummary = useMemo(
    () =>
      flavorCopy.map((field) => ({
        ...field,
        value: values[field.key],
      })),
    [flavorCopy, values],
  );

  const updateValue = (key: keyof typeof values, value: string | number) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");

    const response = await fetch(`/api/sessions/${sessionId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participantToken,
        ginId,
        ...values,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error ?? messages.participant.saveError);
      setSubmitting(false);
      return;
    }

    setStatus(messages.participant.saveSuccess);
    setSubmitting(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[2rem] p-5 sm:p-6"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
        {messages.participant.tastingCard}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-white">
        {messages.common.gin} #{ginOrder}
      </h2>
      <p className="mt-3 text-sm leading-6 text-stone-300">
        {messages.participant.anonymousPourDescription}
      </p>

      <form className="mt-6 grid gap-5" onSubmit={submit}>
        <div className="field-shell rounded-3xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">{messages.session.overallScore}</p>
              <p className="mt-1 text-xs text-stone-400">
                {messages.participant.overallScoreDescription}
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-amber-200">
              {values.overallScore}/10
            </span>
          </div>
          <input
            className="mt-4 w-full"
            type="range"
            min={1}
            max={10}
            value={values.overallScore}
            onChange={(event) => updateValue("overallScore", Number(event.target.value))}
          />
        </div>

        <div className="grid gap-3">
          {fieldSummary.map((field) => (
            <div key={field.key} className="field-shell rounded-3xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{field.label}</p>
                  <p className="mt-1 flex items-start gap-2 text-xs leading-5 text-stone-400">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200" />
                    {field.hint}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-amber-200">
                  {field.value}/5
                </span>
              </div>
              <input
                className="mt-4 w-full"
                type="range"
                min={1}
                max={5}
                value={field.value}
                onChange={(event) =>
                  updateValue(field.key as keyof typeof values, Number(event.target.value))
                }
              />
            </div>
          ))}
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-100">{messages.participant.freeNotes}</span>
          <textarea
            className="field-shell rounded-3xl px-4 py-4 text-sm text-white outline-none placeholder:text-stone-500"
            rows={4}
            value={values.customNotes}
            onChange={(event) => updateValue("customNotes", event.target.value)}
            placeholder={messages.participant.notesPlaceholder}
          />
        </label>

        {status ? <p className="text-sm text-stone-300">{status}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? messages.participant.savingButton : messages.participant.saveButton}
        </button>
      </form>
    </motion.section>
  );
}
