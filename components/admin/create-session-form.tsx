"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

import { useLocale } from "@/components/locale-provider";

type GinDraft = {
  id: string;
  name: string;
  distillery: string;
  abv: string;
  description: string;
};

let ginDraftCounter = 0;

const nextGinDraftId = () => {
  ginDraftCounter += 1;
  return `gin-draft-${ginDraftCounter}`;
};

const emptyGin = (): GinDraft => ({
  id: nextGinDraftId(),
  name: "",
  distillery: "",
  abv: "",
  description: "",
});

export function CreateSessionForm() {
  const router = useRouter();
  const { messages } = useLocale();
  const eventDateInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>(messages.admin.createForm.defaultSessionName);
  const [eventDate, setEventDate] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [gins, setGins] = useState<GinDraft[]>(() => [
    { ...emptyGin(), name: "Nordic Dry", abv: "42" },
    { ...emptyGin(), name: "Garden Reserve", abv: "45" },
    { ...emptyGin(), name: "Coastal Bloom", abv: "47" },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateGin = (ginId: string, key: Exclude<keyof GinDraft, "id">, value: string) => {
    setGins((current) =>
      current.map((gin) => (gin.id === ginId ? { ...gin, [key]: value } : gin)),
    );
  };

  const removeGin = (ginId: string) => {
    setGins((current) => current.filter((gin) => gin.id !== ginId));
  };

  const addGin = () => setGins((current) => [...current, emptyGin()]);

  const openDatePicker = () => {
    const input = eventDateInputRef.current;

    if (!input) {
      return;
    }

    if ("showPicker" in input && typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        eventDate,
        adminPin,
        gins: gins.map((gin) => ({
          name: gin.name,
          distillery: gin.distillery,
          abv: gin.abv.trim().length ? Number(gin.abv) : null,
          description: gin.description,
        })),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? messages.admin.createForm.createError);
      setLoading(false);
      return;
    }

    router.push(`/admin/session/${payload.session.id}`);
    router.refresh();
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-stone-100">
          {messages.admin.createForm.sessionName}
        </span>
        <input
          className="field-shell rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={messages.admin.createForm.sessionNamePlaceholder}
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-100">
            {messages.admin.createForm.tastingDate}
          </span>
          <div className="relative">
            <input
              ref={eventDateInputRef}
              className="field-shell w-full rounded-2xl px-4 py-3 pr-14 text-sm text-white outline-none"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              type="datetime-local"
            />
            <button
              type="button"
              onClick={openDatePicker}
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/6 text-stone-100 hover:bg-white/10"
              aria-label={messages.admin.createForm.openDatePicker}
            >
              <CalendarDays className="h-4 w-4" />
            </button>
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-100">
            {messages.admin.createForm.adminPin}
          </span>
          <input
            className="field-shell rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
            value={adminPin}
            onChange={(event) => setAdminPin(event.target.value)}
            placeholder={messages.admin.createForm.adminPinPlaceholder}
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-white">{messages.admin.createForm.lineupTitle}</h2>
          <button
            type="button"
            onClick={addGin}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            {messages.admin.createForm.addGin}
          </button>
        </div>

        {gins.map((gin, index) => (
          <div key={gin.id} className="field-shell rounded-3xl p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">
                {messages.common.gin} {index + 1}
              </p>
              {gins.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeGin(gin.id)}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-stone-300 hover:bg-white/8 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  {messages.admin.createForm.remove}
                </button>
              ) : null}
            </div>

            <div className="grid gap-3">
              <input
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                value={gin.name}
                onChange={(event) => updateGin(gin.id, "name", event.target.value)}
                placeholder={messages.admin.createForm.namePlaceholder}
                required
              />
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <input
                  className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                  value={gin.distillery}
                  onChange={(event) => updateGin(gin.id, "distillery", event.target.value)}
                  placeholder={messages.admin.createForm.distilleryPlaceholder}
                />
                <input
                  className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                  value={gin.abv}
                  onChange={(event) => updateGin(gin.id, "abv", event.target.value)}
                  placeholder={messages.admin.createForm.abvPlaceholder}
                  inputMode="decimal"
                />
              </div>
              <textarea
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                value={gin.description}
                onChange={(event) => updateGin(gin.id, "description", event.target.value)}
                placeholder={messages.admin.createForm.descriptionPlaceholder}
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? messages.admin.createForm.creatingButton : messages.admin.createForm.createButton}
      </button>
    </form>
  );
}
