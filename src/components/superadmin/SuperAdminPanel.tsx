import React, { useState } from "react";
import {
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  History,
  Activity,
  ArrowRight,
  Sparkles,
  Sliders,
  LogOut,
  Building2,
  Users,
  CalendarCheck,
  DollarSign,
  Info,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  Layers,
  Phone,
  Mail,
  MapPin,
  Check,
  ChevronRight,
  Filter,
  Globe,
  Share2,
  KeyRound,
  Copy,
  Send,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatLicenseDateTime, isLicenseActive, getRemainingDays } from "../../lib/license";
import { TenantComplex } from "../../types";
import { NewClientPanelModal } from "./NewClientPanelModal";
import { EditClientPanelModal } from "./EditClientPanelModal";
import { SuperAdminShareLinksModal } from "./SuperAdminShareLinksModal";
import { buildComplexAdminUrl, buildComplexPortalUrl } from "../../lib/slugify";

interface SuperAdminPanelProps {
  onClose?: () => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onClose }) => {
  const {
    complexes,
    activeComplexId,
    switchComplex,
    activateComplexLicense,
    toggleComplexLicense,
    deleteComplex,
    logoutSuperAdmin,
    formatPrice,
    addAuditLog,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "EXPIRING" | "EXPIRED">("ALL");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingComplex, setEditingComplex] = useState<TenantComplex | null>(null);
  const [sharingComplex, setSharingComplex] = useState<TenantComplex | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>("");
  const [copiedLinkInfo, setCopiedLinkInfo] = useState<{ id: string; type: "admin" | "portal" } | null>(null);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg("");
    }, 4000);
  };

  const handleDeleteClientComplex = (complex: TenantComplex, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (complexes.length <= 1) {
      alert("No se puede eliminar el único complejo existente.");
      return;
    }
    if (
      window.confirm(
        `¿Confirmas la eliminación permanente del complejo "${complex.name}" (Dueño: ${complex.ownerName})?\n\nSe eliminarán todas sus canchas, reservas y configuraciones asociadas.`
      )
    ) {
      const ok = deleteComplex(complex.id);
      if (ok) {
        showFeedback(`¡El panel de "${complex.name}" fue eliminado exitosamente!`);
      }
    }
  };

  const handleCopyLink = (complex: TenantComplex, type: "admin" | "portal", e: React.MouseEvent) => {
    e.stopPropagation();
    const url =
      type === "admin"
        ? buildComplexAdminUrl({
            complexName: complex.name,
            slug: complex.slug,
            customPortalUrl: complex.settings?.customPortalUrl,
            id: complex.id,
          })
        : buildComplexPortalUrl({
            complexName: complex.name,
            slug: complex.slug,
            customPortalUrl: complex.settings?.customPortalUrl,
            id: complex.id,
          });

    navigator.clipboard.writeText(url);
    setCopiedLinkInfo({ id: complex.id, type });
    showFeedback(
      type === "admin"
        ? `¡Enlace de Administrador copiado para "${complex.name}"!`
        : `¡Enlace de Portal de Clientes copiado para "${complex.name}"!`
    );
    setTimeout(() => {
      setCopiedLinkInfo(null);
    }, 2500);
  };

  const handleActivate30Days = (complex: TenantComplex, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    activateComplexLicense(complex.id, 30, "Renovación rápida mensual de +30 días");
    showFeedback(`¡Panel "${complex.name}" habilitado por +30 días adicionales con éxito!`);
  };

  const handleToggleStatus = (complex: TenantComplex, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = !complex.license?.isEnabled;
    toggleComplexLicense(complex.id, newStatus);
    showFeedback(
      newStatus
        ? `¡Panel "${complex.name}" activado y accesible!`
        : `Panel "${complex.name}" pausado/bloqueado temporalmente.`
    );
  };

  const handleAccessComplex = (complex: TenantComplex) => {
    switchComplex(complex.id);
    showFeedback(`Has ingresado al panel de administración de: ${complex.name}`);
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const handleActivateAll30Days = () => {
    if (
      window.confirm(
        `¿Deseas sumar 30 días de habilitación a TODOS los ${complexes.length} paneles de clientes registrados?`
      )
    ) {
      complexes.forEach((c) => {
        activateComplexLicense(c.id, 30, "Renovación masiva +30 días para todos los clientes");
      });
      showFeedback(`¡Se sumaron +30 días a todos los ${complexes.length} paneles de clientes!`);
    }
  };

  // Metrics Calculations across all complexes
  const totalComplexes = complexes.length;
  const activeComplexesCount = complexes.filter((c) => isLicenseActive(c.license)).length;
  const totalCourtsCount = complexes.reduce((sum, c) => sum + (c.courts?.length || 0), 0);
  const totalBookingsCount = complexes.reduce((sum, c) => sum + (c.bookings?.length || 0), 0);
  const totalRevenue = complexes.reduce((sum, c) => {
    const complexRev = (c.bookings || []).reduce((cSum, b) => {
      if (b.payment?.status === "PAID") return cSum + b.totalPrice;
      if (b.payment?.status === "PARTIAL") return cSum + (b.payment.depositAmount || 0);
      return cSum;
    }, 0);
    return sum + complexRev;
  }, 0);

  // Filtered complexes
  const filteredComplexes = complexes.filter((c) => {
    const active = isLicenseActive(c.license);
    const remDays = getRemainingDays(c.license);

    // Status filter
    if (filterStatus === "ACTIVE" && !active) return false;
    if (filterStatus === "EXPIRING" && (!active || remDays > 7)) return false;
    if (filterStatus === "EXPIRED" && active) return false;

    // Search filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.ownerName.toLowerCase().includes(term) ||
      c.ownerPhone.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term) ||
      (c.slug && c.slug.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-500/30 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-500/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Panel Maestro Multi-Cliente
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                SuperAdmin
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                Control de 30 Días
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gestión de Paneles de Administrador de Clientes
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Crea, edita y administra múltiples paneles de administración independientes. Habilita o desactiva el acceso mensual de 30 días para cada cliente en un clic.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Panel de Cliente</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Ir al Panel Activo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={logoutSuperAdmin}
              className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
              title="Cerrar sesión de Super Administrador"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Paneles de Clientes
            </span>
            <Building2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {totalComplexes}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ({activeComplexesCount} activos)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Complejos deportivos creados
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Canchas en la Red
            </span>
            <Layers className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {totalCourtsCount}
            </span>
            <span className="text-xs text-slate-500">canchas</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Pádel, Fútbol, Tenis
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Reservas Totales
            </span>
            <CalendarCheck className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {totalBookingsCount}
            </span>
            <span className="text-xs text-slate-500">turnos</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            En todas las sedes
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recaudación Global
            </span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatPrice(totalRevenue)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Facturación acumulada
          </p>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por complejo, propietario, teléfono o localidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "ALL"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Todos ({totalComplexes})
            </button>
            <button
              onClick={() => setFilterStatus("ACTIVE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Habilitados ({activeComplexesCount})
            </button>
            <button
              onClick={() => setFilterStatus("EXPIRING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "EXPIRING"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Por Vencer (&le; 7d)
            </button>
            <button
              onClick={() => setFilterStatus("EXPIRED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "EXPIRED"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Vencidos / Bloqueados
            </button>
          </div>

          <button
            onClick={handleActivateAll30Days}
            className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Sumar 30 días a todos los clientes a la vez"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>+30 Días a Todos</span>
          </button>
        </div>
      </div>

      {/* Client Panels List / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplexes.map((complex) => {
          const active = isLicenseActive(complex.license);
          const remDays = getRemainingDays(complex.license);
          const isCurrentActiveComplex = complex.id === activeComplexId;
          const courtsCount = complex.courts?.length || 0;
          const bookingsCount = complex.bookings?.length || 0;
          const customersCount = complex.customers?.length || 0;

          return (
            <div
              key={complex.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                isCurrentActiveComplex
                  ? "border-indigo-500 ring-2 ring-indigo-500/30"
                  : "border-slate-200 dark:border-slate-700/80"
              }`}
            >
              {/* Card Top Section */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        {complex.slug || "complejo"}
                      </span>
                      {isCurrentActiveComplex && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                          Panel en Uso
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {complex.name}
                    </h3>
                  </div>

                  {/* Quick Action Buttons (Edit & Delete) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingComplex(complex)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                      title="Editar datos y configuraciones del cliente"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClientComplex(complex, e)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title={`Eliminar panel de cliente "${complex.name}"`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 30-Day License Status Badge & Details */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    active
                      ? remDays <= 7
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {active ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-black">
                        {active
                          ? `${remDays} días restantes`
                          : !complex.license?.isEnabled
                          ? "Panel Bloqueado"
                          : "Período Vencido"}
                      </div>
                      <div className="text-[11px] opacity-80">
                        Vence: {formatLicenseDateTime(complex.license?.expiresAt || "")}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Lock / Unlock */}
                  <button
                    onClick={(e) => handleToggleStatus(complex, e)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      complex.license?.isEnabled
                        ? "text-slate-500 hover:text-rose-600 hover:bg-rose-500/10"
                        : "text-emerald-600 hover:bg-emerald-500/20"
                    }`}
                    title={
                      complex.license?.isEnabled
                        ? "Pausar / Bloquear acceso a este panel"
                        : "Habilitar acceso a este panel"
                    }
                  >
                    {complex.license?.isEnabled ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Owner and Complex info */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {complex.ownerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <a
                      href={`https://wa.me/${complex.ownerPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-slate-700 dark:text-slate-300"
                    >
                      {complex.ownerPhone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{complex.address}</span>
                  </div>
                </div>

                {/* Compact Stats Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {courtsCount}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                      Canchas
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {bookingsCount}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                      Reservas
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {customersCount}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                      Clientes
                    </div>
                  </div>
                </div>

                {/* Direct Links Preview & Share Box (Admin & Customer Portal) */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Enlaces Oficiales
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingComplex(complex);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Compartir Ambos</span>
                    </button>
                  </div>

                  {/* 1. Admin Portal Link Row */}
                  <div className="flex items-center justify-between gap-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200/80 dark:border-indigo-900/80 shadow-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-100">
                            Portal Administrador
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                            Privado
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          ?view=admin&c={complex.slug || complex.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(complex, "admin", e)}
                        className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-800/60"
                        title="Copiar Link de Administrador"
                      >
                        {copiedLinkInfo?.id === complex.id && copiedLinkInfo?.type === "admin" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cleanPhone = complex.ownerPhone ? complex.ownerPhone.replace(/[^0-9]/g, "") : "";
                          const url = buildComplexAdminUrl({
                            complexName: complex.name,
                            slug: complex.slug,
                            customPortalUrl: complex.settings?.customPortalUrl,
                            id: complex.id,
                          });
                          const msg = `¡Hola ${complex.ownerName || "Administrador"}! 👋 Te compartimos el link directo a tu *Panel de Administrador* de *${complex.name}* 🏟️:\n\n👉 ${url}\n\nDesde aquí podés administrar tus canchas, reservas y caja.`;
                          const target = cleanPhone
                            ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
                            : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                          window.open(target, "_blank");
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800/60"
                        title="Compartir link de Administrador al dueño por WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = buildComplexAdminUrl({
                            complexName: complex.name,
                            slug: complex.slug,
                            customPortalUrl: complex.settings?.customPortalUrl,
                            id: complex.id,
                          });
                          window.open(url, "_blank");
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Abrir Panel Administrador en nueva pestaña"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2. Client Portal Link Row */}
                  <div className="flex items-center justify-between gap-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200/80 dark:border-emerald-900/80 shadow-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">
                        <Globe className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-100">
                            Portal de Clientes
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                            Público 24/7
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          ?view=portal&c={complex.settings?.customPortalUrl || complex.slug || complex.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(complex, "portal", e)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/60"
                        title="Copiar Link del Portal de Clientes"
                      >
                        {copiedLinkInfo?.id === complex.id && copiedLinkInfo?.type === "portal" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = buildComplexPortalUrl({
                            complexName: complex.name,
                            slug: complex.slug,
                            customPortalUrl: complex.settings?.customPortalUrl,
                            id: complex.id,
                          });
                          const msg = `¡Hola! 👋 Reservá tu cancha online en *${complex.name}* 🏟️ de forma rápida ingresando aquí:\n\n👉 ${url}\n\n¡Elegí fecha, cancha y horario en segundos! ⚽🎾`;
                          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                        }}
                        className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 transition-colors cursor-pointer border border-teal-200/60 dark:border-teal-800/60"
                        title="Compartir link del portal de clientes por WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = buildComplexPortalUrl({
                            complexName: complex.name,
                            slug: complex.slug,
                            customPortalUrl: complex.settings?.customPortalUrl,
                            id: complex.id,
                          });
                          window.open(url, "_blank");
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Abrir Portal de Clientes en nueva pestaña"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {/* 30-Day Renewal Action */}
                  <button
                    onClick={(e) => handleActivate30Days(complex, e)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Sumar 30 días a este cliente"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>+30 Días</span>
                  </button>

                  {/* Share Links Dialog Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSharingComplex(complex);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Ver y compartir enlaces de Administrador y Cliente"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Enlaces</span>
                  </button>
                </div>

                {/* Enter / Access Admin Panel */}
                <button
                  onClick={() => handleAccessComplex(complex)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCurrentActiveComplex
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                  }`}
                >
                  <span>{isCurrentActiveComplex ? "Panel Actual" : "Acceder"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredComplexes.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No se encontraron complejos con los filtros actuales
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Prueba cambiando el texto de búsqueda o crea un nuevo panel de cliente deportivo.
          </p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Panel de Cliente</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <NewClientPanelModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={(id) => {
          showFeedback("¡Nuevo panel de cliente creado y configurado con éxito!");
        }}
      />

      <EditClientPanelModal
        complex={editingComplex}
        isOpen={!!editingComplex}
        onClose={() => setEditingComplex(null)}
        onSuccess={() => {
          showFeedback("¡Datos del panel de cliente guardados!");
        }}
      />

      <SuperAdminShareLinksModal
        complex={sharingComplex}
        isOpen={!!sharingComplex}
        onClose={() => setSharingComplex(null)}
      />
    </div>
  );
};
