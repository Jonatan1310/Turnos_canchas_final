import React, { useState } from "react";
import {
  Search,
  Sun,
  Moon,
  Menu,
  Globe,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NotificationDropdown } from "../common/NotificationDropdown";
import { SharePortalModal } from "../common/SharePortalModal";
import { ActiveTab } from "./Sidebar";
import { copyToClipboard } from "../../lib/slugify";

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSearch?: () => void;
  onOpenPublicPortal?: () => void;
  onNavigate?: (tab: ActiveTab) => void;
  onOpenSuperAdminLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onOpenPublicPortal,
  onNavigate,
}) => {
  const {
    settings,
    theme,
    toggleTheme,
    activeUser,
    setSearchOpen,
    getPublicPortalUrl,
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(getPublicPortalUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTriggerSearch = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setSearchOpen(true);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between transition-colors shadow-xs">
      {/* Left side: Menu toggle button & Brand & Complex Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 bg-slate-100/90 hover:bg-blue-50 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-2xs group active:scale-95"
          title="Abrir Menú Lateral de Navegación"
          id="btn-toggle-sidebar"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 hidden sm:inline">
            Menú
          </span>
        </button>

        {/* Current Complex Brand */}
        <div className="flex items-center space-x-3 p-1">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.complexName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-md shrink-0 bg-white dark:bg-slate-800"
            />
          ) : (
            <div
              style={{
                backgroundColor: settings.primaryColor || "#059669",
              }}
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-extrabold text-base shadow-md shrink-0 ring-1 ring-white/20"
            >
              {settings.complexName
                ? settings.complexName.substring(0, 2).toUpperCase()
                : "RM"}
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-tight tracking-tight max-w-[220px] truncate">
              {settings.complexName}
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Panel Administrador
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Search bar trigger */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={handleTriggerSearch}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/60 transition-all shadow-2xs group"
        >
          <span className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span>Buscar reserva, cliente o cancha...</span>
          </span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Search Button */}
        <button
          onClick={handleTriggerSearch}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Buscar"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Public Portal Quick Link Tools */}
        {onOpenPublicPortal && (
          <>
            {/* Desktop / Tablet Bar */}
            <div className="hidden sm:flex items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  if (onOpenPublicPortal) {
                    onOpenPublicPortal();
                  }
                }}
                className="px-2.5 py-1 text-xs font-extrabold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                title="Ver e interactuar con el Portal Público de Reservas"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Ver Portal Público</span>
              </button>
              <div className="w-px h-3.5 bg-emerald-200 dark:bg-emerald-800 my-auto" />
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="p-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 px-2"
                title="Compartir Link con Clientes (QR, WhatsApp, Link)"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-bold">
                  Compartir Link Portal
                </span>
              </button>
              <div className="w-px h-3.5 bg-emerald-200 dark:bg-emerald-800 my-auto" />
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 rounded-lg transition-colors cursor-pointer px-2 flex items-center gap-1 text-[11px] font-bold"
                title="Copiar Link directo para clientes"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedLink ? "¡Copiado!" : "Copiar"}</span>
              </button>
            </div>

            {/* Mobile View Compact Buttons */}
            <div className="flex sm:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (onOpenPublicPortal) {
                    onOpenPublicPortal();
                  }
                }}
                className="p-1.5 bg-emerald-600 text-white rounded-xl shadow-xs flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="Ir al Portal Público"
              >
                <Globe className="w-4 h-4" />
                <span className="text-[10px]">Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="QR / Compartir Link"
              >
                <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px]">Compartir</span>
              </button>
            </div>
          </>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <NotificationDropdown onNavigate={onNavigate} />

        {/* User Avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={
              activeUser.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            }
            alt={activeUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30 dark:ring-blue-400/30 shadow-2xs"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {activeUser.name}
            </p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize">
              Administrador
            </p>
          </div>
        </div>
      </div>

      <SharePortalModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        customUrl={getPublicPortalUrl()}
        onOpenDirectly={onOpenPublicPortal}
      />
    </header>
  );
};
