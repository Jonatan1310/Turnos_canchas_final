export type Role = "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface LicenseActivationRecord {
  id: string;
  date: string; // ISO or YYYY-MM-DD HH:mm
  daysAdded: number;
  previousExpiresAt: string;
  newExpiresAt: string;
  activatedBy: string;
  notes?: string;
}

export interface LicenseInfo {
  isEnabled: boolean;
  activatedAt: string; // ISO date string
  expiresAt: string; // ISO date string
  durationDays: number; // e.g. 30
  lastActivatedBy: string; // e.g. "SuperAdmin"
  planName?: string;
  history?: LicenseActivationRecord[];
}

export type SportPreset = "MULTISPORT" | "FUTBOL" | "PADEL" | "TENIS";

export interface TenantComplex {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  createdAt: string;
  notes?: string;
  adminUsername?: string;
  adminPassword?: string;
  license: LicenseInfo;
  settings: ComplexSettings;
  courts: Court[];
  courtTypes: CourtType[];
  bookings: Booking[];
  customers: Customer[];
  waitlist: WaitlistEntry[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
}

export interface CourtType {
  id: string;
  name: string; // e.g., "Fútbol 5", "Fútbol 7", "Pádel", "Tenis", "Básquet", "Fútbol 9"
  description?: string;
}

export interface CourtScheduleBlock {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason: string; // e.g., "Mantenimiento césped sintético", "Torneo privado"
}

export interface Court {
  id: string;
  name: string;
  description?: string;
  typeId: string;
  typeName: string;
  pricePerHour: number;
  weekendSurchargePercent: number; // e.g. 20%
  nightSurchargeAmount: number; // e.g. 5000 ARS extra after 20:00
  openingTime: string; // "08:00"
  closingTime: string; // "23:00"
  slotDurationMinutes: 60 | 120;
  isActive: boolean;
  maintenanceBlocks?: CourtScheduleBlock[];
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  notes?: string;
  createdAt: string;
  totalBookings: number;
  totalCancellations: number;
  lastBookingDate?: string;
}

export type BookingStatus =
  "AVAILABLE" | "RESERVED" | "CONFIRMED" | "CANCELLED" | "FINISHED";

export type PaymentStatus = "PENDING" | "DEPOSIT" | "PAID" | "REFUNDED";
export type PaymentMethod = "CASH" | "TRANSFER" | "MERCADO_PAGO" | "CARD";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  paymentUrl?: string;
  paidAt?: string;
}

export interface Booking {
  id: string;
  courtId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp: string;
  customerEmail?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  status: BookingStatus;
  totalPrice: number;
  notes?: string;
  createdBy: string; // User name or ID
  createdAt: string;

  // Cancellation details
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;

  // Recurring booking link
  recurringGroupId?: string;

  // Payment relation
  payment: Payment;
}

export interface WaitlistEntry {
  id: string;
  courtId: string;
  courtName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp: string;
  preferredDate: string;
  preferredTimeSlot: string; // e.g., "20:00 - 21:00"
  notes?: string;
  priority: number;
  createdAt: string;
  status: "WAITING" | "NOTIFIED" | "CONVERTED" | "EXPIRED";
}

export interface BankTransferDetails {
  bankName: string; // Ej: "Banco Galicia", "Mercado Pago", "Brubank"
  accountHolder: string; // Ej: "Complejo Deportivo S.R.L."
  cbuCvu: string; // Ej: "0000003100012345678901"
  alias: string; // Ej: "CANCHAS.PADEL"
  cuitCuil: string; // Ej: "30-71234567-8"
}

export interface MercadoPagoDetails {
  accountHolder?: string;
  mpAliasOrEmail?: string;
  cvuMp?: string;
  cuitCuilMp?: string;
  checkoutLinkMp?: string;
  notesMp?: string;
}

export interface ComplexSettings {
  complexName: string;
  logoUrl?: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  currencySymbol: string; // "$", "USD", etc.

  // Configuración de Moneda y Divisa
  primaryCurrency?: "ARS" | "USD"; // Moneda base en la que se cargan las tarifas (ARS o USD)
  exchangeRateUsdToArs?: number; // Tipo de cambio / cotización (ej: 1 USD = 1200 ARS)
  displayCurrencyAdmin?: "ARS" | "USD" | "BOTH"; // Divisa a mostrar en el Panel Administrador
  displayCurrencyClient?: "ARS" | "USD" | "BOTH"; // Divisa a mostrar en el Portal Público de Clientes
  defaultOpeningTime: string; // "08:00"
  defaultClosingTime: string; // "23:00"
  depositPercentage: number; // e.g. 50%
  primaryColor: string;
  secondaryColor?: string;
  themeMode?: "light" | "dark" | "system";
  themePreset?: string;
  cancellationPolicyHours: number; // e.g. 24

  // Configuración de Medios de Pago
  bankDetails?: BankTransferDetails;
  mercadoPagoDetails?: MercadoPagoDetails;
  cashPaymentNotes?: string;

  // Información del Complejo & Servicios para el Portal Público
  customPortalUrl?: string;
  showCarousel?: boolean;
  carouselImages?: string[];
  showPublicServices?: boolean;
  showWifiSection?: boolean;
  showBarSection?: boolean;
  showRulesSection?: boolean;
  showGoogleMapsBtn?: boolean;
  wifiName?: string;
  wifiPassword?: string;
  barInfo?: string;
  complexRules?: string;
  googleMapsUrl?: string;
  amenitiesList?: string[];
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export interface AuditLog {
  id: string;
  action: string; // e.g. "CREAR_RESERVA", "CANCELAR_RESERVA", "NUEVA_CANCHA"
  entity: string; // e.g. "Reserva", "Cancha", "Cliente"
  entityId: string;
  details: string;
  user: string;
  timestamp: string;
}
