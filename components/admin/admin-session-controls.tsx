"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SessionStage } from "@prisma/client";
import { ArrowRight, Copy, Radio, Users } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
import { getAdvanceLabel, getStageLabel } from "@/lib/i18n";

type AdminSessionControlsProps = {
  sessionId: string;
  joinCode: string;
  joinUrl: string;
  qrCodeDataUrl: string;
  stage: SessionStage;
  currentGinIndex: number;
  ginCount: number;
  adminPin: string;
  participants: Array<{ id: string; name: string }>;
  gins: Array<{ id: string; order: number; name: string }>;
};

export function AdminSessionControls({
  sessionId,
  joinCode,
  joinUrl,
  qrCodeDataUrl,
  stage,
  currentGinIndex,
  ginCount,
  adminPin,
  participants,
  gins,
}: AdminSessionControlsProps) {
  const router = useRouter();
  const { messages } = useLocale();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [copiedTarget, setCopiedTarget] = useState<"code" | "link" | null>(null);
  const [copyFeedback, setCopyFeedback] = useState("");
  const copyResetTimeoutRef = useRef<number | null>(null);
  const actionLabel = useMemo(
    () => getAdvanceLabel(stage, currentGinIndex, ginCount, messages),
    [currentGinIndex, ginCount, messages, stage],
  );

  const activeGin = gins[currentGinIndex];

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current !== null) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const scheduleCopyReset = () => {
    if (copyResetTimeoutRef.current !== null) {
      window.clearTimeout(copyResetTimeoutRef.current);
    }

    copyResetTimeoutRef.current = window.setTimeout(() => {
      setCopiedTarget(null);
      setCopyFeedback("");
      copyResetTimeoutRef.current = null;
    }, 2000);
  };

  const copyText = async (value: string) => {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(input);
    return copied;
  };

  const handleCopy = async (value: string, target: "code" | "link") => {
    try {
      const copied = await copyText(value);

      if (!copied) {
        setCopiedTarget(null);
        setCopyFeedback(messages.common.copyFailed);
        return;
      }

      setCopiedTarget(target);
      setCopyFeedback("");
      scheduleCopyReset();
    } catch {
      setCopiedTarget(null);
      setCopyFeedback(messages.common.copyFailed);
    }
  };

  const handleAdvance = async () => {
    setLoading(true);
    setFeedback("");

    const response = await fetch(`/api/sessions/${sessionId}/advance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ adminPin }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setFeedback(payload.error ?? messages.admin.updating);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
              {messages.admin.currentAction}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-white">
              {actionLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(joinCode, "code")}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
            {copiedTarget === "code" ? messages.common.copied : messages.common.copyJoinCode}
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="field-shell rounded-3xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
              {messages.admin.liveStage}
            </p>
            <p className="mt-2 text-xl font-semibold text-white">{getStageLabel(stage, messages)}</p>
          </div>
          <div className="field-shell rounded-3xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
              {messages.admin.currentGin}
            </p>
            <p className="mt-2 text-xl font-semibold text-white">
              {activeGin ? `#${activeGin.order}` : messages.common.none}
            </p>
          </div>
          <div className="field-shell rounded-3xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
              {messages.admin.guests}
            </p>
            <p className="mt-2 text-xl font-semibold text-white">{participants.length}</p>
          </div>
        </div>

        <button
          type="button"
          disabled={loading || stage === SessionStage.COMPLETED}
          onClick={handleAdvance}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight className="h-4 w-4" />
          {loading ? messages.admin.updating : actionLabel}
        </button>

        {feedback ? <p className="mt-3 text-sm text-rose-300">{feedback}</p> : null}
      </div>

      <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-amber-200">
          <Radio className="h-4 w-4" />
          <p className="text-sm font-medium">{messages.admin.liveRoomLinks}</p>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="field-shell rounded-3xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
              {messages.admin.scanToJoin}
            </p>
            <div className="mt-3 flex justify-center rounded-3xl bg-stone-50 p-4">
              <Image
                src={qrCodeDataUrl}
                alt={`QR code for ${joinUrl}`}
                className="h-52 w-52 rounded-2xl"
                width={208}
                height={208}
                unoptimized
              />
            </div>
            <p className="mt-3 break-all text-sm leading-6 text-stone-300">{joinUrl}</p>
            <button
              type="button"
              onClick={() => handleCopy(joinUrl, "link")}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
              {copiedTarget === "link" ? messages.common.copied : messages.common.copyJoinLink}
            </button>
          </div>
          <Link
            href={`/session/${joinCode}`}
            className="field-shell rounded-3xl p-4 hover:bg-white/8"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
              {messages.admin.participantScreen}
            </p>
            <p className="mt-1 text-sm text-white">/session/{joinCode}</p>
          </Link>
          <div className="field-shell rounded-3xl p-4">
            <div className="flex items-center gap-2 text-stone-200">
              <Users className="h-4 w-4 text-amber-200" />
              <p className="text-sm font-medium">{messages.admin.joinedParticipants}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              {participants.length
                ? participants.map((participant) => participant.name).join(", ")
                : messages.admin.noParticipants}
            </p>
          </div>
        </div>
        {copyFeedback ? <p className="mt-3 text-sm text-rose-300">{copyFeedback}</p> : null}
      </div>
    </section>
  );
}
