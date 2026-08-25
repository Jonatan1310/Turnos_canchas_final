import React, { useState } from "react";
import {
  Clock,
  Plus,
  Send,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { createWhatsAppWaitlistAlertLink } from "../../lib/whatsapp";
import { WaitlistEntry } from "../../types";

export const WaitlistManagement: React.FC = () => {
  const {
    waitlist,
    courts,
    customers,
    addToWaitlist,
    updateWaitlistEntry,
    removeFromWaitlist,
    notifyWaitlistEntry,
    settings,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WaitlistEntry | null>(null);

  const [courtId, setCourtId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [preferredDate, setPreferredDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("20:00 - 21:00");
  const [notes, setNotes] = useState("");

  const openCreateModal = () => {
    setEditingEntry(null);
    setCourtId(courts[0]?.id || "");
    setCustomerId(customers[0]?.id || "");
    setPreferredDate(new Date().toISOString().split("T")[0]);
    setPreferredTimeSlot("20:00 - 21:00");
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (entry: WaitlistEntry) => {
    setEditingEntry(entry);
    setCourtId(entry.courtId);
    setCustomerId(entry.customerId);
    setPreferredDate(entry.preferredDate);
    setPreferredTimeSlot(entry.preferredTimeSlot);
    setNotes(entry.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find((c) => c.id === courtId);
    const customer = customers.find((c) => c.id === customerId);

    if (!court) return;

    if (editingEntry) {
      updateWaitlistEntry(editingEntry.id, {
        courtId: court.id,
        courtName: court.name,
        customerId: customer ? customer.id : editingEntry.customerId,
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`
          : editingEntry.customerName,
        customerPhone: customer ? customer.phone : editingEntry.customerPhone,
        customerWhatsApp: customer
          ? customer.whatsapp
          : editingEntry.customerWhatsApp,
        preferredDate,
        preferredTimeSlot,
        notes,
      });
    } else {
      if (!customer) return;
      addToWaitlist({
        courtId: court.id,
        courtName: court.name,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerPhone: customer.phone,
        customerWhatsApp: customer.whatsapp,
        preferredDate,
        preferredTimeSlot,
        notes,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Lista de Espera Inteligente
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Si se cancela un turno ocupado, el sistema notifica automáticamente
            al primero en cola.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Anotar en Lista de Espera</span>
        </button>
      </div>

      {/* Waitlist Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Prioridad</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Cancha</th>
                <th className="p-4">Fecha & Horario</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {waitlist.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No hay clientes agendados en la lista de espera.
                  </td>
                </tr>
              ) : (
                waitlist.map((entry) => {
                  const waLink = createWhatsAppWaitlistAlertLink({
                    customerName: entry.customerName,
                    customerWhatsApp: entry.customerWhatsApp,
                    courtName: entry.courtName,
                    date: entry.preferredDate,
                    startTime:
                      entry.preferredTimeSlot.split(" - ")[0] || "20:00",
                    endTime: entry.preferredTimeSlot.split(" - ")[1] || "21:00",
                    complexName: settings.complexName,
                    settings,
                  });

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-4 font-extrabold text-amber-600">
                        #{entry.priority}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {entry.customerName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {entry.customerPhone}
                        </p>
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                        {entry.courtName}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        📅 {entry.preferredDate} ({entry.preferredTimeSlot})
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            entry.status === "NOTIFIED"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {entry.status === "NOTIFIED"
                            ? "Aviso Enviado"
                            : "En Espera"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => notifyWaitlistEntry(entry.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Avisar Turno Libre</span>
                        </a>

                        <button
                          onClick={() => openEditModal(entry)}
                          className="inline-flex p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Editar Registro"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => removeFromWaitlist(entry.id)}
                          className="inline-flex p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                          title="Quitar de Lista"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal: Add/Edit Waitlist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingEntry
                ? "Editar Lista de Espera"
                : "Anotar en Lista de Espera"}
            </h3>

            <form onSubmit={handleSaveWaitlist} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Cancha Deseada
                </label>
                <select
                  value={courtId}
                  onChange={(e) => setCourtId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  required
                >
                  <option value="">Selecciona una cancha...</option>
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Cliente
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  required
                >
                  <option value="">Selecciona un cliente...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Fecha Deseada
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Rango Horario Preferido
                </label>
                <input
                  type="text"
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  placeholder="Ej. 20:00 a 22:00"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Notas Opcionales
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Avisar urgente por WhatsApp"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold"
                >
                  Guardar en Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
