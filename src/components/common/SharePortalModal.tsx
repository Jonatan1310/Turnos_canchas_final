import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Send,
  Globe,
  Smartphone,
  Share2,
  Save,
  RotateCcw,
  Sparkles,
  QrCode,
  Download,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { buildComplexPortalUrl, slugify, copyToClipboard } from "../../lib/slugify";

interface SharePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  customUrl?: string;
  onOpenDirectly?: () => void;
}

export const SharePortalModal: React.FC<SharePortalModalProps> = ({
  isOpen,
  onClose,
  customUrl,
  onOpenDirectly,
}) => {
  const {
    settings,
    updateSettings,
    getPublicPortalUrl,
    activeComplex,
    activeComplexId,
  } = useApp();
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const initial = customUrl || getPublicPortalUrl();
    setUrlInput(initial);
  }, [isOpen, customUrl, settings.customPortalUrl, activeComplexId, settings.complexName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentActiveUrl = urlInput.trim() || getPublicPortalUrl();

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    updateSettings({ customPortalUrl: trimmed });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefault = () => {
    updateSettings({ customPortalUrl: "" });
    const defaultUrl = buildComplexPortalUrl({
      complexName: settings.complexName || activeComplex?.name,
      slug: activeComplex?.slug,
      id: activeComplexId,
    });
    setUrlInput(defaultUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopy = async () => {
    await copyToClipboard(currentActiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `¡Hola! 👋 Podés reservar tu cancha en línea en *${settings.complexName || "nuestro complejo"}* 🏟️ ingresando a nuestro portal de reservas 24/7:\n\n👉 ${currentActiveUrl}\n\n¡Elegí tu cancha y horario disponible en segundos! ⚽🎾`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Portal de Reservas - ${settings.complexName || "Complejo Deportivo"}`,
          text: `¡Hola! 👋 Podés reservar tu cancha en línea en *${settings.complexName || "nuestro complejo"}* 🏟️:\n👉 ${currentActiveUrl}\n\n¡Elegí tu horario en segundos! ⚽🎾`,
          url: currentActiveUrl,
        });
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          console.warn("navigator.share error:", err);
          await handleCopy();
        }
      }
    } else {
      await handleCopy();
    }
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.open(currentActiveUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDirectNavigation = () => {
    if (onOpenDirectly) {
      onOpenDirectly();
      onClose();
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentActiveUrl)}&margin=10`;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden text-slate-900 dark:text-slate-100 cursor-default my-auto max-h-[92vh] flex flex-col relative z-[1000000]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Share2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl leading-tight">
                Compartir y Configurar Portal de Clientes
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-0.5">
                Personalizá y compartí el enlace oficial de reservas
              </p>
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

        {/* Content */}
        <div className="p-5 sm:p-7 space-y-5 overflow-y-auto">
          {/* Info Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Link Oficial para tus Clientes</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                24/7 Disponible
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
              Podés usar la URL generada automáticamente o escribir tu dominio propio.
              Al guardarla, se actualizará en todos los mensajes de WhatsApp del sistema.
            </p>
          </div>

          {/* Editable Link Input Area */}
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>Enlace Web del Portal (Editable):</span>
              </label>

              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Guardado correctamente!</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://tudominio.com o https://mipagina.com/portal"
                  className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                  title="Guardar como URL configurada"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar URL</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                  title="Copiar enlace al portapapeles"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copied ? "¡Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>

            {settings.customPortalUrl && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Usando URL personalizada configurada</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-[11px] font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer a URL del sistema</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>

            {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
              <button
                onClick={handleNativeShare}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir en Apps / Redes</span>
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </button>
            )}

            {/* In-App Direct Open or New Tab */}
            {onOpenDirectly && (
              <button
                onClick={handleDirectNavigation}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Globe className="w-4 h-4" />
                <span>Ver Portal en el Sistema</span>
              </button>
            )}

            <button
              onClick={handleOpenInNewTab}
              className={`w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-slate-300 dark:border-slate-700 cursor-pointer active:scale-98 ${
                !onOpenDirectly ? "sm:col-span-2" : ""
              }`}
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span>Abrir en Nueva Pestaña</span>
            </button>
          </div>

          {/* QR Code Section Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowQrCode(!showQrCode)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-between transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Código QR para Mostrador / Mesas / Folletos</span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                {showQrCode ? "Ocultar QR ▲" : "Ver Código QR ▼"}
              </span>
            </button>

            {showQrCode && (
              <div className="mt-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left animate-fadeIn shadow-xs">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <img
                    src={qrImageUrl}
                    alt="Código QR del Portal de Reservas"
                    className="w-36 h-36 object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Código QR de Acceso Instantáneo
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tus clientes pueden escanear este código QR con la cámara de su celular para abrir directamente el portal de reservas de{" "}
                    <strong>{settings.complexName}</strong>.
                  </p>
                  <div className="pt-1">
                    <a
                      href={qrImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Abrir / Descargar Imagen QR</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Helpful Tip */}
          <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-xs">
              <strong>Tip para clientes:</strong> Al abrir esta dirección desde Google Chrome o Safari en sus teléfonos, pueden presionar <em>"Agregar a Pantalla de Inicio"</em> para guardarla como una App directo en su celular.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};


