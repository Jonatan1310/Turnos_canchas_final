import React, { useState } from "react";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  Filter,
  ExternalLink,
  ArrowUpRight,
  Edit2,
  Trash2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { PaymentStatus, PaymentMethod, Booking } from "../../types";

export const PaymentManagement: React.FC = () => {
  const { bookings, updateBookingPayment, deleteBooking, courts, settings, formatPrice } =
    useApp();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Edit Payment Modal State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState<PaymentStatus>("PENDING");
  const [editMethod, setEditMethod] = useState<PaymentMethod>("CASH");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editTxId, setEditTxId] = useState<string>("");

  const openEditPaymentModal = (b: Booking) => {
    setEditingBooking(b);
    setEditStatus(b.payment.status);
    setEditMethod(b.payment.method);
    setEditAmount(b.payment.amount);
    setEditTxId(b.payment.transactionId || "");
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    updateBookingPayment(
      editingBooking.id,
      editStatus,
      editMethod,
      Number(editAmount),
      editTxId.trim() || undefined,
    );
    setEditingBooking(null);
  };

  const filteredBookings =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((b) => b.payment.status === statusFilter);

  // Financial Metrics
  const totalPaid = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce(
      (sum, b) =>
        sum + (b.payment.status === "PAID" ? b.totalPrice : b.payment.amount),
      0,
    );

  const totalPending = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce(
      (sum, b) =>
        sum +
        (b.payment.status === "PENDING"
          ? b.totalPrice
          : b.totalPrice - b.payment.amount),
      0,
    );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Control de Pagos, Cobros y Mercado Pago
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Administración de señas, pagos completos, transferencias y enlaces
            de pago.
          </p>
        </div>

        {/* Financial KPI Chips */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50">
            <span className="text-emerald-700 dark:text-emerald-300 font-medium block">
              Total Ingresado
            </span>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
              {formatPrice(totalPaid, 'admin')}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50">
            <span className="text-amber-700 dark:text-amber-300 font-medium block">
              Por Cobrar
            </span>
            <span className="text-lg font-black text-amber-700 dark:text-amber-300">
              {formatPrice(totalPending, 'admin')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-2">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Filtrar por Pago:
        </span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
        >
          <option value="ALL">Todos los estados</option>
          <option value="PAID">Pagados Total</option>
          <option value="DEPOSIT">Seña Abonada</option>
          <option value="PENDING">Pendientes</option>
          <option value="REFUNDED">Devueltos / Reembolsados</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Cancha & Fecha</th>
                <th className="p-4">Monto Total</th>
                <th className="p-4">Monto Cobrado</th>
                <th className="p-4">Método</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Cambiar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No hay registros de pago en este filtro.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const court = courts.find((c) => c.id === b.courtId);
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {b.customerName}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {court?.name} • {b.date} ({b.startTime} hs)
                      </td>
                      <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(b.totalPrice, 'admin')}
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        {formatPrice(b.payment.amount, 'admin')}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-[10px]">
                          {b.payment.method === "MERCADO_PAGO"
                            ? "Mercado Pago"
                            : b.payment.method === "TRANSFER"
                              ? "Transferencia"
                              : b.payment.method === "CASH"
                                ? "Efectivo"
                                : "Tarjeta"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            b.payment.status === "PAID"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : b.payment.status === "DEPOSIT"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : b.payment.status === "REFUNDED"
                                  ? "bg-slate-200 text-slate-600"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {b.payment.status === "PAID"
                            ? "PAGADO TOTAL"
                            : b.payment.status === "DEPOSIT"
                              ? "SEÑA ABONADA"
                              : b.payment.status === "REFUNDED"
                                ? "DEVUELTO"
                                : "PENDIENTE"}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end space-x-1.5">
                        {b.payment.status !== "PAID" && (
                          <button
                            onClick={() =>
                              updateBookingPayment(
                                b.id,
                                "PAID",
                                b.payment.method,
                                b.totalPrice,
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px]"
                          >
                            Marcar Pagado
                          </button>
                        )}
                        {b.payment.status === "PENDING" && (
                          <button
                            onClick={() =>
                              updateBookingPayment(
                                b.id,
                                "DEPOSIT",
                                b.payment.method,
                                b.totalPrice *
                                  (settings.depositPercentage / 100),
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[10px]"
                          >
                            Marcar Seña
                          </button>
                        )}
                        {b.payment.status === "PAID" && (
                          <button
                            onClick={() =>
                              updateBookingPayment(
                                b.id,
                                "REFUNDED",
                                b.payment.method,
                                0,
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-[10px]"
                          >
                            Reembolsar
                          </button>
                        )}

                        <button
                          onClick={() => openEditPaymentModal(b)}
                          className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Editar Pago"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setPaymentToDelete(b)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Eliminar Registro de Pago"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Payment */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Editar Estado de Pago
            </h3>
            <p className="text-xs text-slate-500">
              Cliente:{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {editingBooking.customerName}
              </span>{" "}
              (Reserva #{editingBooking.id})
            </p>

            <form onSubmit={handleSavePayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Estado del Pago
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as PaymentStatus)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold"
                >
                  <option value="PAID">Pagado Total</option>
                  <option value="DEPOSIT">Seña Abonada</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="REFUNDED">Devuelto / Reembolsado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Método de Pago
                </label>
                <select
                  value={editMethod}
                  onChange={(e) =>
                    setEditMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  <option value="CASH">Efectivo</option>
                  <option value="MERCADO_PAGO">Mercado Pago</option>
                  <option value="TRANSFER">Transferencia Bancaria</option>
                  <option value="CARD">Tarjeta de Débito/Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Monto Cobrado / Abonado ($)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
                  min={0}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  ID de Transacción / Comprobante (Opcional)
                </label>
                <input
                  type="text"
                  value={editTxId}
                  onChange={(e) => setEditTxId(e.target.value)}
                  placeholder="Ej. MP-948271049"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Guardar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Payment Record */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              ¿Eliminar Registro de Pago?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              ¿Deseas eliminar permanentemente la reserva/cobro de{" "}
              <span className="font-bold">{paymentToDelete.customerName}</span>{" "}
              (${paymentToDelete.totalPrice})?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBooking(paymentToDelete.id);
                  setPaymentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
