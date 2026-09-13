import React, { useState } from "react";
import {
  Calendar,
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  PlusCircle,
  MessageCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ActiveTab } from "../layout/Sidebar";
import { Booking } from "../../types";
import { createWhatsAppConfirmationLink } from "../../lib/whatsapp";

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewBookingModal: () => void;
  onSelectBookingToEdit?: (booking: Booking) => void;
  onSelectBookingToCancel?: (bookingId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewBookingModal,
  onSelectBookingToEdit,
  onSelectBookingToCancel,
}) => {
  const { bookings, courts, customers, waitlist, settings, activeUser, formatPrice, deleteBooking } =
    useApp();

  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const formatAdminPrice = (val: number) => formatPrice(val, 'admin');

  const today = new Date().toISOString().split("T")[0];

  // Today's Bookings
  const todayBookings = bookings.filter(
    (b) => b.date === today && b.status !== "CANCELLED",
  );
  const todayRevenue = todayBookings.reduce(
    (sum, b) =>
      sum + (b.payment.status === "PAID" ? b.totalPrice : b.payment.amount),
    0,
  );
  const totalCancellationsToday = bookings.filter(
    (b) => b.date === today && b.status === "CANCELLED",
  ).length;

  // Active Courts Count
  const activeCourts = courts.filter((c) => c.isActive).length;

  // Waiting list count
  const activeWaitlist = waitlist.filter((w) => w.status === "WAITING").length;

  // Month Revenue
  const currentMonth = today.substring(0, 7); // "YYYY-MM"
  const monthBookings = bookings.filter(
    (b) => b.date.startsWith(currentMonth) && b.status !== "CANCELLED",
  );
  const monthRevenue = monthBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-500/30">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-blue-100 border border-white/20">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>{settings.complexName}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            ¡Hola, {activeUser.name}!
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            Resumen diario de reservas, ocupación de canchas y cobros en tiempo
            real.
          </p>
        </div>

        <button
          onClick={() => {
            onOpenNewBookingModal();
          }}
          className="relative z-10 px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 flex items-center gap-2.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-blue-600" />
          <span>Nueva Reserva Rápida</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Reservas de Hoy
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {todayBookings.length}
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              {totalCancellationsToday > 0
                ? `${totalCancellationsToday} canceladas hoy`
                : "0 cancelaciones hoy"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Ingresos de Hoy
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatAdminPrice(todayRevenue)}
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              Caja acumulada del día
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Canchas Habilitadas
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {activeCourts} / {courts.length}
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              Disponibles para turnos
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Lista de Espera
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {activeWaitlist}
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              Clientes aguardando turno
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule + Active Waitlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Schedule */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Próximos Turnos de Hoy ({today})
              </h3>
              <p className="text-xs text-slate-500">
                Agenda ordenada por hora de inicio
              </p>
            </div>
            <button
              onClick={() => onNavigate("calendar")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 flex items-center gap-1"
            >
              Ver Calendario Completo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No hay turnos registrados para el día de hoy.
              </div>
            ) : (
              todayBookings.map((b) => {
                const court = courts.find((c) => c.id === b.courtId);
                const waLink = createWhatsAppConfirmationLink({
                  customerName: b.customerName,
                  customerWhatsApp: b.customerWhatsApp,
                  courtName: court?.name || "Cancha",
                  date: b.date,
                  startTime: b.startTime,
                  endTime: b.endTime,
                  complexName: settings.complexName,
                  totalPrice: b.totalPrice,
                  settings,
                });

                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0 text-center">
                        {b.startTime} hs
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {b.customerName}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              b.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {b.status === "CONFIRMED"
                              ? "Confirmado"
                              : "Reservado"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {court?.name} • {formatAdminPrice(b.totalPrice)} (
                          {b.payment.status === "PAID"
                            ? "Pagado"
                            : b.payment.status === "DEPOSIT"
                              ? "Seña abonada"
                              : "Pendiente"}
                          )
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      {onSelectBookingToEdit && (
                        <button
                          onClick={() => onSelectBookingToEdit(b)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                        >
                          Editar
                        </button>
                      )}

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                        title="Enviar confirmación por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>

                      {onSelectBookingToCancel && (
                        <button
                          onClick={() => onSelectBookingToCancel(b.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                      )}

                      <button
                        onClick={() => setBookingToDelete(b)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold"
                        title="Eliminar reserva del sistema"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (1 col): Waitlist Quick View & Shortcuts */}
        <div className="space-y-6">
          {/* Waitlist Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Lista de Espera
              </h3>
              <button
                onClick={() => onNavigate("waitlist")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver Todo
              </button>
            </div>

            <div className="space-y-3">
              {waitlist.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Sin clientes en lista de espera.
                </div>
              ) : (
                waitlist.slice(0, 4).map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>{w.customerName}</span>
                      <span className="text-amber-600 dark:text-amber-400">
                        Prioridad #{w.priority}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {w.courtName} • {w.preferredDate} ({w.preferredTimeSlot})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Acceso Rápido
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate("courts")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-semibold text-slate-800 dark:text-slate-200"
              >
                🏆 Gestionar Canchas
              </button>
              <button
                onClick={() => onNavigate("customers")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-semibold text-slate-800 dark:text-slate-200"
              >
                👥 Clientes CRM
              </button>
              <button
                onClick={() => onNavigate("reports")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-semibold text-slate-800 dark:text-slate-200"
              >
                📊 Reportes Excel
              </button>
              <button
                onClick={() => onNavigate("settings")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-semibold text-slate-800 dark:text-slate-200"
              >
                ⚙️ Configuración
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Confirm Delete Booking */}
      {bookingToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  ¿Eliminar Reserva?
                </h3>
                <p className="text-[11px] text-slate-500">Acción irreversible</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              ¿Estás seguro de que deseas eliminar permanentemente la reserva de{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {bookingToDelete.customerName}
              </span>{" "}
              ({bookingToDelete.startTime} - {bookingToDelete.endTime})?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setBookingToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBooking(bookingToDelete.id);
                  setBookingToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
