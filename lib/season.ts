// Mill Stream runs summer camp sessions and operates as a retreat centre the
// rest of the year, so the app has to be useful in both modes.

export type Season = "summer" | "fall" | "winter" | "spring";

export interface SeasonInfo {
  season: Season;
  /** True during the summer camp sessions. */
  isCampSeason: boolean;
  label: string;
  /** Short description of what the office is mostly handling right now. */
  focus: string;
}

// Northern-hemisphere camp calendar: sessions run late June through August.
export function getSeason(date = new Date()): SeasonInfo {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  const inCampSeason =
    (month === 5 && day >= 20) || month === 6 || (month === 7 && day <= 31);

  if (inCampSeason) {
    return {
      season: "summer",
      isCampSeason: true,
      label: "Camp season",
      focus: "campers on site",
    };
  }

  if (month === 8 || month === 9 || month === 10 || (month === 7 && day > 31)) {
    return {
      season: "fall",
      isCampSeason: false,
      label: "Off-season - fall",
      focus: "retreat groups and next summer's registrations",
    };
  }

  if (month === 11 || month === 0 || month === 1) {
    return {
      season: "winter",
      isCampSeason: false,
      label: "Off-season - winter",
      focus: "retreat bookings, registration and hiring",
    };
  }

  return {
    season: "spring",
    isCampSeason: false,
    label: "Off-season - spring",
    focus: "registrations, staff hiring and getting the site ready",
  };
}
