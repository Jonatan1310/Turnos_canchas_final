import React, { useState } from "react";
import {
  ShieldCheck,
  Building2,
  ChevronDown,
  ArrowLeft,
  LogOut,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Sun,
  Moon,
  Zap,
  Globe,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { SuperAdminPanel } from "./SuperAdminPanel";
import { buildSuperAdminUrl } from "../../lib/slugify";

interface SuperAdminStandaloneViewProps {
  onExit: () => void;
}

export const SuperAdminStandaloneView: React.FC<
  SuperAdminStandaloneViewProps
> = ({ onExit }) => {
  const {
    complexes,
    activeComplexId,
    activeComplex,
    switchComplex,
    logoutSuperAdmin,
    theme,
    toggleTheme,
    activateLicense30Days,
    isLicenseActive,
    remainingLicenseDays,
  } = useApp();

  const [isComplexMenuOpen, setIsComplexMenuOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const superAdminUrl = buildSuperAdminUrl();

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(superAdminUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleLogout = () => {
    logoutSuperAdmin();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Dedicated SuperAdmin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-indigo-500/20 px-4 sm:px-8 py-3.5 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Brand & SuperAdmin Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>ReservaMaster</span>
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    SuperAdmin
                  </span>
                </h1>
              </div>
              <p className="text-xs text-indigo-300 font-medium hidden sm:block">
                Consola Maestra de Gestión Multi-Complejo & Licencias
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Direct SuperAdmin URL Copy Button */}
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Copiar URL directa de esta página independiente de SuperAdmin"
            >
              {copiedUrl ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="hidden md:inline">
                {copiedUrl ? "¡URL Copiada!" : "Copiar Enlace SuperAdmin"}
              </span>
            </button>

            {/* Exit to Active Complex Admin Button */}
            <button
              onClick={onExit}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
              title="Ir al panel del complejo seleccionado"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>
                Ir al Panel de{" "}
                <strong className="font-extrabold underline underline-offset-2">
                  {activeComplex?.name || "Complejo"}
                </strong>
              </span>
            </button>

            {/* Logout SuperAdmin Button */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Cerrar sesión de Super Administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main SuperAdmin Content Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <SuperAdminPanel onClose={onExit} />
      </main>

      {/* Standalone Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Página Independiente de Super Administrador &bull; Control centralizado
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Acceso: <strong className="text-slate-300">?view=superadmin</strong>
          </span>
        </div>
      </footer>
    </div>
  );
};
