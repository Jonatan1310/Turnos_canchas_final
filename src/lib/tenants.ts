import {
  TenantComplex,
  CourtType,
  Court,
  ComplexSettings,
  LicenseInfo,
  Customer,
  Booking,
} from "../types";
import {
  INITIAL_BOOKINGS,
  INITIAL_COURTS,
  INITIAL_COURT_TYPES,
  INITIAL_CUSTOMERS,
  INITIAL_SETTINGS,
  INITIAL_WAITLIST,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  getTodayFormatted,
} from "../data/initialData";
import { createDefaultLicense, activateLicenseDays } from "./license";

const today = getTodayFormatted();

// Helper to produce a deep copy of an object
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const INITIAL_COMPLEXES: TenantComplex[] = [
  {
    id: "complex-central",
    name: "Complejo Deportivo Central",
    slug: "complejo-central",
    ownerName: "Carlos Rodríguez",
    ownerEmail: "carlos@complejodeportivo.com",
    ownerPhone: "+54 9 11 4000-8888",
    address: "Av. Libertador 4500, Buenos Aires",
    createdAt: "2026-01-10",
    notes: "Cliente principal con 6 canchas multideporte y bar canteen.",
    adminUsername: "admin_central",
    adminPassword: "admin@central",
    license: createDefaultLicense(),
    settings: {
      ...deepClone(INITIAL_SETTINGS),
      complexName: "Complejo Deportivo Central",
      themeMode: "light",
      themePreset: "indigo",
      primaryColor: "#4f46e5",
      secondaryColor: "#6366f1",
    },
    courts: deepClone(INITIAL_COURTS),
    courtTypes: deepClone(INITIAL_COURT_TYPES),
    bookings: deepClone(INITIAL_BOOKINGS),
    customers: deepClone(INITIAL_CUSTOMERS),
    waitlist: deepClone(INITIAL_WAITLIST),
    notifications: deepClone(INITIAL_NOTIFICATIONS),
    auditLogs: deepClone(INITIAL_AUDIT_LOGS),
  },
  {
    id: "complex-padel-san-isidro",
    name: "Pádel Club San Isidro",
    slug: "padel-san-isidro",
    ownerName: "Gonzalo Fernández",
    ownerEmail: "gonzalo@padelsanisidro.com",
    ownerPhone: "+54 9 11 5566-7788",
    address: "Calle Dardo Rocha 1250, San Isidro",
    createdAt: "2026-02-01",
    notes: "Club boutique de pádel panorámico con iluminación LED y pro-shop.",
    adminUsername: "admin_sanisidro",
    adminPassword: "admin@padel",
    license: (() => {
      const now = new Date();
      const expires = new Date();
      expires.setDate(expires.getDate() + 24); // 24 days left
      return {
        isEnabled: true,
        activatedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        durationDays: 30,
        lastActivatedBy: "SuperAdmin",
        planName: "Plan Administrador 30 Días",
        history: [
          {
            id: "act-san-1",
            date: now.toISOString(),
            daysAdded: 30,
            previousExpiresAt: now.toISOString(),
            newExpiresAt: expires.toISOString(),
            activatedBy: "SuperAdmin",
            notes: "Habilitación mensual de Pádel Club San Isidro",
          },
        ],
      };
    })(),
    settings: {
      ...deepClone(INITIAL_SETTINGS),
      complexName: "Pádel Club San Isidro",
      logoUrl:
        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200",
      address: "Calle Dardo Rocha 1250, San Isidro",
      phone: "+54 11 5566-7788",
      whatsapp: "5491155667788",
      email: "contacto@padelsanisidro.com",
      themeMode: "dark",
      themePreset: "emerald",
      primaryColor: "#059669", // Emerald
      secondaryColor: "#10b981",
      customPortalUrl: "padel-san-isidro",
      wifiName: "PadelSanIsidro_Guest",
      wifiPassword: "padelindoor2026",
      barInfo: "Pro-Shop oficial Bullpadel, bebidas isotónicas y cafetería de especialidad.",
    },
    courts: [
      {
        id: "court-si-1",
        name: "Pista Central Panorámica 1",
        description: "Pista panorámica con vidrio templado de 12mm y césped Mondo azul",
        typeId: "ct-4",
        typeName: "Pádel",
        pricePerHour: 22000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3000,
        openingTime: "07:30",
        closingTime: "23:30",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: "court-si-2",
        name: "Pista Crystal 2 (Indoor)",
        description: "Cubierta con climatización y extractor de humedad",
        typeId: "ct-4",
        typeName: "Pádel",
        pricePerHour: 22000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3000,
        openingTime: "07:30",
        closingTime: "23:30",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: "court-si-3",
        name: "Pista Crystal 3 (Indoor)",
        description: "Cubierta reglamentaria FAP",
        typeId: "ct-4",
        typeName: "Pádel",
        pricePerHour: 20000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3000,
        openingTime: "07:30",
        closingTime: "23:30",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: "court-si-4",
        name: "Pista Exterior 4",
        description: "Al aire libre con reflectores LED de alta potencia",
        typeId: "ct-4",
        typeName: "Pádel",
        pricePerHour: 18000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 2500,
        openingTime: "08:00",
        closingTime: "23:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
    ],
    courtTypes: [
      {
        id: "ct-4",
        name: "Pádel",
        description: "Pistas panorámicas de cristal y césped Mondo",
      },
    ],
    bookings: [
      {
        id: "book-si-101",
        courtId: "court-si-1",
        customerId: "cust-si-1",
        customerName: "Matías Rossi",
        customerPhone: "+54 9 11 9988-1122",
        customerWhatsApp: "5491199881122",
        customerEmail: "matias.rossi@email.com",
        date: today,
        startTime: "19:00",
        endTime: "20:30",
        durationMinutes: 90,
        status: "CONFIRMED",
        totalPrice: 33000,
        notes: "Llegan 10 min antes para calentar",
        createdBy: "Admin Pádel San Isidro",
        createdAt: `${today} 09:30`,
        payment: {
          id: "pay-si-101",
          bookingId: "book-si-101",
          amount: 33000,
          status: "PAID",
          method: "MERCADO_PAGO",
          transactionId: "MP-SI-99128",
          paidAt: `${today} 09:31`,
        },
      },
      {
        id: "book-si-102",
        courtId: "court-si-2",
        customerId: "cust-si-2",
        customerName: "Florencia Peña",
        customerPhone: "+54 9 11 3344-5566",
        customerWhatsApp: "5491133445566",
        date: today,
        startTime: "20:30",
        endTime: "22:00",
        durationMinutes: 90,
        status: "CONFIRMED",
        totalPrice: 33000,
        notes: "Partida de torneo nocturno",
        createdBy: "Admin Pádel San Isidro",
        createdAt: `${today} 11:00`,
        payment: {
          id: "pay-si-102",
          bookingId: "book-si-102",
          amount: 16500,
          status: "DEPOSIT",
          method: "TRANSFER",
          paidAt: `${today} 11:05`,
        },
      },
    ],
    customers: [
      {
        id: "cust-si-1",
        firstName: "Matías",
        lastName: "Rossi",
        phone: "+54 9 11 9988-1122",
        whatsapp: "5491199881122",
        email: "matias.rossi@email.com",
        notes: "Jugador categoría 4ta",
        createdAt: "2026-02-05",
        totalBookings: 6,
        totalCancellations: 0,
      },
      {
        id: "cust-si-2",
        firstName: "Florencia",
        lastName: "Peña",
        phone: "+54 9 11 3344-5566",
        whatsapp: "5491133445566",
        createdAt: "2026-02-12",
        totalBookings: 4,
        totalCancellations: 0,
      },
    ],
    waitlist: [],
    notifications: [
      {
        id: "notif-si-1",
        title: "Reserva de Turno Nocturno",
        message: "Matías Rossi reservó Pista Central a las 19:00 hs.",
        type: "SUCCESS",
        createdAt: "Hoy",
        isRead: false,
      },
    ],
    auditLogs: [
      {
        id: "log-si-1",
        action: "CREAR_RESERVA",
        entity: "Reserva",
        entityId: "book-si-101",
        details: "Reserva abonada en Pista Central Panorámica 1",
        user: "Admin Pádel San Isidro",
        timestamp: `${today} 09:30`,
      },
    ],
  },
  {
    id: "complex-arena-nordelta",
    name: "Arena Sport Club Nordelta",
    slug: "arena-nordelta",
    ownerName: "Martín Benítez",
    ownerEmail: "martin@arenasport.com",
    ownerPhone: "+54 9 11 6789-0123",
    address: "Av. de los Lagos 200, Nordelta",
    createdAt: "2026-02-15",
    notes: "Complejo de Fútbol 7 sintético y canchas de Tenis polvo de ladrillo.",
    adminUsername: "admin_arena",
    adminPassword: "admin@arena",
    license: (() => {
      // Configured as expired/paused to demonstrate lock screen and 30-day reactivation
      const past = new Date();
      past.setDate(past.getDate() - 3);
      return {
        isEnabled: false,
        activatedAt: past.toISOString(),
        expiresAt: past.toISOString(),
        durationDays: 30,
        lastActivatedBy: "SuperAdmin",
        planName: "Plan Administrador 30 Días",
        history: [
          {
            id: "act-arena-1",
            date: past.toISOString(),
            daysAdded: 30,
            previousExpiresAt: past.toISOString(),
            newExpiresAt: past.toISOString(),
            activatedBy: "SuperAdmin",
            notes: "Período anterior finalizado",
          },
        ],
      };
    })(),
    settings: {
      ...deepClone(INITIAL_SETTINGS),
      complexName: "Arena Sport Club Nordelta",
      logoUrl:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200",
      address: "Av. de los Lagos 200, Nordelta",
      phone: "+54 11 6789-0123",
      whatsapp: "5491167890123",
      email: "contacto@arenasport.com",
      themeMode: "dark",
      themePreset: "rose",
      primaryColor: "#e11d48", // Crimson Rose
      secondaryColor: "#f43f5e",
      customPortalUrl: "arena-nordelta",
      wifiName: "ArenaNordelta_5G",
      wifiPassword: "futbolynordelta",
    },
    courts: [
      {
        id: "court-an-1",
        name: "Cancha Estadio (Fútbol 7)",
        description: "Césped sintético FIFA Quality Pro de 60mm",
        typeId: "ct-2",
        typeName: "Fútbol 7",
        pricePerHour: 40000,
        weekendSurchargePercent: 20,
        nightSurchargeAmount: 7000,
        openingTime: "08:00",
        closingTime: "23:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: "court-an-2",
        name: "Tenis Polvo 1",
        description: "Cancha de tenis con drenaje rápido",
        typeId: "ct-5",
        typeName: "Tenis",
        pricePerHour: 24000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 4000,
        openingTime: "08:00",
        closingTime: "22:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
    ],
    courtTypes: [
      { id: "ct-2", name: "Fútbol 7", description: "Césped sintético" },
      { id: "ct-5", name: "Tenis", description: "Polvo de ladrillo" },
    ],
    bookings: [],
    customers: [],
    waitlist: [],
    notifications: [],
    auditLogs: [],
  },
];

export type SportPreset = "MULTISPORT" | "FUTBOL" | "PADEL" | "TENIS";

/**
 * Creates a brand new fully functioning Tenant Complex panel ready to use.
 */
export function createNewTenantComplex(params: {
  name: string;
  slug?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  sportPreset: SportPreset;
  primaryColor?: string;
  secondaryColor?: string;
  themeMode?: "light" | "dark" | "system";
  themePreset?: string;
  initialDurationDays?: number;
  notes?: string;
}): TenantComplex {
  const cleanName = params.name.trim();
  const generatedSlug =
    params.slug?.trim() ||
    cleanName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const id = `complex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const days = params.initialDurationDays && params.initialDurationDays > 0 ? params.initialDurationDays : 30;

  const now = new Date();
  const expires = new Date();
  expires.setDate(expires.getDate() + days);

  const license: LicenseInfo = {
    isEnabled: true,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    durationDays: days,
    lastActivatedBy: "SuperAdmin",
    planName: `Plan Administrador (${days} Días)`,
    history: [
      {
        id: `act-init-${Date.now()}`,
        date: now.toISOString(),
        daysAdded: days,
        previousExpiresAt: now.toISOString(),
        newExpiresAt: expires.toISOString(),
        activatedBy: "SuperAdmin",
        notes: `Creación y activación inicial de panel por ${days} días`,
      },
    ],
  };

  // Generate sport-specific courts and types
  let courtTypes: CourtType[] = [];
  let courts: Court[] = [];
  const primaryColor = params.primaryColor || (
    params.sportPreset === "PADEL" ? "#059669" :
    params.sportPreset === "FUTBOL" ? "#2563eb" :
    params.sportPreset === "TENIS" ? "#d97706" : "#4f46e5"
  );

  if (params.sportPreset === "PADEL") {
    courtTypes = [
      { id: "ct-padel", name: "Pádel", description: "Pistas panorámicas de cristal" },
    ];
    courts = [
      {
        id: `court-${id}-1`,
        name: "Pista 1 (Panorámica Pro)",
        description: "Cristal templado 12mm y césped Mondo",
        typeId: "ct-padel",
        typeName: "Pádel",
        pricePerHour: 20000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3000,
        openingTime: "08:00",
        closingTime: "23:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: `court-${id}-2`,
        name: "Pista 2 (Indoor)",
        description: "Techada con iluminación LED antirreflejo",
        typeId: "ct-padel",
        typeName: "Pádel",
        pricePerHour: 20000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3000,
        openingTime: "08:00",
        closingTime: "23:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: `court-${id}-3`,
        name: "Pista 3 (Cristal)",
        description: "Cancha de alta competencia",
        typeId: "ct-padel",
        typeName: "Pádel",
        pricePerHour: 18000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3000,
        openingTime: "08:00",
        closingTime: "23:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
    ];
  } else if (params.sportPreset === "FUTBOL") {
    courtTypes = [
      { id: "ct-f5", name: "Fútbol 5", description: "Césped sintético 50mm" },
      { id: "ct-f7", name: "Fútbol 7", description: "Cancha amplia 7 vs 7" },
    ];
    courts = [
      {
        id: `court-${id}-1`,
        name: "Cancha 1 (Fútbol 5 Techada)",
        description: "Sintético con redes perimetrales e iluminación LED",
        typeId: "ct-f5",
        typeName: "Fútbol 5",
        pricePerHour: 26000,
        weekendSurchargePercent: 20,
        nightSurchargeAmount: 5000,
        openingTime: "08:00",
        closingTime: "23:30",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: `court-${id}-2`,
        name: "Cancha 2 (Fútbol 5 Abierta)",
        description: "Césped sintético con excelente drenaje",
        typeId: "ct-f5",
        typeName: "Fútbol 5",
        pricePerHour: 24000,
        weekendSurchargePercent: 20,
        nightSurchargeAmount: 4000,
        openingTime: "08:00",
        closingTime: "23:30",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: `court-${id}-3`,
        name: "Cancha 3 (Fútbol 7)",
        description: "Medidas reglamentarias para 14 jugadores",
        typeId: "ct-f7",
        typeName: "Fútbol 7",
        pricePerHour: 36000,
        weekendSurchargePercent: 20,
        nightSurchargeAmount: 6000,
        openingTime: "08:00",
        closingTime: "23:30",
        slotDurationMinutes: 60,
        isActive: true,
      },
    ];
  } else if (params.sportPreset === "TENIS") {
    courtTypes = [
      { id: "ct-tenis", name: "Tenis", description: "Polvo de ladrillo y cemento" },
    ];
    courts = [
      {
        id: `court-${id}-1`,
        name: "Cancha 1 (Polvo de Ladrillo)",
        description: "Piso profesional con riego automático",
        typeId: "ct-tenis",
        typeName: "Tenis",
        pricePerHour: 22000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3500,
        openingTime: "07:30",
        closingTime: "22:30",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: `court-${id}-2`,
        name: "Cancha 2 (Polvo de Ladrillo)",
        description: "Cancha iluminada con reflectores LED",
        typeId: "ct-tenis",
        typeName: "Tenis",
        pricePerHour: 22000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3500,
        openingTime: "07:30",
        closingTime: "22:30",
        slotDurationMinutes: 60,
        isActive: true,
      },
    ];
  } else {
    // MULTISPORT
    courtTypes = [
      { id: "ct-f5", name: "Fútbol 5", description: "Sintético techado" },
      { id: "ct-padel", name: "Pádel", description: "Cristal Panorámico" },
      { id: "ct-tenis", name: "Tenis", description: "Polvo de ladrillo" },
    ];
    courts = [
      {
        id: `court-${id}-1`,
        name: "Cancha Principal (Fútbol 5)",
        description: "Césped sintético techado",
        typeId: "ct-f5",
        typeName: "Fútbol 5",
        pricePerHour: 25000,
        weekendSurchargePercent: 20,
        nightSurchargeAmount: 5000,
        openingTime: "08:00",
        closingTime: "23:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: `court-${id}-2`,
        name: "Pádel Cristal 1",
        description: "Pista de cristal panorámica",
        typeId: "ct-padel",
        typeName: "Pádel",
        pricePerHour: 19000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3000,
        openingTime: "08:00",
        closingTime: "23:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
      {
        id: `court-${id}-3`,
        name: "Tenis Polvo 1",
        description: "Cancha de polvo de ladrillo",
        typeId: "ct-tenis",
        typeName: "Tenis",
        pricePerHour: 21000,
        weekendSurchargePercent: 15,
        nightSurchargeAmount: 3500,
        openingTime: "08:00",
        closingTime: "22:00",
        slotDurationMinutes: 60,
        isActive: true,
      },
    ];
  }

  const settings: ComplexSettings = {
    ...INITIAL_SETTINGS,
    complexName: cleanName,
    address: params.address.trim() || "Dirección del Complejo",
    phone: params.ownerPhone.trim(),
    whatsapp: params.ownerPhone.replace(/[^0-9]/g, ""),
    email: params.ownerEmail.trim(),
    primaryColor,
    secondaryColor: params.secondaryColor || primaryColor,
    themeMode: params.themeMode || "light",
    themePreset: params.themePreset || (
      params.sportPreset === "PADEL" ? "emerald" :
      params.sportPreset === "FUTBOL" ? "blue" :
      params.sportPreset === "TENIS" ? "amber" : "indigo"
    ),
    customPortalUrl: generatedSlug,
    wifiName: `${cleanName.replace(/\s+/g, "")}_Guest`,
    wifiPassword: "canchasdeportivas",
    defaultOpeningTime: "07:30",
    defaultClosingTime: "23:30",
    depositPercentage: 50,
    cancellationPolicyHours: 4,
    bankDetails: {
      bankName: "Banco Galicia / Transferencias",
      accountHolder: cleanName,
      cbuCvu: `00000031000${Math.floor(10000000000 + Math.random() * 89999999999)}`,
      alias: `${generatedSlug.toUpperCase().replace(/[^A-Z0-9]/g, "")}.PAGOS`,
      cuitCuil: "30-71234567-8",
    },
    mercadoPagoDetails: {
      accountHolder: cleanName,
      mpAliasOrEmail: `${generatedSlug.toLowerCase().replace(/[^a-z0-9]/g, "")}.mp`,
      cvuMp: `00000031000${Math.floor(10000000000 + Math.random() * 89999999999)}`,
      cuitCuilMp: "30-71234567-8",
    },
    barInfo: "Cafetería, bebidas frías, alquiler de paletas/pelotas y vestuarios disponibles.",
    complexRules: "Seña del 50% requerida. Cancelaciones con hasta 4 horas de anticipación. Tolerancia de 10 min.",
  };

  // Starter Customers for the new complex
  const cust1Id = `cust-${id}-1`;
  const cust2Id = `cust-${id}-2`;
  const customers: Customer[] = [
    {
      id: cust1Id,
      firstName: "Nicolás",
      lastName: "Gómez",
      phone: "+54 9 11 4455-8899",
      whatsapp: "5491144558899",
      email: "nicolas.gomez@gmail.com",
      createdAt: now.toISOString().split("T")[0],
      totalBookings: 1,
      totalCancellations: 0,
      lastBookingDate: today,
      notes: "Cliente frecuente. Juega regularmente en turno noche.",
    },
    {
      id: cust2Id,
      firstName: "Agustina",
      lastName: "Benítez",
      phone: "+54 9 11 2233-7711",
      whatsapp: "5491122337711",
      email: "agus.benitez@outlook.com",
      createdAt: now.toISOString().split("T")[0],
      totalBookings: 1,
      totalCancellations: 0,
      lastBookingDate: today,
      notes: "Abona siempre vía transferencia inmediata.",
    },
  ];

  // Starter Bookings for the new complex
  const bookings: Booking[] = [
    {
      id: `book-${id}-101`,
      courtId: courts[0]?.id || `court-${id}-1`,
      customerId: cust1Id,
      customerName: "Nicolás Gómez",
      customerPhone: "+54 9 11 4455-8899",
      customerWhatsApp: "5491144558899",
      customerEmail: "nicolas.gomez@gmail.com",
      date: today,
      startTime: "19:00",
      endTime: "20:30",
      durationMinutes: 90,
      status: "CONFIRMED",
      totalPrice: (courts[0]?.pricePerHour || 20000) * 1.5,
      notes: "Turno reservado con pago completo",
      createdBy: `Admin ${cleanName}`,
      createdAt: `${today} 10:00`,
      payment: {
        id: `pay-${id}-101`,
        bookingId: `book-${id}-101`,
        amount: (courts[0]?.pricePerHour || 20000) * 1.5,
        status: "PAID",
        method: "TRANSFER",
        transactionId: `TR-${id.toUpperCase().substring(0, 4)}-101`,
        paidAt: `${today} 10:05`,
      },
    },
    {
      id: `book-${id}-102`,
      courtId: courts[1]?.id || courts[0]?.id || `court-${id}-2`,
      customerId: cust2Id,
      customerName: "Agustina Benítez",
      customerPhone: "+54 9 11 2233-7711",
      customerWhatsApp: "5491122337711",
      customerEmail: "agus.benitez@outlook.com",
      date: today,
      startTime: "20:30",
      endTime: "22:00",
      durationMinutes: 90,
      status: "CONFIRMED",
      totalPrice: (courts[1]?.pricePerHour || courts[0]?.pricePerHour || 20000) * 1.5,
      notes: "Seña del 50% abonada vía Mercado Pago",
      createdBy: `Portal Web ${cleanName}`,
      createdAt: `${today} 11:30`,
      payment: {
        id: `pay-${id}-102`,
        bookingId: `book-${id}-102`,
        amount: ((courts[1]?.pricePerHour || courts[0]?.pricePerHour || 20000) * 1.5) * 0.5,
        status: "DEPOSIT",
        method: "MERCADO_PAGO",
        transactionId: `MP-${id.toUpperCase().substring(0, 4)}-102`,
        paidAt: `${today} 11:32`,
      },
    },
  ];

  return {
    id,
    name: cleanName,
    slug: generatedSlug,
    ownerName: params.ownerName.trim(),
    ownerEmail: params.ownerEmail.trim(),
    ownerPhone: params.ownerPhone.trim(),
    address: params.address.trim() || "Dirección del Complejo",
    createdAt: now.toISOString().split("T")[0],
    notes: params.notes?.trim() || "Panel de cliente generado por SuperAdmin",
    adminUsername: `admin_${generatedSlug.replace(/[^a-z0-9]/g, "").substring(0, 12)}`,
    adminPassword: "admin@canchas",
    license,
    settings,
    courts,
    courtTypes,
    bookings,
    customers,
    waitlist: [],
    notifications: [
      {
        id: `notif-${id}-1`,
        title: "¡Panel Administrador Listo!",
        message: `¡Bienvenido a ${cleanName}! Tu panel se encuentra habilitado por ${days} días. Puedes gestionar reservas, canchas, precios y compartir tu portal web.`,
        type: "SUCCESS",
        createdAt: "Ahora",
        isRead: false,
      },
    ],
    auditLogs: [
      {
        id: `log-${id}-1`,
        action: "CREAR_COMPLEJO",
        entity: "Panel Cliente",
        entityId: id,
        details: `Panel de administrador creado por SuperAdmin para ${params.ownerName} (${days} días habilitados)`,
        user: "SuperAdmin",
        timestamp: `${now.toISOString().split("T")[0]} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      },
    ],
  };
}
