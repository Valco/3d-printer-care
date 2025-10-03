import { uk } from "date-fns/locale/uk";
import { enUS } from "date-fns/locale/en-US";
import { Locale } from "date-fns";

export function getDateLocale(language: string): Locale {
  return language === "en" ? enUS : uk;
}
