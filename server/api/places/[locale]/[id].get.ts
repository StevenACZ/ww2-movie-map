export default defineEventHandler((event) => {
  const locale = getRouterParam(event, "locale");
  const id = getRouterParam(event, "id") ?? "";
  if (!isLocale(locale)) throw createError({ statusCode: 404 });
  const detail = placeDetail(id, locale);
  if (!detail)
    throw createError({ statusCode: 404, statusMessage: "Place not found" });
  return detail;
});
