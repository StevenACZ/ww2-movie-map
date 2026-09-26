import type { IndexPayload } from "~~/types/view";

export default defineEventHandler((event): IndexPayload => {
  const locale = getRouterParam(event, "locale");
  if (!isLocale(locale)) throw createError({ statusCode: 404 });
  return { locale, titles: allTitleCards(locale), events: allEvents(locale) };
});
