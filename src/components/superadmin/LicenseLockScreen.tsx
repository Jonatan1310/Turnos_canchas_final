import React, { useState } from "react";
import {
  Lock,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  DollarSign,
  Copy,
  Check,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  SUPER_ADMIN_CONTACT,
} from "../../lib/license";
import { cleanPhoneForWhatsApp } from "../../lib/whatsapp";
import { copyToClipboard } from "../../lib/slugify";

interface LicenseLockScreenProps {
  onOpenPortal?: () => void;
}

export const LicenseLockScreen: React.FC<LicenseLockScreenProps> = ({
  onOpenPortal,
}) => {
  const {
    license,
    settings,
    getPublicPortalUrl,
    activeComplexId,
    activeComplex,
    addNotification,
  } = useApp();
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [paymentNotified, setPaymentNotified] = useState(false);
  const [paymentRefInput, setPaymentRefInput] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const complexDisplayName = settings.complexName || activeComplex?.name || "Complejo Deportivo";
  const superAdminPhoneClean = cleanPhoneForWhatsApp(SUPER_ADMIN_CONTACT.phone || "5491123456789");

  const whatsappMessage = `Hola Super Administrador, he realizado el pago de suscripción mensual para el complejo: *${complexDisplayName}* (ID: ${activeComplexId}). Adjunto comprobante de pago para habilitar el panel por los próximos 30 días. ¡Muchas gracias!`;
  const superAdminWhatsAppUrl = `https://api.whatsapp.com/send?phone=${superAdminPhoneClean}&text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  const handleCopyAlias = async () => {
    await copyToClipboard(SUPER_ADMIN_CONTACT.paymentAlias);
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2500);
  };

  const handleNotifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRefInput.trim()) return;

    addNotification({
      title: "Pago de Suscripción Informado",
      message: `El Administrador de ${complexDisplayName} ha informado el pago de suscripción (Ref/Comprobante: ${paymentRefInput.trim()}). Pendiente de confirmación por el Superusuario.`,
      type: "PAYMENT",
      date: new Date().toISOString(),
      read: false,
    });

    setPaymentNotified(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 text-slate-100 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/90 backdrop-blur-xl relative z-10 text-center space-y-6 animate-fadeIn">
        {/* Big Lock Icon */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 rounded-3xl blur-xl opacity-40 animate-pulse" />
          <div className="relative w-full h-full bg-slate-800 border-2 border-slate-700/80 rounded-3xl flex items-center justify-center shadow-inner">
            <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Acceso al Panel Administrador Suspendido</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Período de Suscripción Vencido o Inactivo
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
            El Panel Administrador de{" "}
            <strong className="text-white font-bold">{complexDisplayName}</strong>{" "}
            ha completado su período de uso. Para rehabilitar el panel por{" "}
            <strong className="text-amber-300 font-bold">30 días adicionales</strong>,
            debe contactar al <strong className="text-indigo-300 font-bold">Superusuario (Super Administrador)</strong> y
            enviar el comprobante del pago de suscripción.
          </p>
        </div>

        {/* Payment & Subscription Instruction Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 text-xs text-left space-y-3.5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Datos para el Pago de Suscripción (30 Días)</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40 text-[11px]">
              {SUPER_ADMIN_CONTACT.monthlyPriceText}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Alias de Transferencia:
              </span>
              <div className="flex items-center justify-between gap-1">
                <code className="text-white font-mono font-bold text-xs">
                  {SUPER_ADMIN_CONTACT.paymentAlias}
                </code>
                <button
                  type="button"
                  onClick={handleCopyAlias}
                  className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 cursor-pointer"
                  title="Copiar Alias"
                >
                  {copiedAlias ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                CBU / CVU:
              </span>
              <code className="text-white font-mono text-[11px] block truncate">
                {SUPER_ADMIN_CONTACT.paymentCbu}
              </code>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 sm:col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Titular / Plataforma:
                </span>
                <span className="text-white font-semibold text-xs">
                  {SUPER_ADMIN_CONTACT.bankName} ({SUPER_ADMIN_CONTACT.email})
                </span>
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">
                WhatsApp: {SUPER_ADMIN_CONTACT.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* WhatsApp Direct Contact Button to SuperAdmin */}
          <a
            href={superAdminWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>Enviar Comprobante al Superusuario (WhatsApp)</span>
          </a>

          {/* Client Portal Preview Button */}
          {onOpenPortal && (
            <button
              onClick={onOpenPortal}
              className="w-full py-3.5 px-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Cómo lo Ven los Clientes en el Portal Público</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
