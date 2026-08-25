import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  User,
  Shield,
  X,
  ArrowRight,
  Phone,
  Clock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface GlobalSearchModalProps {
  onSelectBooking?: (bookingId: string) => void;
  onSelectCustomer?: (customerId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  onSelectBooking,
  onSelectCustomer,
}) => {
  const { searchOpen, setSearchOpen, bookings, customers, courts, formatPrice } = useApp();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchedCustomers = cleanQuery
    ? customers
        .filter(
          (c) =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(cleanQuery) ||
            c.phone.includes(cleanQuery) ||
            c.whatsapp.includes(cleanQuery) ||
            (c.email && c.email.toLowerCase().includes(cleanQuery)),
        )
        .slice(0, 5)
    : [];

  const matchedBookings = cleanQuery
    ? bookings
        .filter((b) => {
          const court = courts.find((c) => c.id === b.courtId);
          return (
            b.customerName.toLowerCase().includes(cleanQuery) ||
            b.customerPhone.includes(cleanQuery) ||
            b.date.includes(cleanQuery) ||
            (court && court.name.toLowerCase().includes(cleanQuery))
          );
        })
        .slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, teléfono, cancha o fecha (ej. 2026-08-01)..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base"
            autoFocus
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!cleanQuery && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p>
                Escribí un nombre, número de WhatsApp o fecha para buscar en el
                sistema.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                  ESC
                </span>{" "}
                cerrar
              </div>
            </div>
          )}

          {cleanQuery &&
            matchedCustomers.length === 0 &&
            matchedBookings.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-sm">
                No se encontraron coincidencias para &quot;{query}&quot;
              </div>
            )}

          {/* Customers Section */}
          {matchedCustomers.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Clientes (
                {matchedCustomers.length})
              </div>
              <div className="space-y-1">
                {matchedCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      if (onSelectCustomer) onSelectCustomer(cust.id);
                      setSearchOpen(false);
                    }}
                    className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {cust.firstName} {cust.lastName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {cust.phone}
                        </span>
                        <span>• {cust.totalBookings} reservas</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings Section */}
          {matchedBookings.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Reservas (
                {matchedBookings.length})
              </div>
              <div className="space-y-1">
                {matchedBookings.map((book) => {
                  const court = courts.find((c) => c.id === book.courtId);
                  return (
                    <div
                      key={book.id}
                      onClick={() => {
                        if (onSelectBooking) onSelectBooking(book.id);
                        setSearchOpen(false);
                      }}
                      className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {book.customerName}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              book.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : book.status === "CANCELLED"
                                  ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {book.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{court?.name || "Cancha"}</span>
                          <span>• {book.date}</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {book.startTime} hs
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {formatPrice(book.totalPrice, 'admin')}
                          </span>
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
