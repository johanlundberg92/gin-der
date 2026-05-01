"use client";

import { useRouter } from "next/navigation";

import { localeCookieName, locales } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, messages } = useLocale();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      {locales.map((candidate) => {
        const active = candidate === locale;
        const label = candidate === "sv" ? messages.common.swedish : messages.common.english;

        return (
          <button
            key={candidate}
            type="button"
            onClick={() => {
              document.cookie = `${localeCookieName}=${candidate}; Path=/; Max-Age=31536000; SameSite=Lax`;
              router.refresh();
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${
              active ? "bg-amber-300 text-stone-950" : "text-stone-200 hover:bg-white/8"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
