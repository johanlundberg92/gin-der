"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/locale-provider";
import { adminCookieName } from "@/lib/constants";

type AdminUnlockCardProps = {
  sessionId: string;
};

export function AdminUnlockCard({ sessionId }: AdminUnlockCardProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const [pin, setPin] = useState("");

  return (
    <div className="space-y-4">
      <input
        className="field-shell w-full rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
        placeholder={messages.admin.createForm.adminPin}
        value={pin}
        onChange={(event) => setPin(event.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          document.cookie = `${adminCookieName(sessionId)}=${encodeURIComponent(pin)}; Path=/; Max-Age=2592000; SameSite=Lax`;
          router.refresh();
        }}
        className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-200"
      >
        {messages.admin.unlockButton}
      </button>
    </div>
  );
}
