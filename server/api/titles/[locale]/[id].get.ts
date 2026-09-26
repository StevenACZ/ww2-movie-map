export default defineEventHandler((event) => {
  const locale = getRouterParam(event, "locale");
  const id = getRouterParam(event, "id") ?? "";
  if (!isLocale(locale)) throw createError({ statusCode: 404 });
  const detail = titleDetail(id, locale);
  if (!detail)
    throw createError({ statusCode: 404, statusMessage: "Title not found" });
  return detail;
});
