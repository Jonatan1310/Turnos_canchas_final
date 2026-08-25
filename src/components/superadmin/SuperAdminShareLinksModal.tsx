import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Send,
  Globe,
  Share2,
  ShieldCheck,
  Building2,
  UserCheck,
  Layers,
  Sparkles,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { TenantComplex } from "../../types";
import { buildComplexAdminUrl, buildComplexPortalUrl } from "../../lib/slugify";

interface SuperAdminShareLinksModalProps {
  complex: TenantComplex | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminShareLinksModal: React.FC<
  SuperAdminShareLinksModalProps
> = ({ complex, isOpen, onClose }) => {
  const [copiedAdmin, setCopiedAdmin] = useState(false);
  const [copiedPortal, setCopiedPortal] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);

  if (!isOpen || !complex) return null;

  const adminUrl = buildComplexAdminUrl({
    complexName: complex.name,
    slug: complex.slug,
    customPortalUrl: complex.settings?.customPortalUrl,
    id: complex.id,
  });

  const portalUrl = buildComplexPortalUrl({
    complexName: complex.name,
    slug: complex.slug,
    customPortalUrl: complex.settings?.customPortalUrl,
    id: complex.id,
  });

  const handleCopyAdmin = () => {
    navigator.clipboard.writeText(adminUrl);
    setCopiedAdmin(true);
    setTimeout(() => setCopiedAdmin(false), 2500);
  };

  const handleCopyPortal = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2500);
  };

  const handleCopyBoth = () => {
    const fullText = `*Accesos Oficiales de ${complex.name}*\n\n🔑 *Portal Administrador (Gestión y Control):*\n${adminUrl}\n\n🌐 *Portal de Clientes (Reservas Online 24/7):*\n${portalUrl}`;
    navigator.clipboard.writeText(fullText);
    setCopiedBoth(true);
    setTimeout(() => setCopiedBoth(false), 2500);
  };

  const handleShareAdminWhatsApp = () => {
    const cleanPhone = complex.ownerPhone ? complex.ownerPhone.replace(/[^0-9]/g, "") : "";
    const msg = `¡Hola ${complex.ownerName || "Administrador"}! 👋 Te compartimos el enlace directo a tu *Panel de Administrador* de *${complex.name}* 🏟️:\n\n👉 ${adminUrl}\n\nDesde aquí podés administrar todas tus reservas, canchas, caja y clientes.`;
    const target = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(target, "_blank");
  };

  const handleSharePortalWhatsApp = () => {
    const msg = `¡Hola! 👋 Reservá tu cancha online en *${complex.name}* 🏟️ de forma rápida ingresando a nuestro portal de reservas 24/7:\n\n👉 ${portalUrl}\n\n¡Elegí fecha, cancha y horario en segundos! ⚽🎾`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleShareBothWhatsApp = () => {
    const cleanPhone = complex.ownerPhone ? complex.ownerPhone.replace(/[^0-9]/g, "") : "";
    const msg = `¡Hola ${complex.ownerName || "Administrador"}! 👋 Aquí tienes los enlaces de acceso oficiales para *${complex.name}*:\n\n🔑 *Tu Panel de Administrador (Privado):*\n👉 ${adminUrl}\n\n🌐 *Tu Portal de Clientes (Público de Reservas):*\n👉 ${portalUrl}\n\n¡Cualquier consulta estamos a tu disposición!`;
    const target = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(target, "_blank");
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto cursor-pointer font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden text-slate-900 dark:text-slate-100 cursor-default my-auto max-h-[92vh] flex flex-col relative z-[1000000]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Share2 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-white/20">
                  SuperAdmin
                </span>
                <span className="text-xs text-indigo-100 font-bold">Enlaces del Complejo</span>
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl leading-tight text-white mt-0.5">
                {complex.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-colors cursor-pointer shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto">
          {/* Owner Details Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-500" />
              <span className="text-slate-500 dark:text-slate-400">Propietario:</span>
              <strong className="text-slate-800 dark:text-slate-200">{complex.ownerName || "Sin especificar"}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-500 dark:text-slate-400">Teléfono:</span>
              <strong className="text-slate-800 dark:text-slate-200">{complex.ownerPhone || "Sin teléfono"}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              <span className="text-slate-500 dark:text-slate-400">Slug:</span>
              <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{complex.slug || complex.id}</code>
            </div>
          </div>

          {/* Section 1: Administrator Portal Link */}
          <div className="rounded-2xl border-2 border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 space-y-3.5 transition-all">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>1. Link del Portal Administrador</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black uppercase">
                      Privado
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Enlace directo para que el dueño/encargado acceda a administrar este complejo.
                  </p>
                </div>
              </div>
            </div>

            {/* URL Display */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 shadow-inner">
              <input
                type="text"
                readOnly
                value={adminUrl}
                className="w-full bg-transparent text-xs font-mono text-indigo-900 dark:text-indigo-200 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyAdmin}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                {copiedAdmin ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Admin Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => window.open(adminUrl, "_blank")}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                <span>Abrir Panel Administrador</span>
              </button>

              <button
                type="button"
                onClick={handleShareAdminWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Link Admin al Dueño (WhatsApp)</span>
              </button>
            </div>
          </div>

          {/* Section 2: Public Client Portal Link */}
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-3.5 transition-all">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>2. Link del Portal de Clientes</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black uppercase">
                      Público 24/7
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Enlace oficial para que los jugadores y clientes hagan sus reservas online.
                  </p>
                </div>
              </div>
            </div>

            {/* URL Display */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-inner">
              <input
                type="text"
                readOnly
                value={portalUrl}
                className="w-full bg-transparent text-xs font-mono text-emerald-900 dark:text-emerald-200 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyPortal}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                {copiedPortal ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Portal Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => window.open(portalUrl, "_blank")}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                <span>Abrir Portal de Clientes</span>
              </button>

              <button
                type="button"
                onClick={handleSharePortalWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Compartir Portal a Clientes (WhatsApp)</span>
              </button>
            </div>
          </div>

          {/* Section 3: Share Both Links Together (Package for Owner) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-xs sm:text-sm text-white">
                  Compartir Ambos Enlaces Juntos al Propietario
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Pack Completo
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Envía un mensaje completo con el link de gestión del administrador y el link de reservas para sus clientes.
            </p>

            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <button
                type="button"
                onClick={handleCopyBoth}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {copiedBoth ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>¡Ambos Enlaces Copiados!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Copiar Ambos Enlaces</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareBothWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Pack Completo por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
