import { Martini } from "lucide-react";

import { JoinCodeLookupForm } from "@/components/participant/join-code-lookup-form";
import { getRequestI18n } from "@/lib/request-locale";

export default async function JoinPage() {
  const { messages } = await getRequestI18n();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-6">
      <section className="glass-panel rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-amber-200/80">
          <Martini className="h-3.5 w-3.5" />
          {messages.join.badge}
        </p>
        <h1 className="mt-5 font-[family-name:var(--font-serif)] text-4xl text-white">
          {messages.join.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-300">
          {messages.join.description}
        </p>

        <div className="mt-6">
          <JoinCodeLookupForm />
        </div>
      </section>
    </main>
  );
}
