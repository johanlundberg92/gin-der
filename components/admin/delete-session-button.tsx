"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/locale-provider";
import { adminCookieName } from "@/lib/constants";

type DeleteSessionButtonProps = {
  sessionId: string;
  sessionName: string;
  redirectTo?: string;
  className?: string;
};

export function DeleteSessionButton({
  sessionId,
  sessionName,
  redirectTo,
  className,
}: DeleteSessionButtonProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const confirmed = window.confirm(
      messages.admin.deleteSessionConfirm.replace("{sessionName}", sessionName),
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? messages.admin.deleteSessionError);
      setLoading(false);
      return;
    }

    document.cookie = `${adminCookieName(sessionId)}=; Path=/; Max-Age=0; SameSite=Lax`;

    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    router.refresh();
  };

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={handleDelete}
        className={
          className ??
          "rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? messages.admin.deletingSession : messages.admin.deleteSession}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
