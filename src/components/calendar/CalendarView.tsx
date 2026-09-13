import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  MessageCircle,
  MoreVertical,
  Copy,
  Repeat,
  XCircle,
  Move,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Booking, Court } from "../../types";
import { createWhatsAppConfirmationLink } from "../../lib/whatsapp";

interface CalendarViewProps {
  onOpenNewBookingModal: (
    initialCourtId?: string,
    initialDate?: string,
    initialStartTime?: string,
  ) => void;
  onSelectBookingToEdit: (booking: Booking) => void;
  onSelectBookingToCancel: (bookingId: string) => void;
}

type ViewMode = "agenda" | "daily" | "weekly" | "monthly";

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenNewBookingModal,
  onSelectBookingToEdit,
  onSelectBookingToCancel,
}) => {
  const {
    courts,
    courtTypes,
    bookings,
    settings,
    moveBooking,
    duplicateBooking,
    deleteBooking,
    activeUser,
    formatPrice,
  } = useApp();

  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [viewMode, setViewMode] = useState<ViewMode>("agenda");
  const [selectedSportId, setSelectedSportId] = useState<string>("ALL");

  // Move Modal State
  const [movingBooking, setMovingBooking] = useState<Booking | null>(null);
  const [moveCourtId, setMoveCourtId] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [moveStartTime, setMoveStartTime] = useState("");
  const [moveError, setMoveError] = useState("");

  // Date Navigation Helpers
  const handleDateOffset = (offsetDays: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Filter Courts by Sport
  const filteredCourts =
    selectedSportId === "ALL"
      ? courts.filter((c) => c.isActive)
      : courts.filter((c) => c.isActive && c.typeId === selectedSportId);

  // Time Slots Generation (e.g. 08:00 to 23:00)
  const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8 to 23

  // Status Styling Helper
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-600 border-emerald-700 text-white shadow-emerald-600/20";
      case "RESERVED":
        return "bg-amber-500 border-amber-600 text-white shadow-amber-500/20";
      case "CANCELLED":
        return "bg-slate-400 border-slate-500 text-white opacity-60 line-through";
      case "FINISHED":
        return "bg-blue-600 border-blue-700 text-white shadow-blue-600/20";
      default:
        return "bg-blue-500 border-blue-600 text-white";
    }
  };

  // Open Move Modal
  const handleOpenMoveModal = (b: Booking) => {
    setMovingBooking(b);
    setMoveCourtId(b.courtId);
    setMoveDate(b.date);
    setMoveStartTime(b.startTime);
    setMoveError("");
  };

  const handleConfirmMove = () => {
    if (!movingBooking) return;
    const res = moveBooking(
      movingBooking.id,
      moveCourtId,
      moveDate,
      moveStartTime,
    );
    if (!res.success) {
      setMoveError(res.message);
    } else {
      setMovingBooking(null);
    }
  };

  const handleQuickDuplicate = (b: Booking) => {
    const res = duplicateBooking(b.id, b.date, b.startTime);
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleTodayClick}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Hoy
          </button>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleDateOffset(-1)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Día Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleDateOffset(1)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Día Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode & Sport Filter */}
        <div className="flex items-center space-x-3 overflow-x-auto">
          {/* Sport Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1 border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select
              value={selectedSportId}
              onChange={(e) => setSelectedSportId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los deportes</option>
              {courtTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggles */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === "agenda"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setViewMode("daily")}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === "daily"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === "weekly"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>{" "}
          Confirmado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>{" "}
          Pendiente / Reservado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>{" "}
          Finalizado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>{" "}
          Cancelado
        </span>
      </div>

      {/* Main Schedule Display (Resource Grid Agenda View) */}
      {viewMode === "agenda" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row: Courts Columns */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 sticky top-0 z-10">
                <div className="w-20 p-3 text-center text-xs font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800 shrink-0">
                  Hora
                </div>
                <div className="flex flex-1">
                  {filteredCourts.map((court) => (
                    <div
                      key={court.id}
                      className="flex-1 p-3 text-center border-r border-slate-200 dark:border-slate-800 min-w-[180px] last:border-r-0"
                    >
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {court.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {court.typeName} •{" "}
                        {formatPrice(court.pricePerHour, 'admin')}/h
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Rows: Hours */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {hours.map((hour) => {
                  const timeString = `${String(hour).padStart(2, "0")}:00`;
                  return (
                    <div key={hour} className="flex min-h-[72px]">
                      {/* Hour Column */}
                      <div className="w-20 p-2 text-center text-xs font-semibold text-slate-400 border-r border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/30 dark:bg-slate-900/40">
                        {timeString}
                      </div>

                      {/* Court Columns Slots */}
                      <div className="flex flex-1">
                        {filteredCourts.map((court) => {
                          const courtBookings = bookings.filter(
                            (b) =>
                              b.courtId === court.id &&
                              b.date === selectedDate &&
                              b.startTime.startsWith(
                                String(hour).padStart(2, "0"),
                              ),
                          );

                          return (
                            <div
                              key={court.id}
                              className="flex-1 border-r border-slate-100 dark:border-slate-800/60 p-1.5 min-w-[180px] last:border-r-0 relative group hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors"
                            >
                              {courtBookings.length === 0 ? (
                                <button
                                  onClick={() => {
                                    onOpenNewBookingModal(
                                      court.id,
                                      selectedDate,
                                      timeString,
                                    );
                                  }}
                                  className="w-full h-full min-h-[50px] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-slate-300 dark:text-slate-700 hover:text-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs font-semibold gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Reservar</span>
                                </button>
                              ) : (
                                courtBookings.map((b) => {
                                  const waLink = createWhatsAppConfirmationLink(
                                    {
                                      customerName: b.customerName,
                                      customerWhatsApp: b.customerWhatsApp,
                                      courtName: court.name,
                                      date: b.date,
                                      startTime: b.startTime,
                                      endTime: b.endTime,
                                      complexName: settings.complexName,
                                      totalPrice: b.totalPrice,
                                      settings,
                                    },
                                  );

                                  return (
                                    <div
                                      key={b.id}
                                      className={`p-2.5 rounded-xl border shadow-xs transition-all ${getStatusStyle(b.status)}`}
                                    >
                                      <div className="flex items-start justify-between gap-1">
                                        <p className="font-bold text-xs truncate leading-tight">
                                          {b.customerName}
                                        </p>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                                            title="Enviar WhatsApp"
                                          >
                                            <Send className="w-3 h-3" />
                                          </a>
                                          <button
                                            onClick={() =>
                                              onSelectBookingToEdit(b)
                                            }
                                            className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors text-[10px] font-semibold"
                                            title="Editar / Ver"
                                          >
                                            Editar
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between text-[11px] opacity-90 mt-1">
                                        <span>
                                          ⏰ {b.startTime} - {b.endTime}
                                        </span>
                                        <span className="font-extrabold">
                                          {formatPrice(b.totalPrice, 'admin')}
                                        </span>
                                      </div>

                                      {/* Quick Actions Row */}
                                      <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[10px]">
                                        <button
                                          onClick={() => handleOpenMoveModal(b)}
                                          className="flex items-center gap-0.5 hover:underline"
                                        >
                                          <Move className="w-3 h-3" /> Mover
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleQuickDuplicate(b)
                                          }
                                          className="flex items-center gap-0.5 hover:underline"
                                        >
                                          <Copy className="w-3 h-3" /> Duplicar
                                        </button>
                                        {b.status !== "CANCELLED" && (
                                          <button
                                            onClick={() =>
                                              onSelectBookingToCancel(b.id)
                                            }
                                            className="flex items-center gap-0.5 text-rose-200 hover:text-white hover:underline"
                                          >
                                            Cancelar
                                          </button>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setBookingToDelete(b);
                                          }}
                                          className="flex items-center gap-0.5 text-rose-200 hover:text-white hover:underline"
                                          title="Eliminar reserva permanentemente"
                                        >
                                          <Trash2 className="w-3 h-3" /> Eliminar
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily List View */}
      {viewMode === "daily" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Listado de Turnos del {selectedDate}
          </h3>

          <div className="space-y-3">
            {bookings.filter((b) => b.date === selectedDate).length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No hay turnos registrados para esta fecha.
              </div>
            ) : (
              bookings
                .filter((b) => b.date === selectedDate)
                .map((b) => {
                  const court = courts.find((c) => c.id === b.courtId);
                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {b.customerName}
                          </span>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                              b.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-700"
                                : b.status === "CANCELLED"
                                  ? "bg-slate-200 text-slate-600"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          🏟️ {court?.name} • ⏰ {b.startTime} - {b.endTime} hs •
                          💰 {formatPrice(b.totalPrice, 'admin')}
                        </p>
                        {b.notes && (
                          <p className="text-xs italic text-slate-400 mt-0.5">
                            &quot;{b.notes}&quot;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectBookingToEdit(b)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Editar
                        </button>
                        {b.status !== "CANCELLED" && (
                          <button
                            onClick={() => onSelectBookingToCancel(b.id)}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          onClick={() => setBookingToDelete(b)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                          title="Eliminar reserva"
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
      )}

      {/* Weekly View */}
      {viewMode === "weekly" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
            Resumen Semanal de Ocupación
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Vista compacta de turnos agendados durante los próximos 7 días a
            partir de {selectedDate}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(selectedDate + "T12:00:00");
              d.setDate(d.getDate() + i);
              const dateStr = d.toISOString().split("T")[0];
              const dayName = d.toLocaleDateString("es-ES", {
                weekday: "short",
                day: "numeric",
                month: "numeric",
              });
              const dayBookings = bookings.filter(
                (b) => b.date === dateStr && b.status !== "CANCELLED",
              );

              return (
                <div
                  key={dateStr}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 min-h-[160px] flex flex-col justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white capitalize mb-2 border-b pb-1 border-slate-200 dark:border-slate-700">
                      {dayName}
                    </p>
                    <div className="space-y-1">
                      {dayBookings.slice(0, 4).map((b) => (
                        <button
                          key={b.id}
                          onClick={() => onSelectBookingToEdit(b)}
                          className="w-full text-left p-1.5 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-[10px] text-blue-900 dark:text-blue-200 truncate cursor-pointer transition-colors block"
                          title={`Editar reserva de ${b.customerName}`}
                        >
                          {b.startTime} - {b.customerName}
                        </button>
                      ))}
                      {dayBookings.length > 4 && (
                        <p className="text-[10px] text-slate-400 font-semibold">
                          + {dayBookings.length - 4} más
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setViewMode("agenda");
                    }}
                    className="mt-3 text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    Ver día →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Move Booking Modal */}
      {movingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Move className="w-5 h-5 text-blue-600" />
              Mover / Reprogramar Reserva
            </h3>
            <p className="text-xs text-slate-500">
              Cliente: <strong>{movingBooking.customerName}</strong>
            </p>

            {moveError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {moveError}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Cancha Destino
                </label>
                <select
                  value={moveCourtId}
                  onChange={(e) => setMoveCourtId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nueva Fecha
                </label>
                <input
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nueva Hora Inicio
                </label>
                <input
                  type="time"
                  step="1800"
                  value={moveStartTime}
                  onChange={(e) => setMoveStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setMovingBooking(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmMove}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Mover Reserva
              </button>
            </div>
          </div>
        </div>
      )}

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
