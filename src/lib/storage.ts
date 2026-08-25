import {
  Booking,
  Court,
  CourtType,
  Customer,
  WaitlistEntry,
  ComplexSettings,
  SystemNotification,
  AuditLog,
  User,
  Role,
  BookingStatus,
  LicenseInfo,
  TenantComplex,
} from "../types";
import {
  INITIAL_BOOKINGS,
  INITIAL_COURTS,
  INITIAL_COURT_TYPES,
  INITIAL_CUSTOMERS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_WAITLIST,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  getTodayFormatted,
} from "../data/initialData";
import { createDefaultLicense } from "./license";
import { INITIAL_COMPLEXES } from "./tenants";
import { slugify } from "./slugify";

const STORAGE_KEYS = {
  USERS: "rm_users",
  ACTIVE_USER: "rm_active_user",
  COURT_TYPES: "rm_court_types",
  COURTS: "rm_courts",
  CUSTOMERS: "rm_customers",
  BOOKINGS: "rm_bookings",
  WAITLIST: "rm_waitlist",
  SETTINGS: "rm_settings",
  NOTIFICATIONS: "rm_notifications",
  AUDIT_LOGS: "rm_audit_logs",
  THEME: "rm_theme",
  LICENSE: "rm_license",
  SUPER_ADMIN_AUTH: "rm_super_admin_auth",
  COMPLEXES: "rm_complexes",
  ACTIVE_COMPLEX_ID: "rm_active_complex_id",
};

// Helper to calculate court reservation price based on date, time, duration, and surcharges
export function calculateBookingPrice(
  court: Court,
  dateStr: string, // YYYY-MM-DD
  startTimeStr: string, // HH:mm
  durationMinutes: number,
): number {
  if (!court) return 0;

  const dateObj = new Date(dateStr + "T12:00:00");
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
  const startHour = parseInt(startTimeStr.split(":")[0], 10);

  // Base price proportional to duration
  let basePrice = (court.pricePerHour / 60) * durationMinutes;

  // Weekend surcharge (Friday evening, Saturday, Sunday)
  const isWeekend =
    dayOfWeek === 0 || dayOfWeek === 6 || (dayOfWeek === 5 && startHour >= 18);
  if (isWeekend && court.weekendSurchargePercent > 0) {
    basePrice *= 1 + court.weekendSurchargePercent / 100;
  }

  // Night surcharge (Starts after 20:00)
  if (startHour >= 20 || startHour < 2) {
    basePrice += court.nightSurchargeAmount;
  }

  return Math.round(basePrice);
}

// Helper to calculate end time given start time HH:mm and duration in minutes
export function calculateEndTime(
  startTime: string,
  durationMinutes: number,
): string {
  const [hStr, mStr] = startTime.split(":");
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10) + durationMinutes;

  while (m >= 60) {
    m -= 60;
    h += 1;
  }

  const newH = String(h % 24).padStart(2, "0");
  const newM = String(m).padStart(2, "0");
  return `${newH}:${newM}`;
}

// Helper to check time overlaps
export function timeSlotsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && endA > startB;
}

const syncChannel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("rm_app_sync_channel")
    : null;

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (typeof window !== "undefined" && syncChannel) {
      try {
        syncChannel.postMessage({ key, value, timestamp: Date.now() });
      } catch (err) {
        console.warn("BroadcastChannel postMessage failed:", err);
      }
    }
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Initializer to populate default localStorage if empty
export function initLocalStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.COURTS)) {
    saveStoredData(STORAGE_KEYS.COURTS, INITIAL_COURTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COURT_TYPES)) {
    saveStoredData(STORAGE_KEYS.COURT_TYPES, INITIAL_COURT_TYPES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    saveStoredData(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    saveStoredData(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WAITLIST)) {
    saveStoredData(STORAGE_KEYS.WAITLIST, INITIAL_WAITLIST);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveStoredData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveStoredData(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)) {
    saveStoredData(STORAGE_KEYS.ACTIVE_USER, INITIAL_USERS[0]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    saveStoredData(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
    saveStoredData(STORAGE_KEYS.THEME, "light");
  }
  if (!localStorage.getItem(STORAGE_KEYS.LICENSE)) {
    saveStoredData(STORAGE_KEYS.LICENSE, createDefaultLicense());
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPLEXES)) {
    saveStoredData(STORAGE_KEYS.COMPLEXES, INITIAL_COMPLEXES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPLEX_ID)) {
    saveStoredData(STORAGE_KEYS.ACTIVE_COMPLEX_ID, INITIAL_COMPLEXES[0].id);
  }
}

export { STORAGE_KEYS };

// Helper to determine the active complex ID for the current browser tab/window
export function resolveActiveComplexId(complexList: TenantComplex[]): string {
  if (!complexList || complexList.length === 0) return "complex-central";

  if (typeof window !== "undefined") {
    // 1. Highest priority: URL query parameters (e.g. ?c=slug or ?complex=slug or ?slug=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlParam =
        params.get("c") || params.get("complex") || params.get("slug");
      if (urlParam) {
        const cleanParam = decodeURIComponent(urlParam).trim().toLowerCase();
        const paramSlug = slugify(cleanParam);

        const match = complexList.find((c) => {
          const cId = (c.id || "").toLowerCase();
          const cSlug = (c.slug || "").toLowerCase();
          const cNameSlug = slugify(c.name || "");
          const cSettingsNameSlug = slugify(c.settings?.complexName || "");
          const cCustom = (c.settings?.customPortalUrl || "").toLowerCase().trim();
          const cCustomSlug = slugify(cCustom);
          const cCleanName = (c.name || "").toLowerCase().trim();
          const cSettingsName = (c.settings?.complexName || "").toLowerCase().trim();

          return (
            cId === cleanParam ||
            cSlug === cleanParam ||
            cSlug === paramSlug ||
            cNameSlug === cleanParam ||
            cNameSlug === paramSlug ||
            cSettingsNameSlug === cleanParam ||
            cSettingsNameSlug === paramSlug ||
            cCustom === cleanParam ||
            cCustomSlug === paramSlug ||
            cCleanName === cleanParam ||
            cSettingsName === cleanParam
          );
        });

        if (match) {
          return match.id;
        }
      }
    } catch {}

    // 2. Tab-specific session storage
    try {
      const sessionVal = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_COMPLEX_ID);
      if (sessionVal) {
        const match = complexList.find(
          (c) =>
            c.id === sessionVal ||
            c.slug === sessionVal ||
            slugify(c.name) === slugify(sessionVal) ||
            slugify(c.settings?.complexName || "") === slugify(sessionVal),
        );
        if (match) return match.id;
      }
    } catch {}
  }

  // 3. Local storage fallback
  try {
    const localVal = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPLEX_ID);
    if (localVal) {
      const match = complexList.find(
        (c) =>
          c.id === localVal ||
          c.slug === localVal ||
          slugify(c.name) === slugify(localVal) ||
          slugify(c.settings?.complexName || "") === slugify(localVal),
      );
      if (match) return match.id;
    }
  } catch {}

  return complexList[0]?.id || "complex-central";
}
