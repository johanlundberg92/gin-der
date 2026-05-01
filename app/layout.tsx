import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Inter, Playfair_Display } from "next/font/google";

import { LanguageSwitcher } from "@/components/language-switcher";
import { LocaleProvider } from "@/components/locale-provider";
import {
  defaultLocale,
  getMessages,
  localeCookieName,
  normalizeLocale,
} from "@/lib/i18n";

import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "gin-der",
  description: "En mobilförst lokal nätverksapp för ginsmakningar.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(localeCookieName)?.value ?? defaultLocale);
  const messages = getMessages(locale);

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(219,188,123,0.16),_transparent_35%),linear-gradient(180deg,_#0e1917_0%,_#101e1b_50%,_#09110f_100%)] text-stone-100">
        <LocaleProvider locale={locale} messages={messages}>
          <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <Link
                href="/"
                className="font-[family-name:var(--font-serif)] text-lg text-stone-100 hover:text-amber-200 transition-colors"
              >
                {messages.common.appName}
              </Link>
              <LanguageSwitcher />
            </div>
            {children}
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
