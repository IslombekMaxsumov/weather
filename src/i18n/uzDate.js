// Uzbek date formatting done by hand. Some browsers claim to support "uz" in
// Intl but have no month names for it and print "M11 18, Wed" instead.
// Uzbek writes the day with a hyphen: "18-noyabr", "Chorshanba, 18-noyabr".

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const MONTHS_SHORT = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const WEEKDAYS = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const WEEKDAYS_SHORT = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"]; // standard Uzbek abbreviations

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Supports the option combinations this app uses:
// { weekday: "narrow" | "short" | "long" } alone, or { day, month: "short" | "long", year?, weekday? }
export function formatUzDate(date, options = {}) {
  const day = date.getDay();
  if (options.weekday && !options.month) {
    if (options.weekday === "narrow") return WEEKDAYS_SHORT[day].charAt(0);
    if (options.weekday === "short") return WEEKDAYS_SHORT[day];
    return capitalize(WEEKDAYS[day]);
  }

  const months = options.month === "long" ? MONTHS : MONTHS_SHORT;
  let text = `${date.getDate()}-${months[date.getMonth()]}`;
  if (options.year) text = `${date.getFullYear()}-yil ${text}`;
  if (options.weekday) text = `${capitalize(WEEKDAYS[day])}, ${text}`;
  return text;
}
