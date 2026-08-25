import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  Repeat,
  Copy,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Booking, PaymentMethod, PaymentStatus } from "../../types";
import { calculateBookingPrice, calculateEndTime } from "../../lib/storage";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourtId?: string;
  initialDate?: string;
  initialStartTime?: string;
  editingBooking?: Booking | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialCourtId,
  initialDate,
  initialStartTime,
  editingBooking,
}) => {
  const {
    courts,
    customers,
    addCustomer,
    addBooking,
    updateBooking,
    duplicateBooking,
    repeatBookingWeekly,
    checkCourtAvailability,
    activeUser,
    formatPrice,
  } = useApp();

  // Form State
  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);

  // Customer Selection State
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  // Payment State
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");

  // Advanced Options
  const [enableWeeklyRepeat, setEnableWeeklyRepeat] = useState(false);
  const [repeatWeeksCount, setRepeatWeeksCount] = useState(4);

  // Error/Success Feedback
  const [errorMessage, setErrorMessage] = useState("");

  // Reset or Populate Form
  useEffect(() => {
    if (editingBooking) {
      setCourtId(editingBooking.courtId);
      setDate(editingBooking.date);
      setStartTime(editingBooking.startTime);
      setDurationMinutes(editingBooking.durationMinutes);
      setSelectedCustomerId(editingBooking.customerId);
      setCustomerSearch(editingBooking.customerName);
      setPhone(editingBooking.customerPhone);
      setWhatsapp(editingBooking.customerWhatsApp);
      setEmail(editingBooking.customerEmail || "");
      setPaymentStatus(editingBooking.payment.status);
      setPaymentMethod(editingBooking.payment.method);
      setNotes(editingBooking.notes || "");
    } else {
      const defaultCourt = courts.length > 0 ? courts[0].id : "";
      const today = new Date().toISOString().split("T")[0];
      setCourtId(initialCourtId || defaultCourt);
      setDate(initialDate || today);
      setStartTime(initialStartTime || "18:00");
      setDurationMinutes(60);
      setSelectedCustomerId("");
      setCustomerSearch("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setWhatsapp("");
      setEmail("");
      setPaymentStatus("PENDING");
      setPaymentMethod("CASH");
      setNotes("");
      setEnableWeeklyRepeat(false);
    }
    setErrorMessage("");
  }, [
    isOpen,
    editingBooking,
    initialCourtId,
    initialDate,
    initialStartTime,
    courts,
  ]);

  if (!isOpen) return null;

  const selectedCourt = courts.find((c) => c.id === courtId);
  const endTimeCalculated = calculateEndTime(startTime, durationMinutes);
  const computedPrice = selectedCourt
    ? calculateBookingPrice(selectedCourt, date, startTime, durationMinutes)
    : 0;

  // Filter existing customers
  const filteredCustomers = customerSearch.trim()
    ? customers.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`
            .toLowerCase()
            .includes(customerSearch.toLowerCase()) ||
          c.phone.includes(customerSearch) ||
          c.whatsapp.includes(customerSearch),
      )
    : [];

  const handleSelectCustomer = (c: (typeof customers)[0]) => {
    setSelectedCustomerId(c.id);
    setCustomerSearch(`${c.firstName} ${c.lastName}`);
    setFirstName(c.firstName);
    setLastName(c.lastName);
    setPhone(c.phone);
    setWhatsapp(c.whatsapp);
    setEmail(c.email || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!courtId) {
      setErrorMessage("Por favor selecciona una cancha.");
      return;
    }

    if (!date) {
      setErrorMessage("Por favor selecciona la fecha.");
      return;
    }

    let finalCustomerId = selectedCustomerId;
    let finalCustomerName = customerSearch;
    let finalPhone = phone;
    let finalWhatsApp = whatsapp;

    // Create new customer if not selected from existing list
    if (!finalCustomerId) {
      if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
        setErrorMessage(
          "Ingresá Nombre, Apellido y Teléfono para registrar al nuevo cliente.",
        );
        return;
      }
      const newCust = addCustomer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim().replace(/\D/g, ""),
        email: email.trim() || undefined,
      });
      finalCustomerId = newCust.id;
      finalCustomerName = `${newCust.firstName} ${newCust.lastName}`;
      finalPhone = newCust.phone;
      finalWhatsApp = newCust.whatsapp;
    }

    if (editingBooking) {
      // Check availability excluding current booking
      const check = checkCourtAvailability(
        courtId,
        date,
        startTime,
        durationMinutes,
        editingBooking.id,
      );
      if (!check.available) {
        setErrorMessage(check.conflictReason || "Horario no disponible.");
        return;
      }

      updateBooking(editingBooking.id, {
        courtId,
        date,
        startTime,
        endTime: endTimeCalculated,
        durationMinutes,
        totalPrice: computedPrice,
        notes,
        payment: {
          ...editingBooking.payment,
          status: paymentStatus,
          method: paymentMethod,
          amount:
            paymentStatus === "PAID"
              ? computedPrice
              : editingBooking.payment.amount,
        },
      });
      onClose();
    } else {
      // Create new booking
      const res = addBooking({
        courtId,
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        customerPhone: finalPhone,
        customerWhatsApp: finalWhatsApp,
        customerEmail: email || undefined,
        date,
        startTime,
        durationMinutes,
        status: paymentStatus === "PAID" ? "CONFIRMED" : "RESERVED",
        notes,
        createdBy: activeUser.name,
        paymentStatus,
        paymentMethod,
        totalPrice: computedPrice,
      });

      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }

      // Handle weekly repetition if selected
      if (enableWeeklyRepeat && res.booking && repeatWeeksCount > 0) {
        repeatBookingWeekly(res.booking.id, repeatWeeksCount);
      }

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingBooking ? "Editar Reserva" : "Nueva Reserva de Cancha"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[80vh] overflow-y-auto"
        >
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Court, Date & Time */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Selección de Cancha y Horario
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cancha
                </label>
                <select
                  value={courtId}
                  onChange={(e) => setCourtId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.typeName}) -{" "}
                      {formatPrice(c.pricePerHour, 'admin')}/h
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  step="1800"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duración del Turno
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>30 Minutos</option>
                  <option value={60}>60 Minutos (1 Hora)</option>
                  <option value={120}>120 Minutos (2 Horas)</option>
                </select>
              </div>
            </div>

            {/* Price Preview Banner */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
              <span className="font-medium">
                Horario: <strong className="font-bold">{startTime} hs</strong> a{" "}
                <strong className="font-bold">{endTimeCalculated} hs</strong> (
                {durationMinutes} min)
              </span>
              <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">
                Total: {formatPrice(computedPrice, 'admin')}
              </span>
            </div>
          </div>

          {/* Section 2: Customer Data */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Datos del Cliente
            </h3>

            {/* Customer Search Auto-complete */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Buscar cliente existente o ingresar nuevo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setSelectedCustomerId("");
                  }}
                  placeholder="Escribí nombre o teléfono del cliente..."
                  className="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Suggestions dropdown */}
              {customerSearch &&
                !selectedCustomerId &&
                filteredCustomers.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                    {filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-xs flex justify-between items-center"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {c.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Detailed fields if creating new customer */}
            {!selectedCustomerId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Juan"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Pérez"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Teléfono / Celular *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!whatsapp) setWhatsapp(e.target.value);
                    }}
                    placeholder="+54 9 11..."
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    WhatsApp (con código de país)
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="54911..."
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Payment & Notes */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Estado de Pago y Observaciones
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estado del Pago
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) =>
                    setPaymentStatus(e.target.value as PaymentStatus)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pendiente (Sin cobrar)</option>
                  <option value="DEPOSIT">Seña Abonada</option>
                  <option value="PAID">Pagado Total</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Método de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">Efectivo</option>
                  <option value="TRANSFER">Transferencia / Alias</option>
                  <option value="MERCADO_PAGO">Mercado Pago</option>
                  <option value="CARD">Tarjeta de Débito/Crédito</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observaciones / Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Requieren pecheras, traen pelotas propias..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Weekly Recurrence Option (Only for new bookings) */}
            {!editingBooking && (
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableWeeklyRepeat}
                    onChange={(e) => setEnableWeeklyRepeat(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-blue-500" />
                    Repetir este turno semanalmente fijamente
                  </span>
                </label>

                {enableWeeklyRepeat && (
                  <div className="mt-2.5 ml-6 flex items-center space-x-3 text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      Repetir durante
                    </span>
                    <select
                      value={repeatWeeksCount}
                      onChange={(e) =>
                        setRepeatWeeksCount(Number(e.target.value))
                      }
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                    >
                      <option value={2}>2 semanas</option>
                      <option value={4}>4 semanas (1 Mes)</option>
                      <option value={8}>8 semanas (2 Meses)</option>
                      <option value={12}>12 semanas (3 Meses)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {editingBooking ? "Guardar Cambios" : "Confirmar Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
