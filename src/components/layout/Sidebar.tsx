import React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Trophy,
  Users,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  History,
  X,
  PlusCircle,
  Smartphone,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export type ActiveTab =
  | "dashboard"
  | "calendar"
  | "courts"
  | "customers"
  | "waitlist"
  | "payments"
  | "reports"
  | "settings"
  | "audit"
  | "public_portal"
  | "superadmin";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenNewBookingModal: () => void;
  onOpenSuperAdminLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenNewBookingModal,
  onOpenSuperAdminLogin,
}) => {
  const {
    waitlist,
    notifications,
    activeUser,
    settings,
    license,
    isLicenseActive,
    remainingLicenseDays,
    isSuperAdmin,
  } = useApp();

  const waitingCount = waitlist.filter((w) => w.status === "WAITING").length;

  const navItems = [
    { id: "dashboard", label: "Panel Principal", icon: LayoutDashboard },
    { id: "calendar", label: "Calendario / Agenda", icon: CalendarDays },
    { id: "courts", label: "Canchas & Deportes", icon: Trophy },
    { id: "customers", label: "Clientes (CRM)", icon: Users },
    {
      id: "waitlist",
      label: "Lista de Espera",
      icon: Clock,
      badge: waitingCount,
    },
    { id: "payments", label: "Pagos & Cobros", icon: DollarSign },
    { id: "reports", label: "Reportes & Exportar", icon: BarChart3 },
    {
      id: "public_portal",
      label: "Portal de Clientes",
      icon: Globe,
      isPublicPortal: true,
      badgeText: "Público 24/7",
    },
    { id: "settings", label: "Configuración", icon: Settings },
    { id: "audit", label: "Auditoría & Logs", icon: History },
  ];

  // Close on ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-300 animate-in fade-in"
          id="sidebar-backdrop"
        />
      )}

      {/* Sliding Drawer Sidebar */}
      <aside
        id="app-sidebar-drawer"
        className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-slate-900 text-slate-100 border-r border-slate-800/80 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.complexName}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30 bg-white dark:bg-slate-800"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-600/20">
                {settings.complexName
                  ? settings.complexName.substring(0, 2).toUpperCase()
                  : "RM"}
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold text-white text-sm block truncate max-w-[160px]">
                {settings.complexName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Navegación & Menú
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            title="Cerrar Menú (Esc)"
            id="btn-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onOpenNewBookingModal();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-[1.01] active:scale-[0.98] ring-1 ring-white/10 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Reserva</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-2xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-blue-400"
                        : item.id === "superadmin"
                        ? "text-amber-400"
                        : item.id === "public_portal"
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  />
                  <span
                    className={
                      item.id === "superadmin"
                        ? "text-slate-200 font-bold"
                        : item.id === "public_portal"
                        ? "text-emerald-300 font-bold"
                        : ""
                    }
                  >
                    {item.label}
                  </span>
                </div>
                {item.badgeText ? (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.badgeText}
                  </span>
                ) : item.badge !== undefined && typeof item.badge === "number" && item.badge > 0 ? (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* PWA Badge & Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          {/* SuperAdmin Access Button (Shown only when NOT logged in as SuperAdmin) */}
          {!isSuperAdmin && onOpenSuperAdminLogin && (
            <button
              type="button"
              onClick={() => {
                onOpenSuperAdminLogin();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-indigo-950/40 text-slate-400 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer group"
              title="Ingreso de Super Administrador con usuario y contraseña"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                <span>Acceso SuperAdmin</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 group-hover:text-indigo-400">
                Login
              </span>
            </button>
          )}

          <div className="flex items-center space-x-3 text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800/60">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="leading-tight">
              <p className="font-bold text-slate-300">PWA Instalable</p>
              <p className="text-[10px] font-medium text-slate-500">
                Android & iPhone listo
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
