import { cookies } from "next/headers";

import { defaultLocale, getMessages, localeCookieName, normalizeLocale } from "@/lib/i18n";

export async function getRequestLocale() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(localeCookieName)?.value ?? defaultLocale);
}

export async function getRequestI18n() {
  const locale = await getRequestLocale();
  return {
    locale,
    messages: getMessages(locale),
  };
}
