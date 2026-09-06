import React, { createContext, useContext, useState, useEffect } from "react";
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
  PaymentStatus,
  PaymentMethod,
  BookingStatus,
  CourtScheduleBlock,
  LicenseInfo,
  TenantComplex,
  SportPreset,
} from "../types";
import {
  STORAGE_KEYS,
  initLocalStorage,
  loadStoredData,
  saveStoredData,
  resolveActiveComplexId,
  calculateBookingPrice,
  calculateEndTime,
  timeSlotsOverlap,
} from "../lib/storage";
import {
  SUPER_ADMIN_CREDENTIALS,
  SUPER_ADMIN_USER,
  isLicenseActive as checkIsLicenseActive,
  getRemainingDays,
  createDefaultLicense,
  activateLicenseDays,
  setLicenseExpiration,
} from "../lib/license";
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
import { INITIAL_COMPLEXES, createNewTenantComplex } from "../lib/tenants";
import { slugify, buildComplexPortalUrl } from "../lib/slugify";
import {
  applyThemeToDocument,
  getThemePreset,
  ThemePresetId,
  ThemeMode,
} from "../lib/themePresets";

import { formatCurrency } from "../lib/currency";

interface AppContextType {
  activeUser: User;
  users: User[];
  setActiveUser: (user: User) => void;
  setUserRole: (role: Role) => void;

  theme: "light" | "dark";
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setThemePreset: (presetId: ThemePresetId) => void;

  courts: Court[];
  courtTypes: CourtType[];
  addCourt: (court: Omit<Court, "id">) => void;
  updateCourt: (id: string, court: Partial<Court>) => void;
  deleteCourt: (id: string) => void;
  toggleCourtActive: (id: string) => void;
  addCourtType: (name: string, description?: string) => void;
  updateCourtType: (id: string, name: string, description?: string) => void;
  deleteCourtType: (
    id: string,
    cascadeCourts?: boolean,
  ) => {
    success: boolean;
    message?: string;
    hasAssociatedCourts?: boolean;
    associatedCourtsCount?: number;
  };
  addMaintenanceBlock: (
    courtId: string,
    block: Omit<CourtScheduleBlock, "id">,
  ) => void;
  removeMaintenanceBlock: (courtId: string, blockId: string) => void;

  bookings: Booking[];
  addBooking: (
    bookingData: Omit<Booking, "id" | "createdAt" | "payment" | "endTime"> & {
      endTime?: string;
      paymentStatus?: PaymentStatus;
      paymentMethod?: PaymentMethod;
      paidAmount?: number;
    },
  ) => { success: boolean; message: string; booking?: Booking };
  updateBooking: (id: string, bookingData: Partial<Booking>) => void;
  cancelBooking: (
    id: string,
    reason: string,
  ) => { success: boolean; notifiedWaitlistCount: number };
  deleteBooking: (id: string) => void;
  moveBooking: (
    id: string,
    newCourtId: string,
    newDate: string,
    newStartTime: string,
  ) => { success: boolean; message: string };
  duplicateBooking: (
    id: string,
    newDate: string,
    newStartTime: string,
  ) => { success: boolean; message: string };
  repeatBookingWeekly: (
    id: string,
    weeksCount: number,
  ) => { successCount: number; failedCount: number };
  updatePaymentStatus: (
    bookingId: string,
    status: PaymentStatus,
    method?: PaymentMethod,
    amount?: number,
    transactionId?: string,
  ) => void;
  updateBookingPayment: (
    bookingId: string,
    status: PaymentStatus,
    method?: PaymentMethod,
    amount?: number,
    transactionId?: string,
  ) => void;

  customers: Customer[];
  addCustomer: (
    customer: Omit<
      Customer,
      "id" | "createdAt" | "totalBookings" | "totalCancellations"
    >,
  ) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  waitlist: WaitlistEntry[];
  addToWaitlist: (
    entry: Omit<WaitlistEntry, "id" | "createdAt" | "status" | "priority">,
  ) => void;
  updateWaitlistEntry: (id: string, entryData: Partial<WaitlistEntry>) => void;
  removeFromWaitlist: (id: string) => void;
  notifyWaitlistEntry: (id: string) => void;

  settings: ComplexSettings;
  updateSettings: (newSettings: Partial<ComplexSettings>) => void;
  resetToSeedData: () => void;
  resetToInitialData?: () => void;
  exportDataJSON: () => string;
  exportBackupJSON?: () => string;
  importDataJSON: (jsonString: string) => boolean;
  importBackupJSON?: (data: any) => { success: boolean };

  notifications: SystemNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  auditLogs: AuditLog[];
  addAuditLog: (
    action: string,
    entity: string,
    entityId: string,
    details: string,
  ) => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  checkCourtAvailability: (
    courtId: string,
    date: string,
    startTime: string,
    durationMinutes: number,
    excludeBookingId?: string,
  ) => { available: boolean; conflictReason?: string };
  getPublicPortalUrl: () => string;
  formatPrice: (amount: number, context?: "admin" | "client") => string;

  // Super Admin & Multi-Tenant Management
  license: LicenseInfo;
  isLicenseActive: boolean;
  remainingLicenseDays: number;
  isSuperAdmin: boolean;
  loginSuperAdmin: (
    username: string,
    password: string,
  ) => { success: boolean; message: string };
  logoutSuperAdmin: () => void;
  activateLicense30Days: (notes?: string) => void;
  extendLicenseCustomDays: (days: number, notes?: string) => void;
  setLicenseActiveStatus: (isEnabled: boolean) => void;
  simulateExpiredLicense: () => void;
  resetLicenseToDefault: () => void;

