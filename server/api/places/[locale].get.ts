export default defineEventHandler((event) => {
  const locale = getRouterParam(event, "locale");
  if (!isLocale(locale)) throw createError({ statusCode: 404 });
  return allPlaces(locale);
});
