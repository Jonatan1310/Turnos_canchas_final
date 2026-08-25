import { ComplexSettings } from "../types";

/**
 * Formats a given monetary amount according to complex currency settings.
 * @param amount - Number in base currency (primaryCurrency: ARS or USD)
 * @param settings - ComplexSettings configuration object
 * @param context - 'admin' for Admin Panel display or 'client' for Public Customer Portal
 */
export function formatCurrency(
  amount: number,
  settings?: Partial<ComplexSettings>,
  context: "admin" | "client" = "admin",
): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "$0";
  if (!settings) return `$${Math.round(amount).toLocaleString("es-AR")}`;

  const primary = settings.primaryCurrency || "ARS";
  const rate =
    settings.exchangeRateUsdToArs && settings.exchangeRateUsdToArs > 0
      ? settings.exchangeRateUsdToArs
      : 1200;
  const displayMode =
    context === "admin"
      ? settings.displayCurrencyAdmin || "ARS"
      : settings.displayCurrencyClient || "ARS";

  let amountArs = 0;
  let amountUsd = 0;

  if (primary === "ARS") {
    amountArs = amount;
    amountUsd = amount / rate;
  } else {
    amountUsd = amount;
    amountArs = amount * rate;
  }

  const strArs = `$ ${Math.round(amountArs).toLocaleString("es-AR")}`;
  const formattedUsdNumber =
    amountUsd % 1 === 0 ? amountUsd.toFixed(0) : amountUsd.toFixed(2);
  const strUsd = `US$ ${formattedUsdNumber}`;

  if (displayMode === "USD") {
    return strUsd;
  }
  if (displayMode === "BOTH") {
    if (primary === "ARS") {
      return `${strArs} (${strUsd})`;
    } else {
      return `${strUsd} (${strArs})`;
    }
  }

  // Default 'ARS'
  return strArs;
}

export function getCurrencySymbol(
  settings?: Partial<ComplexSettings>,
  context: "admin" | "client" = "admin",
): string {
  if (!settings) return "$";
  const displayMode =
    context === "admin"
      ? settings.displayCurrencyAdmin || "ARS"
      : settings.displayCurrencyClient || "ARS";

  if (displayMode === "USD") return "US$";
  if (displayMode === "BOTH") return "$ / US$";
  return "$";
}
