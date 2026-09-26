export default defineEventHandler((event) => {
  const locale = getRouterParam(event, "locale");
  const file = getRouterParam(event, "file") ?? "";
  if (!isLocale(locale) || !file.endsWith(".json"))
    throw createError({ statusCode: 404 });
  const detail = titleDetail(file.slice(0, -5), locale);
  if (!detail)
    throw createError({ statusCode: 404, statusMessage: "Title not found" });
  setHeader(event, "content-type", "application/json; charset=utf-8");
  return detail;
});
