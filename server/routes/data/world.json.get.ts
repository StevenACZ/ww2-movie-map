export default defineEventHandler((event) => {
  setHeader(event, "content-type", "application/json; charset=utf-8");
  return worldData();
});
