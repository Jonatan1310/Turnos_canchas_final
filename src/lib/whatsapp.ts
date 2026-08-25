import { ComplexSettings } from "../types";
import { formatCurrency } from "./currency";

export interface WhatsAppMessageData {
  customerName: string;
  customerWhatsApp: string;
  courtName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  complexName: string;
  totalPrice?: number;
  currencySymbol?: string;
  cancellationReason?: string;
  depositAmount?: number;
  settings?: ComplexSettings;
  portalUrl?: string;
}

export function resolvePortalUrl(data: { settings?: ComplexSettings; portalUrl?: string }): string {
  if (data.portalUrl && data.portalUrl.trim()) return data.portalUrl.trim();
  if (data.settings?.customPortalUrl && data.settings.customPortalUrl.trim()) {
    const rawUrl = data.settings.customPortalUrl.trim();
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    if (rawUrl.startsWith("/") || rawUrl.startsWith("?")) {
      if (typeof window !== "undefined") {
        return `${window.location.origin}${window.location.pathname.replace(/\/$/, "")}${rawUrl.startsWith("/") ? rawUrl : "/" + rawUrl}`;
      }
    }
    return `https://${rawUrl}`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}${window.location.pathname}?view=portal`;
  }
  return "";
}

export function cleanPhoneForWhatsApp(phone: string): string {
  if (!phone) return "";
  const raw = phone.trim();
  const hasPlus = raw.startsWith("+");
  let cleaned = raw.replace(/\D/g, "");
  if (!cleaned) return "";

  // If already formatted with country code 549 (Argentina)
  if (cleaned.startsWith("549")) {
    if (cleaned.length === 15 && cleaned.substring(5, 7) === "15") {
      cleaned = "549" + cleaned.substring(3, 5) + cleaned.substring(7);
    }
    return cleaned;
  }

  // If starts with 54 (Argentina without 9)
  if (cleaned.startsWith("54")) {
    cleaned = "549" + cleaned.substring(2);
    if (cleaned.length === 15 && cleaned.substring(5, 7) === "15") {
      cleaned = "549" + cleaned.substring(3, 5) + cleaned.substring(7);
    }
    return cleaned;
  }

  // Strip leading zero(s)
  while (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Handle Argentine '15' prefix in local formats
  if (cleaned.length === 11 && cleaned.substring(2, 4) === "15") {
    cleaned = cleaned.substring(0, 2) + cleaned.substring(4);
  } else if (cleaned.length === 12 && cleaned.substring(2, 4) === "15") {
    cleaned = cleaned.substring(0, 2) + cleaned.substring(4);
  } else if (cleaned.length === 12 && cleaned.substring(3, 5) === "15") {
    cleaned = cleaned.substring(0, 3) + cleaned.substring(5);
  } else if (cleaned.length === 12 && cleaned.substring(4, 6) === "15") {
    cleaned = cleaned.substring(0, 4) + cleaned.substring(6);
  } else if (cleaned.length === 10 && cleaned.startsWith("15")) {
    cleaned = "11" + cleaned.substring(2);
  } else if (cleaned.length === 8 && cleaned.startsWith("15")) {
    cleaned = "11" + cleaned.substring(2);
  }

  // Prepend Argentina country code 549
  if (cleaned.length === 10) {
    cleaned = `549${cleaned}`;
  } else if (cleaned.length === 8) {
    cleaned = `54911${cleaned}`;
  } else if (cleaned.length === 9) {
    cleaned = `54911${cleaned.substring(1)}`;
  } else if (!hasPlus && !cleaned.startsWith("549") && cleaned.length < 11) {
    cleaned = `549${cleaned}`;
  }

  return cleaned;
}

export function formatWhatsAppDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function createWhatsAppConfirmationLink(
  data: WhatsAppMessageData,
): string {
  const cleanPhone = cleanPhoneForWhatsApp(data.customerWhatsApp);
  const formattedDate = formatWhatsAppDate(data.date);
  const priceText = data.totalPrice
    ? `\n💰 *Total:* ${formatCurrency(data.totalPrice, data.settings, 'client')}`
    : "";
  const portal = resolvePortalUrl(data);
  const portalText = portal ? `\n\n🌐 *Portal de Reservas:* ${portal}` : "";

  const message = `Hola *${data.customerName}*! 👋

Tu reserva en *${data.complexName}* ha sido *CONFIRMADA* ✅

📌 *Detalles del Turno:*
👤 *Cliente:* ${data.customerName}
🏟️ *Cancha:* ${data.courtName}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${data.startTime} hs a ${data.endTime} hs${priceText}${portalText}

🎉 ¡Te esperamos! Muchas gracias. ⚽🎾`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppCancellationLink(
  data: WhatsAppMessageData,
): string {
  const cleanPhone = cleanPhoneForWhatsApp(data.customerWhatsApp);
  const formattedDate = formatWhatsAppDate(data.date);
  const reasonText = data.cancellationReason
    ? `\n📌 *Motivo:* ${data.cancellationReason}`
    : "";
  const portal = resolvePortalUrl(data);
  const portalText = portal ? `\n👉 *Portal de Reservas:* ${portal}` : "";

  const message = `Hola *${data.customerName}*! 👋

Te informamos que tu turno en *${data.complexName}* ha sido *CANCELADO* ❌

📌 *Detalles del Turno:*
👤 *Cliente:* ${data.customerName}
🏟️ *Cancha:* ${data.courtName}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${data.startTime} hs a ${data.endTime} hs${reasonText}

Si deseas reservar nuevamente para otro día u horario, podés ingresar a nuestro portal web:
${portalText}

¡Muchas gracias! ⚽🎾`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppReminderLink(
  data: WhatsAppMessageData,
  hoursBefore: 24 | 2,
): string {
  const cleanPhone = cleanPhoneForWhatsApp(data.customerWhatsApp);
  const formattedDate = formatWhatsAppDate(data.date);
  const reminderType =
    hoursBefore === 24
      ? "¡Recordatorio! Mañana tenés tu turno 🔔"
      : "¡Recordatorio! Tenés tu turno en 2 hours ⏰";
  const portal = resolvePortalUrl(data);
  const portalText = portal ? `\n👉 *Portal de Reservas:* ${portal}` : "";

  const message = `Hola *${data.customerName}*! 👋

${reminderType}

📌 *Detalles de la Reserva:*
👤 *Cliente:* ${data.customerName}
🏟️ *Cancha:* ${data.courtName}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${data.startTime} hs a ${data.endTime} hs en *${data.complexName}*

Por favor confirmá tu asistencia o ingresá a nuestro portal:
${portalText}

¡Te esperamos! ⚽🎾`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppWaitlistAlertLink(
  data: WhatsAppMessageData,
): string {
  const cleanPhone = cleanPhoneForWhatsApp(data.customerWhatsApp);
  const formattedDate = formatWhatsAppDate(data.date);
  const portal = resolvePortalUrl(data);
  const portalText = portal ? `\n👉 *Reservá directamente en:* ${portal}` : "";

  const message = `Hola *${data.customerName}*! 🎉👋

¡Se ha liberado un turno en *${data.complexName}*! 🚨

📌 *Turno Disponible:*
👤 *Cliente:* ${data.customerName}
🏟️ *Cancha:* ${data.courtName}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${data.startTime} hs a ${data.endTime} hs

Como estás en nuestra *Lista de Espera* 📌, tenés prioridad. Respondé este mensaje o reservá en nuestro portal:
${portalText}

¡Muchas gracias! ⚽🎾`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export interface DepositReceiptData {
  complexPhone: string;
  complexName: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  courtName: string;
  courtTypeName?: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  durationMinutes: number;
  depositAmount: number;
  totalPrice: number;
  paymentMethod: string;
  notes?: string;
  settings?: ComplexSettings;
}

export function createWhatsAppDepositReceiptLink(
  data: DepositReceiptData,
): string {
  const cleanPhone = cleanPhoneForWhatsApp(data.complexPhone);
  const formattedDate = formatWhatsAppDate(data.date);

  let methodLabel = "Transferencia Bancaria";
  if (data.paymentMethod === "MERCADO_PAGO") methodLabel = "Mercado Pago";
  if (data.paymentMethod === "CASH") methodLabel = "Efectivo en Recepción";

  const notesLine =
    data.notes && data.notes.trim() ? `\n📌 *Notas:* ${data.notes.trim()}` : "";

  const formattedDeposit = formatCurrency(data.depositAmount, data.settings, 'client');
  const formattedTotal = formatCurrency(data.totalPrice, data.settings, 'client');

  const message = `Hola *${data.complexName}*! 👋

Realicé una reserva desde el portal web y envío el comprobante de pago:

📌 *Detalles de la Reserva:*
🔹 *Código:* #${data.bookingId}
👤 *Cliente:* ${data.customerName} (${data.customerPhone})
🏟️ *Cancha:* ${data.courtName}${data.courtTypeName ? ` (${data.courtTypeName})` : ""}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${data.startTime} hs a ${data.endTime} hs (${data.durationMinutes} min)
💵 *Seña Abonada:* ${formattedDeposit}
💰 *Total Turno:* ${formattedTotal}
💳 *Medio de Pago:* ${methodLabel}${notesLine}

${data.paymentMethod === "TRANSFER" || data.paymentMethod === "MERCADO_PAGO" ? "📄 *Adjunto el comprobante de pago a continuación.*" : ""}

¡Muchas gracias! ⚽🎾`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export interface ModificationMessageData {
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  bookingId: string;
  courtName: string;
  courtTypeName?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  complexName: string;
  complexPhone: string;
  notes?: string;
  settings?: ComplexSettings;
  portalUrl?: string;
}

export function createWhatsAppModificationNoticeToAdminLink(
  data: ModificationMessageData,
): string {
  const cleanPhone = cleanPhoneForWhatsApp(data.complexPhone);
  const formattedDate = formatWhatsAppDate(data.date);
  const notesLine =
    data.notes && data.notes.trim() ? `\n📌 *Notas:* ${data.notes.trim()}` : "";
  const formattedTotal = formatCurrency(data.totalPrice, data.settings, 'admin');

  const message = `Hola *${data.complexName}*! ✏️

Se ha *MODIFICADO* una reserva desde el portal web:

📌 *Nuevos Detalles de la Reserva:*
🔹 *Código:* #${data.bookingId}
👤 *Cliente:* ${data.customerName} (${data.customerPhone})
🏟️ *Cancha:* ${data.courtName}${data.courtTypeName ? ` (${data.courtTypeName})` : ""}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${data.startTime} hs a ${data.endTime} hs (${data.durationMinutes} min)
💰 *Precio Total:* ${formattedTotal}${notesLine}

Por favor tomar nota de los cambios. ¡Gracias! ⚽🎾`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppModificationNoticeToCustomerLink(
  data: ModificationMessageData,
): string {
  const cleanPhone = cleanPhoneForWhatsApp(
    data.customerWhatsApp || data.customerPhone,
  );
  const formattedDate = formatWhatsAppDate(data.date);
  const notesLine =
    data.notes && data.notes.trim() ? `\n📌 *Notas:* ${data.notes.trim()}` : "";
  const formattedTotal = formatCurrency(data.totalPrice, data.settings, 'client');
  const portal = resolvePortalUrl(data);
  const portalText = portal ? `\n\n🌐 *Portal de Reservas:* ${portal}` : "";

  const message = `Hola *${data.customerName}*! ✏️👋

Tu reserva en *${data.complexName}* ha sido *MODIFICADA* exitosamente ✅

📌 *Detalles de tu Reserva:*
🔹 *Código:* #${data.bookingId}
👤 *Cliente:* ${data.customerName}
🏟️ *Cancha:* ${data.courtName}${data.courtTypeName ? ` (${data.courtTypeName})` : ""}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${data.startTime} hs a ${data.endTime} hs (${data.durationMinutes} min)
💰 *Precio Total:* ${formattedTotal}${notesLine}${portalText}

🎉 ¡Te esperamos! Muchas gracias. ⚽🎾`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppCancellationNoticeToAdminLink(data: {
  complexPhone: string;
  complexName: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  courtName: string;
  date: string;
  startTime: string;
  reason?: string;
}): string {
  const cleanPhone = cleanPhoneForWhatsApp(data.complexPhone);
  const formattedDate = formatWhatsAppDate(data.date);
  const reasonText = data.reason ? `\n📌 *Motivo:* ${data.reason}` : "";

  const message = `Hola *${data.complexName}*! ❌

Se ha *CANCELADO* una reserva desde el portal web:

📌 *Detalles de la Reserva Cancelada:*
🔹 *Código:* #${data.bookingId}
👤 *Cliente:* ${data.customerName} (${data.customerPhone})
🏟️ *Cancha:* ${data.courtName}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${data.startTime} hs${reasonText}

📌 El turno ha sido liberado automáticamente en el sistema. ⚽🎾`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppCancellationNoticeToCustomerLink(data: {
  customerPhone: string;
  customerName: string;
  complexName: string;
  bookingId: string;
  courtName: string;
  date: string;
  startTime: string;
  reason?: string;
  settings?: ComplexSettings;
  portalUrl?: string;
}): string {
  const cleanPhone = cleanPhoneForWhatsApp(data.customerPhone);
  const formattedDate = formatWhatsAppDate(data.date);
  const reasonText = data.reason ? `\n📌 *Motivo:* ${data.reason}` : "";
  const portal = resolvePortalUrl(data);
  const portalText = portal ? `\n👉 *Portal de Reservas:* ${portal}` : "";

  const message = `Hola *${data.customerName}*! ❌👋

Lamentamos informarte que tu reserva *#${data.bookingId}* en *${data.complexName}* ha sido *CANCELADA* ❌

📌 *Detalles del Turno Cancelado:*
👤 *Cliente:* ${data.customerName}
🏟️ *Cancha:* ${data.courtName}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${data.startTime} hs${reasonText}

Si tenés alguna duda o querés reprogramar, ingresá a nuestro portal de reservas:
${portalText}

¡Muchas gracias! ⚽🎾`;

  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
