import { LicenseInfo, LicenseActivationRecord } from "../types";

export const SUPER_ADMIN_CREDENTIALS = {
  username: "SuperAdmin",
  password: "Super@Admin",
};

export const SUPER_ADMIN_CONTACT = {
  phone: "+5491123456789",
  email: "superadmin@canchas.app",
  paymentAlias: "canchas.admin.mp",
  paymentCbu: "0000003100012345678901",
  bankName: "Mercado Pago / Banco Central",
  monthlyPriceText: "$ 15.000 / mes (30 Días)",
};

export const SUPER_ADMIN_USER = {
  id: "usr-superadmin",
  name: "Super Administrador",
  email: "superadmin@canchas.app",
  role: "SUPER_ADMIN" as const,
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
};

/**
 * Generates an ISO string or adds days to a date.
 */
export function addDaysToDate(baseDate: Date | string, days: number): string {
  const d = typeof baseDate === "string" ? new Date(baseDate) : new Date(baseDate);
  // If invalid date, fallback to now
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + days);
    return fallback.toISOString();
  }
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Calculates remaining whole days until expiration.
 * Returns negative number if expired.
 */
export function getRemainingDays(
  expiresAtOrLicense?: string | LicenseInfo | null,
): number {
  if (!expiresAtOrLicense) return 0;
  const expiryStr =
    typeof expiresAtOrLicense === "object"
      ? expiresAtOrLicense.expiresAt
      : expiresAtOrLicense;
  if (!expiryStr) return 0;
  const expiry = new Date(expiryStr).getTime();
  const now = new Date().getTime();
  if (isNaN(expiry)) return 0;

  const diffMs = expiry - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Checks if the license is currently active and not expired.
 */
export function isLicenseActive(license?: LicenseInfo | null): boolean {
  if (!license) return false;
  if (!license.isEnabled) return false;
  if (!license.expiresAt) return false;

  const expiry = new Date(license.expiresAt).getTime();
  const now = new Date().getTime();
  return !isNaN(expiry) && expiry > now;
}

/**
 * Initial 30-day active license for new or fresh installations.
 */
export function createDefaultLicense(): LicenseInfo {
  const now = new Date();
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  return {
    isEnabled: true,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    durationDays: 30,
    lastActivatedBy: "SuperAdmin",
    planName: "Plan Administrador 30 Días",
    history: [
      {
        id: "act-init-1",
        date: now.toISOString(),
        daysAdded: 30,
        previousExpiresAt: now.toISOString(),
        newExpiresAt: expires.toISOString(),
        activatedBy: "SuperAdmin",
        notes: "Activación inicial del sistema por 30 días",
      },
    ],
  };
}

/**
 * Activates or extends the license for a specified number of days (default: 30 days).
 */
export function activateLicenseDays(
  currentLicense: LicenseInfo | undefined,
  days: number = 30,
  activatedBy: string = "SuperAdmin",
  notes?: string
): LicenseInfo {
  const now = new Date();
  const currentExpiry = currentLicense?.expiresAt ? new Date(currentLicense.expiresAt) : now;
  
  // If current expiry is in the past or invalid, start 30 days from NOW.
  // If current expiry is in the future, add 30 days to the existing expiry date.
  const baseDate = isNaN(currentExpiry.getTime()) || currentExpiry.getTime() < now.getTime()
    ? now
    : currentExpiry;

  const newExpiry = new Date(baseDate);
  newExpiry.setDate(newExpiry.getDate() + days);

  const prevExpiryIso = currentLicense?.expiresAt || now.toISOString();
  const newExpiryIso = newExpiry.toISOString();

  const newRecord: LicenseActivationRecord = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: now.toISOString(),
    daysAdded: days,
    previousExpiresAt: prevExpiryIso,
    newExpiresAt: newExpiryIso,
    activatedBy: activatedBy || "SuperAdmin",
    notes: notes || `Habilitación extendida por +${days} días`,
  };

  const history = [newRecord, ...(currentLicense?.history || [])].slice(0, 50);

  return {
    isEnabled: true,
    activatedAt: now.toISOString(),
    expiresAt: newExpiryIso,
    durationDays: days,
    lastActivatedBy: activatedBy || "SuperAdmin",
    planName: `Plan Administrador (${days} Días)`,
    history,
  };
}

/**
 * Sets an exact expiration date or sets expired status for testing.
 */
export function setLicenseExpiration(
  currentLicense: LicenseInfo,
  expiresAtIso: string,
  isEnabled: boolean = true
): LicenseInfo {
  return {
    ...currentLicense,
    isEnabled,
    expiresAt: expiresAtIso,
  };
}

/**
 * Formats date to a friendly Spanish format.
 */
export function formatLicenseDateTime(isoString: string): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}
