import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  MessageSquare,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Booking } from "../../types";
import { createWhatsAppCancellationLink } from "../../lib/whatsapp";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { cancelBooking, settings, courts, activeUser, formatPrice } = useApp();
  const [reason, setReason] = useState("Problema personal del cliente");
  const [customReason, setCustomReason] = useState("");
  const [cancelledResult, setCancelledResult] = useState<{
    success: boolean;
    notifiedWaitlistCount: number;
  } | null>(null);

  if (!isOpen || !booking) return null;

  const court = courts.find((c) => c.id === booking.courtId);
  const finalReason = reason === "Otra razón" ? customReason : reason;

  const handleConfirmCancel = () => {
    const res = cancelBooking(
      booking.id,
      finalReason || "Sin motivo especificado",
    );
    setCancelledResult(res);
  };

  const whatsappLink = createWhatsAppCancellationLink({
    customerName: booking.customerName,
    customerWhatsApp: booking.customerWhatsApp,
    courtName: court?.name || "Cancha",
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    complexName: settings.complexName,
    cancellationReason: finalReason,
    settings,
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base font-bold">Cancelar Reserva</h2>
          </div>
          <button
            onClick={() => {
              setCancelledResult(null);
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!cancelledResult ? (
            <>
              {/* Info summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">
                  {booking.customerName} - {court?.name}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  📅 {booking.date} a las {booking.startTime} hs (
                  {booking.durationMinutes} min)
                </p>
                <p className="text-slate-500">
                  Monto: {formatPrice(booking.totalPrice, 'admin')}
                </p>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo de la Cancelación
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Problema personal del cliente">
                    Problema personal del cliente
                  </option>
                  <option value="Lluvia / Inclemencia climática">
                    Lluvia / Inclemencia climática
                  </option>
                  <option value="Cancha fuera de servicio por mantenimiento">
                    Cancha fuera de servicio
                  </option>
                  <option value="Falta de pago / Seña vencida">
                    Falta de pago de seña
                  </option>
                  <option value="Otra razón">Otra razón (Especificar)</option>
                </select>
              </div>

              {reason === "Otra razón" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Escribir Motivo Detallado
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Escribí la razón..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-snug">
                Al cancelar, el horario quedará inmediatamente{" "}
                <strong>disponible</strong> en el calendario para otros
                clientes.
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20"
                >
                  Confirmar Cancelación
                </button>
              </div>
            </>
          ) : (
            /* Result view */
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Reserva Cancelada con Éxito
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  El horario ha sido liberado en el calendario.
                </p>
                {cancelledResult.notifiedWaitlistCount > 0 && (
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-950/40 p-2 rounded-lg border border-blue-200 dark:border-blue-800">
                    🎉 ¡Se activó la Lista de Espera! Se envió aviso al primer
                    cliente interesado.
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Aviso por WhatsApp al Cliente</span>
                </a>

                <button
                  onClick={() => {
                    setCancelledResult(null);
                    onClose();
                  }}
                  className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
