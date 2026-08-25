import React, { useState } from "react";
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  AlertTriangle,
  Calendar,
  Plus,
  History,
  Trash2,
  Edit2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Customer } from "../../types";
import { cleanPhoneForWhatsApp } from "../../lib/whatsapp";

export const CustomerManagement: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    bookings,
    courts,
    settings,
    formatPrice,
    getPublicPortalUrl,
  } = useApp();
  const [query, setQuery] = useState("");

  // Selected customer for viewing history modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // New / Edit Customer Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const openCreateCustomerModal = () => {
    setEditingCustomer(null);
    setFirstName("");
    setLastName("");
    setPhone("");
    setWhatsapp("");
    setEmail("");
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditCustomerModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFirstName(cust.firstName);
    setLastName(cust.lastName);
    setPhone(cust.phone);
    setWhatsapp(cust.whatsapp);
    setEmail(cust.email || "");
    setNotes(cust.notes || "");
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter((c) => {
    const q = query.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.whatsapp.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim().replace(/\D/g, ""),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addCustomer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim().replace(/\D/g, ""),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setFirstName("");
    setLastName("");
    setPhone("");
    setWhatsapp("");
    setEmail("");
    setNotes("");
    setEditingCustomer(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Gestión de Clientes (CRM)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Historial de reservas, comportamiento, tasa de asistencias y avisos.
          </p>
        </div>

        <button
          onClick={openCreateCustomerModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, apellido, teléfono o WhatsApp..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Reservas Totales</th>
                <th className="p-4">Cancelaciones</th>
                <th className="p-4">Última Reserva</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const hasHighCancellations = cust.totalCancellations >= 2;
                  const waClean = cleanPhoneForWhatsApp(cust.whatsapp || cust.phone);
                  const waMessage = `Hola *${cust.firstName}*! 👋 Te contactamos desde *${settings.complexName}* 🏟️.\n\nPodés ingresar a nuestro portal de reservas en línea:\n👉 ${getPublicPortalUrl()}\n\n¿En qué podemos ayudarte? ⚽🎾`;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                            {cust.firstName[0]}
                            {cust.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {cust.firstName} {cust.lastName}
                            </p>
                            {cust.notes && (
                              <p className="text-[10px] text-slate-400 italic">
                                {cust.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {cust.phone}
                        </p>
                        {cust.email && (
                          <p className="text-[10px] text-slate-400">
                            {cust.email}
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {cust.totalBookings} turnos
                        </span>
                      </td>

                      <td className="p-4">
                        {hasHighCancellations ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]"
                            title="Cliente con alto historial de cancelaciones"
                          >
                            <AlertTriangle className="w-3 h-3" />{" "}
                            {cust.totalCancellations} cancelaciones
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">
                            {cust.totalCancellations}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {cust.lastBookingDate || "Sin registro"}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <a
                          href={
                            waClean
                              ? `https://wa.me/${waClean}?text=${encodeURIComponent(waMessage)}`
                              : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="inline-flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Ver Historial Completo"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditCustomerModal(cust)}
                          className="inline-flex p-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Editar Cliente"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setCustomerToDelete(cust)}
                          className="inline-flex p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Eliminar Cliente"
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

      {/* Modal: Customer Booking History */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Historial de {selectedCustomer.firstName}{" "}
                  {selectedCustomer.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCustomer.phone} • {selectedCustomer.totalBookings}{" "}
                  reservas totales
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-3 py-1 rounded-xl border text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>

            {/* Bookings for this customer */}
            <div className="space-y-3">
              {bookings.filter((b) => b.customerId === selectedCustomer.id)
                .length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Sin reservas encontradas para este cliente.
                </p>
              ) : (
                bookings
                  .filter((b) => b.customerId === selectedCustomer.id)
                  .map((b) => {
                    const court = courts.find((c) => c.id === b.courtId);
                    return (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {court?.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                          <p className="text-slate-500 mt-0.5">
                            📅 {b.date} • ⏰ {b.startTime} - {b.endTime} hs
                          </p>
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {formatPrice(b.totalPrice, 'admin')}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: New / Edit Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Teléfono / Celular *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (!whatsapp) setWhatsapp(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Email Opcional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
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
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Customer */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              ¿Eliminar Cliente?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="font-bold">
                {customerToDelete.firstName} {customerToDelete.lastName}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomer(customerToDelete.id);
                  setCustomerToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