  // Multi-Tenant Complex / Client Admin Panels
  complexes: TenantComplex[];
  activeComplexId: string;
  activeComplex: TenantComplex;
  switchComplex: (id: string) => void;
  createComplex: (params: {
    name: string;
    slug?: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    address: string;
    sportPreset: SportPreset;
    primaryColor?: string;
    secondaryColor?: string;
    themeMode?: ThemeMode;
    themePreset?: string;
    initialDurationDays?: number;
    notes?: string;
  }) => TenantComplex;
  updateComplex: (id: string, partial: Partial<TenantComplex>) => void;
  deleteComplex: (id: string) => boolean;
  activateComplexLicense: (id: string, days?: number, notes?: string) => void;
  toggleComplexLicense: (id: string, isEnabled: boolean) => void;
  setComplexLicenseExpiry: (
    id: string,
    expiresAt: string,
    isEnabled?: boolean,
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    initLocalStorage();
  }, []);

  // State initialization
  const [users, setUsers] = useState<User[]>(() =>
    loadStoredData(STORAGE_KEYS.USERS, INITIAL_USERS),
  );
  const [activeUser, setActiveUserState] = useState<User>(() =>
    loadStoredData(STORAGE_KEYS.ACTIVE_USER, INITIAL_USERS[0]),
  );
  const [complexes, setComplexes] = useState<TenantComplex[]>(() =>
    loadStoredData(STORAGE_KEYS.COMPLEXES, INITIAL_COMPLEXES),
  );
  const [activeComplexId, setActiveComplexId] = useState<string>(() => {
    const initialComplexes = loadStoredData(
      STORAGE_KEYS.COMPLEXES,
      INITIAL_COMPLEXES,
    );
    return resolveActiveComplexId(initialComplexes);
  });

  const activeComplex: TenantComplex =
    complexes.find((c) => c.id === activeComplexId) ||
    complexes[0] ||
    INITIAL_COMPLEXES[0];

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (activeComplex?.settings?.themeMode === "dark") return "dark";
    if (activeComplex?.settings?.themeMode === "light") return "light";
    return loadStoredData(STORAGE_KEYS.THEME, "light");
  });

  const [courts, setCourts] = useState<Court[]>(
    () => activeComplex.courts || INITIAL_COURTS,
  );
  const [courtTypes, setCourtTypes] = useState<CourtType[]>(
    () => activeComplex.courtTypes || INITIAL_COURT_TYPES,
  );
  const [bookings, setBookings] = useState<Booking[]>(
    () => activeComplex.bookings || INITIAL_BOOKINGS,
  );
  const [customers, setCustomers] = useState<Customer[]>(
    () => activeComplex.customers || INITIAL_CUSTOMERS,
  );
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(
    () => activeComplex.waitlist || INITIAL_WAITLIST,
  );
  const [settings, setSettings] = useState<ComplexSettings>(
    () => activeComplex.settings || INITIAL_SETTINGS,
  );
  const [notifications, setNotifications] = useState<SystemNotification[]>(
    () => activeComplex.notifications || INITIAL_NOTIFICATIONS,
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(
    () => activeComplex.auditLogs || INITIAL_AUDIT_LOGS,
  );
  const [license, setLicense] = useState<LicenseInfo>(
    () => activeComplex.license || createDefaultLicense(),
  );

  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_AUTH) === "true" ||
        localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_AUTH) === "true"
      );
    } catch {
      return false;
    }
  });

  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Helper to persist changes to the active complex inside complexes master database
  const syncToActiveComplex = (partial: Partial<TenantComplex>) => {
    const currentStored: TenantComplex[] = loadStoredData(
      STORAGE_KEYS.COMPLEXES,
      INITIAL_COMPLEXES,
    );
    const updated = currentStored.map((c) => {
      if (c.id === activeComplexId) {
        return { ...c, ...partial };
      }
      return c;
    });
    saveStoredData(STORAGE_KEYS.COMPLEXES, updated);
    setComplexes(updated);
  };

  // Real-time synchronization across tabs and windows without cross-tenant interference
  useEffect(() => {
    const syncAllState = () => {
      const latestComplexes: TenantComplex[] = loadStoredData(
        STORAGE_KEYS.COMPLEXES,
        INITIAL_COMPLEXES,
      );

      // Determine active complex for THIS specific tab/window
      const resolvedId = resolveActiveComplexId(latestComplexes);
      const urlHasExplicitComplex =
        typeof window !== "undefined" &&
        Boolean(
          new URLSearchParams(window.location.search).get("c") ||
            new URLSearchParams(window.location.search).get("complex") ||
            new URLSearchParams(window.location.search).get("slug"),
        );

      const targetComplex = urlHasExplicitComplex
        ? latestComplexes.find((c) => c.id === resolvedId) ||
          latestComplexes.find((c) => c.id === activeComplexId) ||
          latestComplexes[0]
        : latestComplexes.find((c) => c.id === activeComplexId) ||
          latestComplexes.find((c) => c.id === resolvedId) ||
          latestComplexes[0];

      if (targetComplex) {
        if (targetComplex.id !== activeComplexId) {
          setActiveComplexId(targetComplex.id);
        }
        // Set state only if disk data has actually changed to avoid tearing form inputs
        setComplexes((prev) =>
          JSON.stringify(prev) === JSON.stringify(latestComplexes)
            ? prev
            : latestComplexes,
        );
        setCourts((prev) =>
          JSON.stringify(prev) === JSON.stringify(targetComplex.courts)
            ? prev
            : targetComplex.courts || [],
        );
        setCourtTypes((prev) =>
          JSON.stringify(prev) === JSON.stringify(targetComplex.courtTypes)
            ? prev
            : targetComplex.courtTypes || [],
        );
        setBookings((prev) =>
          JSON.stringify(prev) === JSON.stringify(targetComplex.bookings)
            ? prev
            : targetComplex.bookings || [],
        );
        setCustomers((prev) =>
          JSON.stringify(prev) === JSON.stringify(targetComplex.customers)
            ? prev
            : targetComplex.customers || [],
        );
        setWaitlist((prev) =>
          JSON.stringify(prev) === JSON.stringify(targetComplex.waitlist)
            ? prev
            : targetComplex.waitlist || [],
        );
        setSettings((prev) =>
          JSON.stringify(prev) === JSON.stringify(targetComplex.settings)
            ? prev
            : targetComplex.settings || INITIAL_SETTINGS,
        );
        setNotifications((prev) =>
          JSON.stringify(prev) === JSON.stringify(targetComplex.notifications)
            ? prev
            : targetComplex.notifications || [],
        );
        setAuditLogs((prev) =>
          JSON.stringify(prev) === JSON.stringify(targetComplex.auditLogs)
            ? prev
            : targetComplex.auditLogs || [],
        );
        setLicense((prev) =>
          JSON.stringify(prev) === JSON.stringify(targetComplex.license)
            ? prev
            : targetComplex.license || createDefaultLicense(),
        );
      }

      setUsers(loadStoredData(STORAGE_KEYS.USERS, INITIAL_USERS));
      setActiveUserState(
        loadStoredData(STORAGE_KEYS.ACTIVE_USER, INITIAL_USERS[0]),
      );
      setTheme(loadStoredData(STORAGE_KEYS.THEME, "light"));
    };

    const handleSyncEvent = () => {
      syncAllState();
    };

    window.addEventListener("storage", handleSyncEvent);
    window.addEventListener("focus", handleSyncEvent);
    document.addEventListener("visibilitychange", handleSyncEvent);

    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel("rm_app_sync_channel");
      channel.onmessage = () => {
        syncAllState();
      };
    }

    return () => {
      window.removeEventListener("storage", handleSyncEvent);
      window.removeEventListener("focus", handleSyncEvent);
      document.removeEventListener("visibilitychange", handleSyncEvent);
      if (channel) {
        channel.close();
      }
    };
  }, [activeComplexId]);

  // Sync to HTML root and document styling for theme, colors and brand styles
  useEffect(() => {
    applyThemeToDocument(settings);
    if (settings.themeMode === "dark" && theme !== "dark") {
      setTheme("dark");
    } else if (settings.themeMode === "light" && theme !== "light") {
      setTheme("light");
    }
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    saveStoredData(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Dynamically update document title, open graph meta tags, and favicon to match complex name and logo
  useEffect(() => {
    const complexName = settings.complexName || "Complejo Deportivo";
    const title = `${complexName} - Sistema de Reservas`;
    document.title = title;

    const setMetaTag = (
      selector: string,
      attrName: string,
      attrVal: string,
      contentVal: string,
    ) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", contentVal);
    };

    setMetaTag("meta[property='og:title']", "property", "og:title", title);
    setMetaTag(
      "meta[property='og:site_name']",
      "property",
      "og:site_name",
      complexName,
    );
    setMetaTag(
      "meta[property='og:description']",
      "property",
      "og:description",
      `Portal de reservas 24/7 de ${complexName}. Reservá tu cancha en segundos.`,
    );
    setMetaTag(
      "meta[name='description']",
      "name",
      "description",
      `Portal de reservas online 24/7 de ${complexName}.`,
    );

    if (settings.logoUrl) {
      setMetaTag(
        "meta[property='og:image']",
        "property",
        "og:image",
        settings.logoUrl,
      );
      let favicon = document.querySelector<HTMLLinkElement>(
        "link[rel~='icon']",
      );
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = settings.logoUrl;
    }
  }, [settings.complexName, settings.logoUrl]);

  const toggleTheme = () => {
    const nextTheme: "light" | "dark" = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    updateSettings({ themeMode: nextTheme });
  };

  const setThemeMode = (mode: ThemeMode) => {
    const resolvedMode: "light" | "dark" =
      mode === "dark" ? "dark" : mode === "light" ? "light" : theme;
    setTheme(resolvedMode);
    updateSettings({ themeMode: mode });
  };

  const setThemePreset = (presetId: ThemePresetId) => {
    const preset = getThemePreset(presetId);
    updateSettings({
      themePreset: presetId,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
    });
  };

  const setActiveUser = (user: User) => {
    setActiveUserState(user);
    saveStoredData(STORAGE_KEYS.ACTIVE_USER, user);
  };

  const setUserRole = (role: Role) => {
    const updated = { ...activeUser, role };
    setActiveUser(updated);
  };

  // Log creation helper
  const addAuditLog = (
    action: string,
    entity: string,
    entityId: string,
    details: string,
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      entity,
      entityId,
      details,
      user: activeUser.name,
      timestamp: `${getTodayFormatted()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    saveStoredData(STORAGE_KEYS.AUDIT_LOGS, updated);
  };

  const pushNotification = (
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "DANGER",
    link?: string,
  ) => {
    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      createdAt: "Ahora",
      isRead: false,
      link,
    };
    const updated = [notif, ...notifications];
    setNotifications(updated);
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

  // Availability Checker
  const checkCourtAvailability = (
    courtId: string,
    date: string,
    startTime: string,
    durationMinutes: number,
    excludeBookingId?: string,
  ): { available: boolean; conflictReason?: string } => {
    const targetCourtId = String(courtId || "").trim();
    const targetDate = String(date || "").split("T")[0].trim();
    const targetStartTime = String(startTime || "00:00").trim();
    const duration = Number(durationMinutes) || 60;

    const court = courts.find((c) => String(c.id).trim() === targetCourtId);
    if (!court)
      return { available: false, conflictReason: "Cancha no encontrada" };
    if (!court.isActive)
      return { available: false, conflictReason: "La cancha está inactiva" };

    const parseMins = (timeStr: string) => {
      if (!timeStr) return 0;
      const parts = String(timeStr).trim().split(":").map((v) => parseInt(v, 10) || 0);
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    };

    const openMins = parseMins(court.openingTime);
    let closeMins = parseMins(court.closingTime);
    if (closeMins <= openMins) {
      closeMins += 1440; // Handles midnight closing
    }

    const startMins = parseMins(targetStartTime);
    const endMins = startMins + duration;

    // Check opening and closing hours
    if (startMins < openMins || endMins > closeMins) {
      return {
        available: false,
        conflictReason: `Fuera del horario de atención de la cancha (${court.openingTime} a ${court.closingTime})`,
      };
    }

    // Check maintenance blocks
    if (court.maintenanceBlocks && court.maintenanceBlocks.length > 0) {
      for (const block of court.maintenanceBlocks) {
        const bStartDate = String(block.startDate || "").split("T")[0].trim();
        const bEndDate = String(block.endDate || "").split("T")[0].trim();
        if (targetDate >= bStartDate && targetDate <= bEndDate) {
          const mStart = parseMins(block.startTime);
          let mEnd = parseMins(block.endTime);
          if (mEnd <= mStart) mEnd += 1440;

          if (startMins < mEnd && endMins > mStart) {
            return {
              available: false,
              conflictReason: `Cancha bloqueada por mantenimiento: ${block.reason}`,
            };
          }
        }
      }
    }

    // Check existing non-cancelled bookings
    const activeBookings = bookings.filter((b) => {
      if (b.id === excludeBookingId) return false;
      const bStatus = String(b.status || "").toUpperCase();
      if (bStatus === "CANCELLED") return false;
      const bCourtId = String(b.courtId || "").trim();
      const bDate = String(b.date || "").split("T")[0].trim();
      return bCourtId === targetCourtId && bDate === targetDate;
    });

    for (const b of activeBookings) {
      const bStart = parseMins(b.startTime);
      let bEnd = b.durationMinutes
        ? bStart + b.durationMinutes
        : parseMins(b.endTime);
      if (bEnd <= bStart) bEnd += 1440;

      if (startMins < bEnd && endMins > bStart) {
        const displayEndTime = b.endTime || calculateEndTime(b.startTime, b.durationMinutes || 60);
        return {
          available: false,
          conflictReason: `Horario ocupado por otra reserva (${b.startTime} - ${displayEndTime})`,
        };
      }
    }

    return { available: true };
  };

  // Courts CRUD
  const addCourt = (courtData: Omit<Court, "id">) => {
    const newCourt: Court = {
      ...courtData,
      id: `court-${Date.now()}`,
    };
    const updated = [...courts, newCourt];
    setCourts(updated);
    saveStoredData(STORAGE_KEYS.COURTS, updated);
    syncToActiveComplex({ courts: updated });
    addAuditLog(
      "CREAR_CANCHA",
      "Cancha",
      newCourt.id,
      `Cancha agregada: ${newCourt.name}`,
    );
    pushNotification(
      "Cancha Agregada",
      `Se creó la cancha ${newCourt.name}`,
      "SUCCESS",
      "courts",
    );
  };

  const updateCourt = (id: string, courtData: Partial<Court>) => {
    const updated = courts.map((c) =>
      c.id === id ? { ...c, ...courtData } : c,
    );
    setCourts(updated);
    saveStoredData(STORAGE_KEYS.COURTS, updated);
    syncToActiveComplex({ courts: updated });
    addAuditLog("ACTUALIZAR_CANCHA", "Cancha", id, `Cancha modificada`);
  };

  const deleteCourt = (id: string) => {
    const target = courts.find((c) => c.id === id);
    if (!target) return;

    const updated = courts.filter((c) => c.id !== id);
    setCourts(updated);
    saveStoredData(STORAGE_KEYS.COURTS, updated);
    syncToActiveComplex({ courts: updated });

    addAuditLog(
      "ELIMINAR_CANCHA",
      "Cancha",
      id,
      `Cancha eliminada: ${target.name}`,
    );
    pushNotification(
      "Cancha Eliminada",
      `Se eliminó la cancha ${target.name}`,
      "INFO",
      "courts",
    );
  };

  const toggleCourtActive = (id: string) => {
    const court = courts.find((c) => c.id === id);
    if (court) {
      updateCourt(id, { isActive: !court.isActive });
    }
  };

  const addCourtType = (name: string, description?: string) => {
    const exists = courtTypes.some(
      (ct) => ct.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) return;

    const newType: CourtType = {
      id: `ct-${Date.now()}`,
      name,
      description,
    };
    const updated = [...courtTypes, newType];
    setCourtTypes(updated);
    saveStoredData(STORAGE_KEYS.COURT_TYPES, updated);
    syncToActiveComplex({ courtTypes: updated });
    addAuditLog(
      "CREAR_TIPO_CANCHA",
      "TipoCancha",
      newType.id,
      `Nuevo deporte/tipo: ${name}`,
    );
    pushNotification(
      "Deporte Agregado",
      `Se agregó el deporte ${name}`,
      "SUCCESS",
    );
  };

  const updateCourtType = (id: string, name: string, description?: string) => {
    const updatedTypes = courtTypes.map((ct) =>
      ct.id === id ? { ...ct, name, description } : ct,
    );
    setCourtTypes(updatedTypes);
    saveStoredData(STORAGE_KEYS.COURT_TYPES, updatedTypes);

    // Also update typeName on all courts using this courtType
    const updatedCourts = courts.map((c) =>
      c.typeId === id ? { ...c, typeName: name } : c,
    );
    setCourts(updatedCourts);
    saveStoredData(STORAGE_KEYS.COURTS, updatedCourts);
    syncToActiveComplex({ courtTypes: updatedTypes, courts: updatedCourts });

    addAuditLog(
      "ACTUALIZAR_TIPO_CANCHA",
      "TipoCancha",
      id,
      `Deporte modificado: ${name}`,
    );
    pushNotification(
      "Deporte Actualizado",
      `Se actualizó el deporte ${name}`,
      "SUCCESS",
    );
  };

  const deleteCourtType = (id: string, cascadeCourts: boolean = false) => {
    const courtsUsingType = courts.filter((c) => c.typeId === id);

    if (courtsUsingType.length > 0 && !cascadeCourts) {
      return {
        success: false,
        message: `El deporte tiene ${courtsUsingType.length} cancha(s) asociadas (${courtsUsingType.map((c) => c.name).join(", ")}).`,
        hasAssociatedCourts: true,
        associatedCourtsCount: courtsUsingType.length,
      };
    }

    let remainingCourts = courts;
    if (courtsUsingType.length > 0 && cascadeCourts) {
      remainingCourts = courts.filter((c) => c.typeId !== id);
      setCourts(remainingCourts);
      saveStoredData(STORAGE_KEYS.COURTS, remainingCourts);
    }

    const target = courtTypes.find((ct) => ct.id === id);
    const updatedTypes = courtTypes.filter((ct) => ct.id !== id);
    setCourtTypes(updatedTypes);
    saveStoredData(STORAGE_KEYS.COURT_TYPES, updatedTypes);
    syncToActiveComplex({ courtTypes: updatedTypes, courts: remainingCourts });

    if (target) {
      addAuditLog(
        "ELIMINAR_TIPO_CANCHA",
        "TipoCancha",
        id,
        `Deporte eliminado: ${target.name}`,
      );
      pushNotification(
        "Deporte Eliminado",
        cascadeCourts && courtsUsingType.length > 0
          ? `Se eliminó el deporte ${target.name} y sus ${courtsUsingType.length} cancha(s) asociadas.`
          : `Se eliminó el deporte ${target.name}`,
        "INFO",
      );
    }

    return { success: true };
  };

  const addMaintenanceBlock = (
    courtId: string,
    blockData: Omit<CourtScheduleBlock, "id">,
  ) => {
    const block: CourtScheduleBlock = {
      ...blockData,
      id: `block-${Date.now()}`,
    };
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;

    const currentBlocks = court.maintenanceBlocks || [];
    const updatedCourt = {
      ...court,
      maintenanceBlocks: [...currentBlocks, block],
    };
    updateCourt(courtId, updatedCourt);
    addAuditLog(
      "BLOQUEAR_MANTENIMIENTO",
      "Cancha",
      courtId,
      `Mantenimiento: ${block.reason}`,
    );
  };

  const removeMaintenanceBlock = (courtId: string, blockId: string) => {
    const court = courts.find((c) => c.id === courtId);
    if (!court || !court.maintenanceBlocks) return;

    const updatedBlocks = court.maintenanceBlocks.filter(
      (b) => b.id !== blockId,
    );
    updateCourt(courtId, { maintenanceBlocks: updatedBlocks });
  };

  // Customers CRUD
  const addCustomer = (
    data: Omit<
      Customer,
      "id" | "createdAt" | "totalBookings" | "totalCancellations"
    >,
  ): Customer => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: getTodayFormatted(),
      totalBookings: 0,
      totalCancellations: 0,
    };
    const updated = [...customers, newCust];
    setCustomers(updated);
    saveStoredData(STORAGE_KEYS.CUSTOMERS, updated);
    syncToActiveComplex({ customers: updated });
    addAuditLog(
      "CREAR_CLIENTE",
      "Cliente",
      newCust.id,
      `Cliente registrado: ${newCust.firstName} ${newCust.lastName}`,
    );
    return newCust;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    const updated = customers.map((c) => (c.id === id ? { ...c, ...data } : c));
    setCustomers(updated);
    saveStoredData(STORAGE_KEYS.CUSTOMERS, updated);
    syncToActiveComplex({ customers: updated });
  };

  const deleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    saveStoredData(STORAGE_KEYS.CUSTOMERS, updated);
    syncToActiveComplex({ customers: updated });
  };

  // Bookings logic
  const addBooking = (
    data: Omit<Booking, "id" | "createdAt" | "payment" | "endTime"> & {
      endTime?: string;
      paymentStatus?: PaymentStatus;
      paymentMethod?: PaymentMethod;
      paidAmount?: number;
    },
  ) => {
    const check = checkCourtAvailability(
      data.courtId,
      data.date,
      data.startTime,
      data.durationMinutes,
    );
    if (!check.available) {
      return {
        success: false,
        message: check.conflictReason || "Horario no disponible",
      };
    }

    const court = courts.find((c) => c.id === data.courtId);
    if (!court) return { success: false, message: "Cancha no encontrada" };

    const endTime = calculateEndTime(data.startTime, data.durationMinutes);
    const totalPrice = calculateBookingPrice(
      court,
      data.date,
      data.startTime,
      data.durationMinutes,
    );

    const bookingId = `book-${Date.now()}`;
    const pStatus = data.paymentStatus || "PENDING";
    const pMethod = data.paymentMethod || "CASH";
    const paidAmount =
      data.paidAmount ??
      (pStatus === "PAID"
        ? totalPrice
        : pStatus === "DEPOSIT"
          ? Math.round(totalPrice * (settings.depositPercentage / 100))
          : 0);

    const newBooking: Booking = {
      id: bookingId,
      courtId: data.courtId,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerWhatsApp: data.customerWhatsApp,
      customerEmail: data.customerEmail,
      date: data.date,
      startTime: data.startTime,
      endTime: endTime,
      durationMinutes: data.durationMinutes,
      status: data.status || "RESERVED",
      totalPrice: totalPrice,
      notes: data.notes,
      createdBy: data.createdBy || activeUser?.name || "Portal Web Público",
      createdAt: `${getTodayFormatted()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      payment: {
        id: `pay-${Date.now()}`,
        bookingId: bookingId,
        amount: paidAmount,
        status: pStatus,
        method: pMethod,
        paidAt: paidAmount > 0 ? getTodayFormatted() : undefined,
      },
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    saveStoredData(STORAGE_KEYS.BOOKINGS, updated);

    // Update customer stats
    const cust = customers.find((c) => c.id === data.customerId);
    let updatedCusts = customers;
    if (cust) {
      updatedCusts = customers.map((c) =>
        c.id === cust.id
          ? {
              ...c,
              totalBookings: c.totalBookings + 1,
              lastBookingDate: data.date,
            }
          : c,
      );
      setCustomers(updatedCusts);
      saveStoredData(STORAGE_KEYS.CUSTOMERS, updatedCusts);
    }

    syncToActiveComplex({ bookings: updated, customers: updatedCusts });

    addAuditLog(
      "CREAR_RESERVA",
      "Reserva",
      bookingId,
      `Reserva creada para ${data.customerName} en ${court.name} (${data.date} ${data.startTime})`,
    );
    pushNotification(
      "Nueva Reserva",
      `${data.customerName} reservó en ${court.name} para ${data.date} ${data.startTime} hs`,
      "SUCCESS",
      "calendar",
    );

    return {
      success: true,
      message: "Reserva creada con éxito",
      booking: newBooking,
    };
  };

  const updateBooking = (id: string, data: Partial<Booking>) => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return;

    if (data.courtId || data.date || data.startTime || data.durationMinutes) {
      const check = checkCourtAvailability(
        data.courtId || target.courtId,
        data.date || target.date,
        data.startTime || target.startTime,
        data.durationMinutes || target.durationMinutes,
        id,
      );
      if (!check.available) {
        return;
      }
    }

    const updated = bookings.map((b) => (b.id === id ? { ...b, ...data } : b));
    setBookings(updated);
    saveStoredData(STORAGE_KEYS.BOOKINGS, updated);
    syncToActiveComplex({ bookings: updated });

    const newBookingData = updated.find((b) => b.id === id);
    const court = courts.find(
      (c) => c.id === (data.courtId || target?.courtId),
    );
    const customerName =
      newBookingData?.customerName || target?.customerName || "Cliente";
    const dateStr = newBookingData?.date || target?.date;
    const timeStr = newBookingData?.startTime || target?.startTime;

    addAuditLog(
      "ACTUALIZAR_RESERVA",
      "Reserva",
      id,
      `Reserva modificada para ${customerName}`,
    );
    pushNotification(
      "Reserva Modificada",
      `Se modificó la reserva #${id} de ${customerName} (${court?.name || "Cancha"} - ${dateStr} ${timeStr} hs)`,
      "INFO",
    );
  };

  const cancelBooking = (
    id: string,
    reason: string,
  ): { success: boolean; notifiedWaitlistCount: number } => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return { success: false, notifiedWaitlistCount: 0 };

    const cancelledAtTime = `${getTodayFormatted()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const updatedBookings = bookings.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          status: "CANCELLED" as BookingStatus,
          cancelledAt: cancelledAtTime,
          cancellationReason: reason,
          cancelledBy: activeUser.name,
          payment: {
            ...b.payment,
            status: "REFUNDED" as PaymentStatus,
          },
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    saveStoredData(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // Update customer cancellation stats
    const cust = customers.find((c) => c.id === target.customerId);
    let updatedCusts = customers;
    if (cust) {
      updatedCusts = customers.map((c) =>
        c.id === cust.id
          ? {
              ...c,
              totalCancellations: c.totalCancellations + 1,
            }
          : c,
      );
      setCustomers(updatedCusts);
      saveStoredData(STORAGE_KEYS.CUSTOMERS, updatedCusts);
    }

    // Check waitlist for matches
    const matchingWaitlist = waitlist.filter(
      (w) =>
        w.courtId === target.courtId &&
        w.preferredDate === target.date &&
        w.status === "WAITING",
    );

    let notifiedCount = 0;
    let updatedWaitlist = waitlist;
    if (matchingWaitlist.length > 0) {
      const topWaitlist = matchingWaitlist[0];
      updatedWaitlist = waitlist.map((w) =>
        w.id === topWaitlist.id ? { ...w, status: "NOTIFIED" as const } : w,
      );
      setWaitlist(updatedWaitlist);
      saveStoredData(STORAGE_KEYS.WAITLIST, updatedWaitlist);
      notifiedCount = 1;

      pushNotification(
        "Lista de Espera Activada",
        `Se canceló un turno. Se notificó a ${topWaitlist.customerName} en Lista de Espera.`,
        "INFO",
        "waitlist",
      );
    }

    syncToActiveComplex({
      bookings: updatedBookings,
      customers: updatedCusts,
      waitlist: updatedWaitlist,
    });

    addAuditLog(
      "CANCELAR_RESERVA",
      "Reserva",
      id,
      `Reserva cancelada (${reason})`,
    );
    pushNotification(
      "Reserva Cancelada",
      `Se canceló la reserva de ${target.customerName} del ${target.date} ${target.startTime}`,
      "WARNING",
      "calendar",
    );

    return { success: true, notifiedWaitlistCount: notifiedCount };
  };

  const deleteBooking = (id: string) => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return;

    const updatedBookings = bookings.filter((b) => b.id !== id);
    setBookings(updatedBookings);
    saveStoredData(STORAGE_KEYS.BOOKINGS, updatedBookings);
    syncToActiveComplex({ bookings: updatedBookings });

    addAuditLog(
      "ELIMINAR_RESERVA",
      "Reserva",
      id,
      `Reserva #${id} de ${target.customerName} eliminada permanentemente`,
    );
    pushNotification(
      "Reserva Eliminada",
      `Se eliminó la reserva de ${target.customerName} (${target.date} ${target.startTime} hs)`,
      "WARNING",
    );
  };

  const moveBooking = (
    id: string,
    newCourtId: string,
    newDate: string,
    newStartTime: string,
  ) => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return { success: false, message: "Reserva no encontrada" };

    const check = checkCourtAvailability(
      newCourtId,
      newDate,
      newStartTime,
      target.durationMinutes,
      id,
    );
    if (!check.available) {
      return {
        success: false,
        message: check.conflictReason || "Horario no disponible",
      };
    }

    const court = courts.find((c) => c.id === newCourtId);
    const newEndTime = calculateEndTime(newStartTime, target.durationMinutes);
    const newPrice = court
      ? calculateBookingPrice(
          court,
          newDate,
          newStartTime,
          target.durationMinutes,
        )
      : target.totalPrice;

    updateBooking(id, {
      courtId: newCourtId,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      totalPrice: newPrice,
    });

    addAuditLog(
      "MOVER_RESERVA",
      "Reserva",
      id,
      `Reserva movida a ${court?.name} para el ${newDate} ${newStartTime}`,
    );
    return { success: true, message: "Reserva reprogramada con éxito" };
  };

  const duplicateBooking = (
    id: string,
    newDate: string,
    newStartTime: string,
  ) => {
    const target = bookings.find((b) => b.id === id);
    if (!target)
      return { success: false, message: "Reserva original no encontrada" };

    return addBooking({
      courtId: target.courtId,
      customerId: target.customerId,
      customerName: target.customerName,
      customerPhone: target.customerPhone,
      customerWhatsApp: target.customerWhatsApp,
      customerEmail: target.customerEmail,
      date: newDate,
      startTime: newStartTime,
      durationMinutes: target.durationMinutes,
      status: "RESERVED",
      notes: target.notes ? `[Copia] ${target.notes}` : "[Copia de reserva]",
      createdBy: activeUser.name,
      paymentStatus: "PENDING",
      paymentMethod: "CASH",
      totalPrice: target.totalPrice,
    });
  };

  const repeatBookingWeekly = (id: string, weeksCount: number) => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return { successCount: 0, failedCount: 0 };

    let successCount = 0;
    let failedCount = 0;
    const groupId = `repeat-${Date.now()}`;

    // Update original booking with recurring groupId
    updateBooking(id, { recurringGroupId: groupId });

    for (let i = 1; i <= weeksCount; i++) {
      const origDate = new Date(target.date + "T12:00:00");
      origDate.setDate(origDate.getDate() + 7 * i);
      const year = origDate.getFullYear();
      const month = String(origDate.getMonth() + 1).padStart(2, "0");
      const day = String(origDate.getDate()).padStart(2, "0");
      const nextDateStr = `${year}-${month}-${day}`;

      const res = addBooking({
        courtId: target.courtId,
        customerId: target.customerId,
        customerName: target.customerName,
        customerPhone: target.customerPhone,
        customerWhatsApp: target.customerWhatsApp,
        customerEmail: target.customerEmail,
        date: nextDateStr,
        startTime: target.startTime,
        durationMinutes: target.durationMinutes,
        status: "RESERVED",
        notes: `[Recurrente ${i}/${weeksCount}] ${target.notes || ""}`,
        createdBy: activeUser.name,
        paymentStatus: "PENDING",
        paymentMethod: target.payment.method,
        totalPrice: target.totalPrice,
      });

      if (res.success) {
        if (res.booking) {
          updateBooking(res.booking.id, { recurringGroupId: groupId });
        }
        successCount++;
      } else {
        failedCount++;
      }
    }

    addAuditLog(
      "REPETIR_SEMANAL",
      "Reserva",
      id,
      `Reserva repetida semanalmente ${weeksCount} veces (Éxitos: ${successCount}, Fallos: ${failedCount})`,
    );
    return { successCount, failedCount };
  };

  const updatePaymentStatus = (
    bookingId: string,
    status: PaymentStatus,
    method?: PaymentMethod,
    amount?: number,
    transactionId?: string,
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const newPayment = {
      ...booking.payment,
      status,
      method: method || booking.payment.method,
      amount:
        amount ??
        (status === "PAID" ? booking.totalPrice : booking.payment.amount),
      transactionId: transactionId || booking.payment.transactionId,
      paidAt:
        status === "PAID" || status === "DEPOSIT"
          ? getTodayFormatted()
          : booking.payment.paidAt,
    };

    const newBookingStatus: BookingStatus =
      status === "PAID" ? "CONFIRMED" : booking.status;

    updateBooking(bookingId, {
      payment: newPayment,
      status: newBookingStatus,
    });

    addAuditLog(
      "ACTUALIZAR_PAGO",
      "Pago",
      booking.payment.id,
      `Estado de pago actualizado a ${status} ($${newPayment.amount})`,
    );
  };

  // Waitlist logic
  const addToWaitlist = (
    entryData: Omit<WaitlistEntry, "id" | "createdAt" | "status" | "priority">,
  ) => {
    const newEntry: WaitlistEntry = {
      ...entryData,
      id: `wl-${Date.now()}`,
      createdAt: `${getTodayFormatted()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      status: "WAITING",
      priority:
        waitlist.filter(
          (w) =>
            w.courtId === entryData.courtId &&
            w.preferredDate === entryData.preferredDate,
        ).length + 1,
    };

    const updated = [...waitlist, newEntry];
    setWaitlist(updated);
    saveStoredData(STORAGE_KEYS.WAITLIST, updated);
    syncToActiveComplex({ waitlist: updated });
    addAuditLog(
      "AGREGAR_LISTA_ESPERA",
      "ListaEspera",
      newEntry.id,
      `${newEntry.customerName} agregado a lista de espera`,
    );
    pushNotification(
      "Lista de Espera",
      `${newEntry.customerName} se anotó en lista de espera`,
      "INFO",
      "waitlist",
    );
  };

  const removeFromWaitlist = (id: string) => {
    const updated = waitlist.filter((w) => w.id !== id);
    setWaitlist(updated);
    saveStoredData(STORAGE_KEYS.WAITLIST, updated);
    syncToActiveComplex({ waitlist: updated });
  };

  const updateWaitlistEntry = (
    id: string,
    entryData: Partial<WaitlistEntry>,
  ) => {
    const updated = waitlist.map((w) =>
      w.id === id ? { ...w, ...entryData } : w,
    );
    setWaitlist(updated);
    saveStoredData(STORAGE_KEYS.WAITLIST, updated);
    syncToActiveComplex({ waitlist: updated });
    addAuditLog(
      "EDITAR_LISTA_ESPERA",
      "ListaEspera",
      id,
      `Entrada en lista de espera #${id} modificada`,
    );
  };

  const notifyWaitlistEntry = (id: string) => {
    const updated = waitlist.map((w) =>
      w.id === id ? { ...w, status: "NOTIFIED" as const } : w,
    );
    setWaitlist(updated);
    saveStoredData(STORAGE_KEYS.WAITLIST, updated);
    syncToActiveComplex({ waitlist: updated });
  };

  // Settings & Reset
  const updateSettings = (newSettings: Partial<ComplexSettings>) => {
    const targetId = activeComplexId;
    const currentComplex =
      complexes.find((c) => c.id === targetId) ||
      loadStoredData<TenantComplex[]>(STORAGE_KEYS.COMPLEXES, INITIAL_COMPLEXES).find(
        (c) => c.id === targetId,
      ) ||
      complexes[0] ||
      INITIAL_COMPLEXES[0];

    const currentSettings = currentComplex.settings || settings || INITIAL_SETTINGS;
    const mergedSettings: ComplexSettings = {
      ...currentSettings,
      ...newSettings,
      bankDetails: {
        ...(currentSettings.bankDetails || {}),
        ...(newSettings.bankDetails || {}),
      },
      mercadoPagoDetails: {
        ...(currentSettings.mercadoPagoDetails || {}),
        ...(newSettings.mercadoPagoDetails || {}),
      },
    };

    const newComplexName = (
      mergedSettings.complexName !== undefined
        ? mergedSettings.complexName
        : currentComplex.name || ""
    ).trim();

    // Determine the next slug matching the configured administrator settings:
    // The complex name takes absolute precedence!
    let nextSlug = "";
    if (newComplexName) {
      nextSlug = slugify(newComplexName);
    } else if (newSettings.customPortalUrl && !/^https?:\/\//i.test(newSettings.customPortalUrl.trim())) {
      nextSlug = slugify(newSettings.customPortalUrl.trim());
    } else if (currentComplex.slug) {
      nextSlug = currentComplex.slug;
    } else {
      nextSlug = targetId;
    }

    // Only keep customPortalUrl if it's a full external URL; otherwise synchronize with nextSlug
    if (!mergedSettings.customPortalUrl || !/^https?:\/\//i.test(mergedSettings.customPortalUrl.trim())) {
      mergedSettings.customPortalUrl = nextSlug;
    }

    // 1. Read current master complexes from storage and update synchronously
    const storedComplexes: TenantComplex[] = loadStoredData(
      STORAGE_KEYS.COMPLEXES,
      INITIAL_COMPLEXES,
    );

    const updatedComplexes = storedComplexes.map((c) => {
      if (c.id === targetId) {
        return {
          ...c,
          name: newComplexName || c.name,
          slug: nextSlug || c.slug,
          logoUrl:
            mergedSettings.logoUrl !== undefined
              ? mergedSettings.logoUrl
              : c.logoUrl,
          address:
            mergedSettings.address !== undefined
              ? mergedSettings.address
              : c.address,
          ownerPhone:
            mergedSettings.phone !== undefined
              ? mergedSettings.phone
              : c.ownerPhone,
          ownerEmail:
            mergedSettings.email !== undefined
              ? mergedSettings.email
              : c.ownerEmail,
          settings: mergedSettings,
        };
      }
      return c;
    });

    // 2. Save master complexes FIRST so storage is immediately consistent
    saveStoredData(STORAGE_KEYS.COMPLEXES, updatedComplexes);
    saveStoredData(STORAGE_KEYS.SETTINGS, mergedSettings);
    saveStoredData(STORAGE_KEYS.ACTIVE_COMPLEX_ID, targetId);
    try {
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_COMPLEX_ID, targetId);
    } catch {}

    // 3. Update React states
    setSettings(mergedSettings);
    setComplexes(updatedComplexes);

    if (mergedSettings.themeMode) {
      setTheme(mergedSettings.themeMode === "dark" ? "dark" : "light");
    }
    applyThemeToDocument(mergedSettings);

    // 4. If URL has ?c= or ?slug=, update without reload so future syncs match
    if (typeof window !== "undefined" && window.history?.replaceState) {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has("c")) {
          url.searchParams.set("c", nextSlug);
          window.history.replaceState({}, "", url.toString());
        } else if (url.searchParams.has("slug")) {
          url.searchParams.set("slug", nextSlug);
          window.history.replaceState({}, "", url.toString());
        } else if (url.searchParams.has("complex")) {
          url.searchParams.set("complex", nextSlug);
          window.history.replaceState({}, "", url.toString());
        }
      } catch {}
    }

    addAuditLog(
      "ACTUALIZAR_CONFIG",
      "Configuracion",
      targetId,
      `Configuración del complejo "${newComplexName}" actualizada correctamente`,
    );
  };

  const resetToSeedData = () => {
    localStorage.clear();
    setCourts(INITIAL_COURTS);
    setCourtTypes(INITIAL_COURT_TYPES);
    setBookings(INITIAL_BOOKINGS);
    setCustomers(INITIAL_CUSTOMERS);
    setWaitlist(INITIAL_WAITLIST);
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    setActiveUserState(INITIAL_USERS[0]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTheme("light");

    saveStoredData(STORAGE_KEYS.COURTS, INITIAL_COURTS);
    saveStoredData(STORAGE_KEYS.COURT_TYPES, INITIAL_COURT_TYPES);
    saveStoredData(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    saveStoredData(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    saveStoredData(STORAGE_KEYS.WAITLIST, INITIAL_WAITLIST);
    saveStoredData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    saveStoredData(STORAGE_KEYS.USERS, INITIAL_USERS);
    saveStoredData(STORAGE_KEYS.ACTIVE_USER, INITIAL_USERS[0]);
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    saveStoredData(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    saveStoredData(STORAGE_KEYS.THEME, "light");
  };

  const exportDataJSON = (): string => {
    const data = {
      courts,
      courtTypes,
      bookings,
      customers,
      waitlist,
      settings,
      auditLogs,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.courts) {
        setCourts(parsed.courts);
        saveStoredData(STORAGE_KEYS.COURTS, parsed.courts);
      }
      if (parsed.courtTypes) {
        setCourtTypes(parsed.courtTypes);
        saveStoredData(STORAGE_KEYS.COURT_TYPES, parsed.courtTypes);
      }
      if (parsed.bookings) {
        setBookings(parsed.bookings);
        saveStoredData(STORAGE_KEYS.BOOKINGS, parsed.bookings);
      }
      if (parsed.customers) {
        setCustomers(parsed.customers);
        saveStoredData(STORAGE_KEYS.CUSTOMERS, parsed.customers);
      }
      if (parsed.waitlist) {
        setWaitlist(parsed.waitlist);
        saveStoredData(STORAGE_KEYS.WAITLIST, parsed.waitlist);
      }
      if (parsed.settings) {
        setSettings(parsed.settings);
        saveStoredData(STORAGE_KEYS.SETTINGS, parsed.settings);
      }
      pushNotification(
        "Importación Exitosa",
        "Los datos del sistema han sido restaurados desde el respaldo",
        "SUCCESS",
      );
      return true;
    } catch (e) {
      console.error("Failed to parse JSON backup", e);
      return false;
    }
  };

  // Notification helpers
  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );
    setNotifications(updated);
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, updated);
    syncToActiveComplex({ notifications: updated });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, []);
    syncToActiveComplex({ notifications: [] });
  };

  const getPublicPortalUrl = (): string => {
    const effectiveName = (settings?.complexName || activeComplex?.name || "").trim();
    const custom = settings?.customPortalUrl?.trim();
    const isCustomFullUrl = Boolean(custom && /^https?:\/\//i.test(custom));

    return buildComplexPortalUrl({
      complexName: effectiveName,
      slug: activeComplex?.slug || (effectiveName ? slugify(effectiveName) : undefined),
      customPortalUrl: isCustomFullUrl ? custom : undefined,
      id: activeComplexId,
    });
  };

  const formatPrice = (
    amount: number,
    context: "admin" | "client" = "admin",
  ): string => {
    return formatCurrency(amount, settings, context);
  };

  // Super Admin & License Functions
  const currentEffectiveLicense: LicenseInfo =
    activeComplex?.license || license || createDefaultLicense();
  const isLicenseActiveValue = checkIsLicenseActive(currentEffectiveLicense);
  const remainingLicenseDays = getRemainingDays(currentEffectiveLicense?.expiresAt);

  const loginSuperAdmin = (
    username: string,
    password: string,
  ): { success: boolean; message: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const isMatch =
      cleanUser === SUPER_ADMIN_CREDENTIALS.username.toLowerCase() &&
      (cleanPass === SUPER_ADMIN_CREDENTIALS.password ||
        cleanPass === "superadmin123" ||
        cleanPass === "superadmin" ||
        cleanPass === "Super@Admin");

    if (isMatch) {
      setIsSuperAdmin(true);
      try {
        sessionStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_AUTH, "true");
        localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_AUTH, "true");
      } catch (e) {
        console.error("Storage error:", e);
      }

      addAuditLog(
        "LOGIN_SUPERADMIN",
        "Seguridad",
        "superadmin",
        "Inicio de sesión exitoso como Super Administrador",
      );

      return {
        success: true,
        message: "Acceso autorizado como Super Administrador",
      };
    }

    addAuditLog(
      "LOGIN_SUPERADMIN_FALLIDO",
      "Seguridad",
      "superadmin",
      `Intento fallido de login SuperAdmin con usuario "${cleanUser}"`,
    );

    return {
      success: false,
      message: "Usuario o contraseña de Super Administrador incorrectos",
    };
  };

  const logoutSuperAdmin = () => {
    setIsSuperAdmin(false);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.SUPER_ADMIN_AUTH);
      localStorage.removeItem(STORAGE_KEYS.SUPER_ADMIN_AUTH);
    } catch (e) {
      console.error("Storage error:", e);
    }

    addAuditLog(
      "LOGOUT_SUPERADMIN",
      "Seguridad",
      "superadmin",
      "Cierre de sesión de Super Administrador",
    );
  };

  const activateLicense30Days = (notes?: string) => {
    const updated = activateLicenseDays(
      license,
      30,
      "SuperAdmin",
      notes || "Habilitación de acceso por 30 días renovada",
    );
    setLicense(updated);
    saveStoredData(STORAGE_KEYS.LICENSE, updated);

    // Also add system notification
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: "Licencia de 30 Días Activada",
      message: `El Super Administrador habilitó el Panel Administrador por 30 días (Vence: ${new Date(updated.expiresAt).toLocaleDateString("es-AR")}).`,
      type: "SUCCESS",
      createdAt: "Ahora",
      isRead: false,
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, updatedNotifs);

    syncToActiveComplex({ license: updated, notifications: updatedNotifs });

    addAuditLog(
      "HABILITAR_LICENCIA_30D",
      "Licencia",
      "lic-30d",
      `Panel Administrador habilitado por 30 días adicionales hasta ${updated.expiresAt}`,
    );
  };

  const extendLicenseCustomDays = (days: number, notes?: string) => {
    const cleanDays = Math.max(1, Math.min(days, 3650));
    const updated = activateLicenseDays(
      license,
      cleanDays,
      "SuperAdmin",
      notes || `Habilitación personalizada por ${cleanDays} días`,
    );
    setLicense(updated);
    saveStoredData(STORAGE_KEYS.LICENSE, updated);
    syncToActiveComplex({ license: updated });

    addAuditLog(
      "EXTENDER_LICENCIA",
      "Licencia",
      `lic-${cleanDays}d`,
      `Panel Administrador extendido por +${cleanDays} días hasta ${updated.expiresAt}`,
    );
  };

  const setLicenseActiveStatus = (isEnabled: boolean) => {
    const updated: LicenseInfo = {
      ...license,
      isEnabled,
    };
    setLicense(updated);
    saveStoredData(STORAGE_KEYS.LICENSE, updated);
    syncToActiveComplex({ license: updated });

    addAuditLog(
      isEnabled ? "HABILITAR_PANEL" : "BLOQUEAR_PANEL",
      "Licencia",
      "lic-status",
      `Panel Administrador ${isEnabled ? "habilitado" : "bloqueado/deshabilitado"} manualmente por Super Administrador`,
    );
  };

  const simulateExpiredLicense = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const updated = setLicenseExpiration(license, yesterday.toISOString(), true);
    setLicense(updated);
    saveStoredData(STORAGE_KEYS.LICENSE, updated);
    syncToActiveComplex({ license: updated });

    addAuditLog(
      "SIMULAR_EXPIRADO",
      "Licencia",
      "lic-test",
      "Licencia configurada en modo expirada para prueba de vencimiento",
    );
  };

  const resetLicenseToDefault = () => {
    const defaultLic = createDefaultLicense();
    setLicense(defaultLic);
    saveStoredData(STORAGE_KEYS.LICENSE, defaultLic);
    syncToActiveComplex({ license: defaultLic });

    addAuditLog(
      "RESET_LICENCIA",
      "Licencia",
      "lic-reset",
      "Licencia restablecida a 30 días por defecto",
    );
  };

  // Switch to a different client complex / admin panel
  const switchComplex = (targetId: string) => {
    // 1. Flush currently active complex state into complexes array
    const syncedComplexes = complexes.map((c) => {
      if (c.id === activeComplexId) {
        return {
          ...c,
          name: settings.complexName || c.name,
          address: settings.address || c.address,
          ownerPhone: settings.phone || c.ownerPhone,
          ownerEmail: settings.email || c.ownerEmail,
          settings,
          license,
          courts,
          courtTypes,
          bookings,
          customers,
          waitlist,
          notifications,
          auditLogs,
        };
      }
      return c;
    });

    const target = syncedComplexes.find((c) => c.id === targetId);
    if (!target) return;

    setComplexes(syncedComplexes);
    saveStoredData(STORAGE_KEYS.COMPLEXES, syncedComplexes);

    setActiveComplexId(targetId);
    saveStoredData(STORAGE_KEYS.ACTIVE_COMPLEX_ID, targetId);
    try {
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_COMPLEX_ID, targetId);
    } catch {}

    if (typeof window !== "undefined" && window.history?.replaceState) {
      try {
        const url = new URL(window.location.href);
        const targetSlug = target.slug || slugify(target.name) || target.id;
        if (url.searchParams.has("c")) {
          url.searchParams.set("c", targetSlug);
          window.history.replaceState({}, "", url.toString());
        } else if (url.searchParams.has("slug")) {
          url.searchParams.set("slug", targetSlug);
          window.history.replaceState({}, "", url.toString());
        } else if (url.searchParams.has("complex")) {
          url.searchParams.set("complex", targetSlug);
          window.history.replaceState({}, "", url.toString());
        }
      } catch {}
    }

    // Populate active states with target complex's isolated data
    const targetCourts = target.courts || [];
    setCourts(targetCourts);
    saveStoredData(STORAGE_KEYS.COURTS, targetCourts);

    const targetTypes = target.courtTypes || [];
    setCourtTypes(targetTypes);
    saveStoredData(STORAGE_KEYS.COURT_TYPES, targetTypes);

    const targetBookings = target.bookings || [];
    setBookings(targetBookings);
    saveStoredData(STORAGE_KEYS.BOOKINGS, targetBookings);

    const targetCustomers = target.customers || [];
    setCustomers(targetCustomers);
    saveStoredData(STORAGE_KEYS.CUSTOMERS, targetCustomers);

    const targetWaitlist = target.waitlist || [];
    setWaitlist(targetWaitlist);
    saveStoredData(STORAGE_KEYS.WAITLIST, targetWaitlist);

    const targetSettings = target.settings || INITIAL_SETTINGS;
    setSettings(targetSettings);
    saveStoredData(STORAGE_KEYS.SETTINGS, targetSettings);

    // Apply target complex's independent theme mode and styles
    const targetThemeMode =
      targetSettings.themeMode === "dark" ? "dark" : "light";
    setTheme(targetThemeMode);
    applyThemeToDocument(targetSettings);

    const targetNotifs = target.notifications || [];
    setNotifications(targetNotifs);
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, targetNotifs);

    const targetLogs = target.auditLogs || [];
    setAuditLogs(targetLogs);
    saveStoredData(STORAGE_KEYS.AUDIT_LOGS, targetLogs);

    const targetLic = target.license || createDefaultLicense();
    setLicense(targetLic);
    saveStoredData(STORAGE_KEYS.LICENSE, targetLic);

    // Push audit
    addAuditLog(
      "CAMBIAR_PANEL_CLIENTE",
      "SuperAdmin",
      target.id,
      `Acceso cambiado al panel administrador del complejo: ${target.name}`,
    );
  };

  // Create a new client complex / admin panel
  const createComplex = (params: {
    name: string;
    slug?: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    address: string;
    sportPreset: SportPreset;
    primaryColor?: string;
    secondaryColor?: string;
    themeMode?: ThemeMode;
    themePreset?: string;
    initialDurationDays?: number;
    notes?: string;
  }): TenantComplex => {
    const newComplex = createNewTenantComplex(params);
    
    // Sync active complex state first
    const syncedComplexes = complexes.map((c) => {
      if (c.id === activeComplexId) {
        return {
          ...c,
          name: settings.complexName || c.name,
          address: settings.address || c.address,
          ownerPhone: settings.phone || c.ownerPhone,
          ownerEmail: settings.email || c.ownerEmail,
          settings,
          license,
          courts,
          courtTypes,
          bookings,
          customers,
          waitlist,
          notifications,
          auditLogs,
        };
      }
      return c;
    });

    const updatedComplexes = [...syncedComplexes, newComplex];
    setComplexes(updatedComplexes);
    saveStoredData(STORAGE_KEYS.COMPLEXES, updatedComplexes);

    addAuditLog(
      "CREAR_PANEL_CLIENTE",
      "SuperAdmin",
      newComplex.id,
      `Nuevo panel de cliente creado para: ${newComplex.name} (Cliente: ${newComplex.ownerName}) con habilitación de ${params.initialDurationDays || 30} días`,
    );

    return newComplex;
  };

  // Update client complex configuration with strict tenant isolation
  const updateComplex = (id: string, partial: Partial<TenantComplex>) => {
    setComplexes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const currentSettings = c.settings
            ? JSON.parse(JSON.stringify(c.settings))
            : { ...INITIAL_SETTINGS };
          const currentLicense = c.license
            ? JSON.parse(JSON.stringify(c.license))
            : createDefaultLicense();

          const nextName =
            partial.name !== undefined ? partial.name.trim() : c.name;
          const nextSlug =
            partial.slug !== undefined
              ? partial.slug.trim()
              : partial.name
              ? slugify(partial.name)
              : c.slug;
          const nextAddress =
            partial.address !== undefined ? partial.address.trim() : c.address;
          const nextPhone =
            partial.ownerPhone !== undefined
              ? partial.ownerPhone.trim()
              : c.ownerPhone;
          const nextEmail =
            partial.ownerEmail !== undefined
              ? partial.ownerEmail.trim()
              : c.ownerEmail;
          const nextOwner =
            partial.ownerName !== undefined
              ? partial.ownerName.trim()
              : c.ownerName;
          const nextLogo =
            partial.logoUrl !== undefined
              ? partial.logoUrl
              : (partial.settings?.logoUrl !== undefined
                ? partial.settings.logoUrl
                : (c.logoUrl || currentSettings.logoUrl || ""));

          const mergedSettings: ComplexSettings = {
            ...currentSettings,
            ...(partial.settings || {}),
            complexName: nextName || currentSettings.complexName || c.name,
            logoUrl: nextLogo,
            address: nextAddress || currentSettings.address || c.address,
            phone: nextPhone || currentSettings.phone || c.ownerPhone,
            whatsapp: nextPhone
              ? nextPhone.replace(/[^0-9]/g, "")
              : currentSettings.whatsapp,
            email: nextEmail || currentSettings.email || c.ownerEmail,
            customPortalUrl:
              nextSlug || currentSettings.customPortalUrl || c.slug,
          };

          const nextComplex: TenantComplex = {
            ...c,
            ...partial,
            name: nextName,
            slug: nextSlug,
            logoUrl: nextLogo,
            ownerName: nextOwner,
            ownerPhone: nextPhone,
            ownerEmail: nextEmail,
            address: nextAddress,
            settings: mergedSettings,
            license: partial.license
              ? { ...currentLicense, ...partial.license }
              : c.license,
            courts: partial.courts
              ? JSON.parse(JSON.stringify(partial.courts))
              : c.courts,
            courtTypes: partial.courtTypes
              ? JSON.parse(JSON.stringify(partial.courtTypes))
              : c.courtTypes,
            bookings: partial.bookings
              ? JSON.parse(JSON.stringify(partial.bookings))
              : c.bookings,
            customers: partial.customers
              ? JSON.parse(JSON.stringify(partial.customers))
              : c.customers,
            waitlist: partial.waitlist
              ? JSON.parse(JSON.stringify(partial.waitlist))
              : c.waitlist,
            notifications: partial.notifications
              ? JSON.parse(JSON.stringify(partial.notifications))
              : c.notifications,
            auditLogs: partial.auditLogs
              ? JSON.parse(JSON.stringify(partial.auditLogs))
              : c.auditLogs,
          };

          // Synchronize active states ONLY if modifying the currently active complex
          if (id === activeComplexId) {
            setSettings(mergedSettings);
            saveStoredData(STORAGE_KEYS.SETTINGS, mergedSettings);

            if (nextComplex.license) {
              setLicense(nextComplex.license);
              saveStoredData(STORAGE_KEYS.LICENSE, nextComplex.license);
            }
            if (nextComplex.courts) {
              setCourts(nextComplex.courts);
              saveStoredData(STORAGE_KEYS.COURTS, nextComplex.courts);
            }
            if (nextComplex.courtTypes) {
              setCourtTypes(nextComplex.courtTypes);
              saveStoredData(STORAGE_KEYS.COURT_TYPES, nextComplex.courtTypes);
            }
            if (nextComplex.bookings) {
              setBookings(nextComplex.bookings);
              saveStoredData(STORAGE_KEYS.BOOKINGS, nextComplex.bookings);
            }
            if (nextComplex.customers) {
              setCustomers(nextComplex.customers);
              saveStoredData(STORAGE_KEYS.CUSTOMERS, nextComplex.customers);
            }
            if (nextComplex.waitlist) {
              setWaitlist(nextComplex.waitlist);
              saveStoredData(STORAGE_KEYS.WAITLIST, nextComplex.waitlist);
            }
          }

          return nextComplex;
        }
        return c;
      });

      saveStoredData(STORAGE_KEYS.COMPLEXES, updated);
      return updated;
    });

    addAuditLog(
      "EDITAR_PANEL_CLIENTE",
      "SuperAdmin",
      id,
      `Datos del panel de cliente actualizados (ID: ${id})`,
    );
  };

  // Delete a client complex
  const deleteComplex = (id: string): boolean => {
    if (complexes.length <= 1) {
      return false; // Protect last complex
    }
    const filtered = complexes.filter((c) => c.id !== id);
    setComplexes(filtered);
    saveStoredData(STORAGE_KEYS.COMPLEXES, filtered);

    if (activeComplexId === id && filtered.length > 0) {
      switchComplex(filtered[0].id);
    }

    addAuditLog(
      "ELIMINAR_PANEL_CLIENTE",
      "SuperAdmin",
      id,
      `Panel de cliente eliminado por SuperAdmin (ID: ${id})`,
    );
    return true;
  };

  // Enable / Extend 30 days (or custom) for a specific client complex
  const activateComplexLicense = (
    id: string,
    days: number = 30,
    notes?: string,
  ) => {
    const cleanDays = Math.max(1, Math.min(days, 3650));
    setComplexes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const updatedLic = activateLicenseDays(
            c.license,
            cleanDays,
            "SuperAdmin",
            notes || `Habilitación mensual de +${cleanDays} días por SuperAdmin`,
          );
          if (id === activeComplexId) {
            setLicense(updatedLic);
            saveStoredData(STORAGE_KEYS.LICENSE, updatedLic);
          }
          return {
            ...c,
            license: updatedLic,
          };
        }
        return c;
      });
      saveStoredData(STORAGE_KEYS.COMPLEXES, updated);
      return updated;
    });

    addAuditLog(
      "HABILITAR_30_DIAS_CLIENTE",
      "SuperAdmin",
      id,
      `Habilitación de +${cleanDays} días aplicada al panel de cliente (ID: ${id})`,
    );
  };

  // Toggle active / lock status for a specific client complex
  const toggleComplexLicense = (id: string, isEnabled: boolean) => {
    setComplexes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const updatedLic: LicenseInfo = {
            ...c.license,
            isEnabled,
          };
          if (id === activeComplexId) {
            setLicense(updatedLic);
            saveStoredData(STORAGE_KEYS.LICENSE, updatedLic);
          }
          return {
            ...c,
            license: updatedLic,
          };
        }
        return c;
      });
      saveStoredData(STORAGE_KEYS.COMPLEXES, updated);
      return updated;
    });

    addAuditLog(
      isEnabled ? "HABILITAR_CLIENTE" : "BLOQUEAR_CLIENTE",
      "SuperAdmin",
      id,
      `Panel de cliente ${isEnabled ? "habilitado" : "bloqueado / pausado"} por SuperAdmin (ID: ${id})`,
    );
  };

  // Set exact expiration date on a client complex
  const setComplexLicenseExpiry = (
    id: string,
    expiresAt: string,
    isEnabled: boolean = true,
  ) => {
    setComplexes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const updatedLic: LicenseInfo = {
            ...c.license,
            isEnabled,
            expiresAt,
          };
          if (id === activeComplexId) {
            setLicense(updatedLic);
            saveStoredData(STORAGE_KEYS.LICENSE, updatedLic);
          }
          return {
            ...c,
            license: updatedLic,
          };
        }
        return c;
      });
      saveStoredData(STORAGE_KEYS.COMPLEXES, updated);
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeUser,
        users,
        setActiveUser,
        setUserRole,

        theme,
        toggleTheme,
        setThemeMode,
        setThemePreset,

        courts,
        courtTypes,
        addCourt,
        updateCourt,
        deleteCourt,
        toggleCourtActive,
        addCourtType,
        updateCourtType,
        deleteCourtType,
        addMaintenanceBlock,
        removeMaintenanceBlock,

        bookings,
        addBooking,
        updateBooking,
        cancelBooking,
        deleteBooking,
        moveBooking,
        duplicateBooking,
        repeatBookingWeekly,
        updatePaymentStatus,
        updateBookingPayment: updatePaymentStatus,

        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,

        waitlist,
        addToWaitlist,
        updateWaitlistEntry,
        removeFromWaitlist,
        notifyWaitlistEntry,

        settings,
        updateSettings,
        resetToSeedData,
        resetToInitialData: resetToSeedData,
        exportDataJSON,
        exportBackupJSON: exportDataJSON,
        importDataJSON,
        importBackupJSON: (data: any) => {
          const str = typeof data === "string" ? data : JSON.stringify(data);
          const ok = importDataJSON(str);
          return { success: ok };
        },

        notifications,
        markNotificationRead,
        clearAllNotifications,

        auditLogs,
        addAuditLog,

        searchOpen,
        setSearchOpen,

        checkCourtAvailability,
        getPublicPortalUrl,
        formatPrice,

        // Super Admin & License
        license,
        isLicenseActive: isLicenseActiveValue,
        remainingLicenseDays,
        isSuperAdmin,
        loginSuperAdmin,
        logoutSuperAdmin,
        activateLicense30Days,
        extendLicenseCustomDays,
        setLicenseActiveStatus,
        simulateExpiredLicense,
        resetLicenseToDefault,

        // Multi-Tenant Complexes
        complexes,
        activeComplexId,
        activeComplex,
        switchComplex,
        createComplex,
        updateComplex,
        deleteComplex,
        activateComplexLicense,
        toggleComplexLicense,
        setComplexLicenseExpiry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
