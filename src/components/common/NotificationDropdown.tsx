import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ActiveTab } from "../layout/Sidebar";
import { SystemNotification } from "../../types";

interface NotificationDropdownProps {
  onNavigate?: (tab: ActiveTab) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onNavigate,
}) => {
  const { notifications, markNotificationRead, clearAllNotifications } =
    useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTargetTab = (notif: SystemNotification): ActiveTab => {
    if (notif.link) {
      const validTabs: ActiveTab[] = [
        "dashboard",
        "calendar",
        "courts",
        "customers",
        "waitlist",
        "payments",
        "reports",
        "settings",
        "audit",
        "public_portal",
      ];
      if (validTabs.includes(notif.link as ActiveTab)) {
        return notif.link as ActiveTab;
      }
    }

    const text = `${notif.title} ${notif.message}`.toLowerCase();
    if (text.includes("espera")) return "waitlist";
    if (
      text.includes("pago") ||
      text.includes("seña") ||
      text.includes("cobro") ||
      text.includes("mercadopago") ||
      text.includes("transferencia")
    ) {
      return "payments";
    }
    if (text.includes("cliente")) return "customers";
    if (
      text.includes("deporte") ||
      text.includes("cancha agregada") ||
      text.includes("cancha eliminada")
    ) {
      return "courts";
    }
    if (
      text.includes("reserva") ||
      text.includes("turno") ||
      text.includes("cancha")
    ) {
      return "calendar";
    }
    if (
      text.includes("reporte") ||
      text.includes("balance") ||
      text.includes("estadística")
    ) {
      return "reports";
    }
    if (
      text.includes("configuracion") ||
      text.includes("configuración") ||
      text.includes("ajuste")
    ) {
      return "settings";
    }
    if (
      text.includes("auditoria") ||
      text.includes("auditoría") ||
      text.includes("log") ||
      text.includes("importación")
    ) {
      return "audit";
    }
    return "calendar";
  };

  const handleNotificationClick = (notif: SystemNotification) => {
    markNotificationRead(notif.id);
    setIsOpen(false);
    if (onNavigate) {
      const targetTab = getTargetTab(notif);
      onNavigate(targetTab);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "DANGER":
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No hay notificaciones recientes
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                    !notif.isRead ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-semibold ${!notif.isRead ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {notif.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
