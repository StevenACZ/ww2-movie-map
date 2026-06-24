const historicalDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const parseHistoricalDateUtc = (dateString: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    return new Date(dateString);
  }

  return new Date(
    Date.UTC(Number(match[1]!), Number(match[2]!) - 1, Number(match[3]!)),
  );
};

export const formatHistoricalDate = (dateString: string): string => {
  return historicalDateFormatter.format(parseHistoricalDateUtc(dateString));
};

export const getUtcYearStartTime = (year: number): number => {
  return Date.UTC(year, 0, 1);
};
