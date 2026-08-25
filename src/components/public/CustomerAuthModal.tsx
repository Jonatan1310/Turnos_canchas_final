import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  LogIn,
  Sparkles,
} from "lucide-react";
import { cleanPhoneForWhatsApp } from "../../lib/whatsapp";
import { useApp } from "../../context/AppContext";

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  provider: "google" | "whatsapp" | "email";
}

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: PortalUser) => void;
  currentUsersList?: PortalUser[];
  complexWhatsApp?: string;
  complexName?: string;
  initialMode?: string;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  complexWhatsApp,
  complexName,
}) => {
  const { settings } = useApp();
  const activeComplexName = settings.complexName || complexName || "Complejo";
  const activeComplexPhone = settings.whatsapp || settings.phone || complexWhatsApp || "";

  const [activeTab, setActiveTab] = useState<"WHATSAPP" | "GOOGLE">("WHATSAPP");

  // Quick WhatsApp/Name Login State
  const [fullName, setFullName] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [optionalEmail, setOptionalEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Google Selector Overlay State
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState("");
  const [googleCustomName, setGoogleCustomName] = useState("");
  const [googleCustomPhone, setGoogleCustomPhone] = useState("");

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

  // Saved accounts in localStorage
  const getRegisteredUsers = (): {
    id: string;
    name: string;
    email: string;
    phone: string;
    provider: string;
    avatarUrl?: string;
  }[] => {
    try {
      const stored = localStorage.getItem("portal_registered_users");
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: "user-demo-1",
        name: "Juan Pérez",
        email: "juan.perez@ejemplo.com",
        phone: "1123456789",
        provider: "whatsapp",
        avatarUrl:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      },
    ];
  };

  const saveRegisteredUsers = (users: any[]) => {
    try {
      localStorage.setItem("portal_registered_users", JSON.stringify(users));
    } catch {
      // fallback
    }
  };

  // Handle WhatsApp / Name Fast Login Submit
  const handleWhatsAppAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const cleanName = fullName.trim();
    const cleanPhone = whatsappPhone.trim();
    const cleanEmail = optionalEmail.trim().toLowerCase();

    if (!cleanName) {
      setAuthError("Por favor ingresá tu Nombre y Apellido.");
      return;
    }

    if (!cleanPhone || cleanPhone.length < 6) {
      setAuthError(
        "Por favor ingresá un número de WhatsApp / Teléfono válido.",
      );
      return;
    }

    const registered = getRegisteredUsers();

    // Check if user exists by phone or name
    let found = registered.find(
      (u) =>
        u.phone.replace(/\D/g, "") === cleanPhone.replace(/\D/g, "") ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail),
    );

    if (!found) {
      // Register new user seamlessly
      found = {
        id: "usr-" + Date.now(),
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail || `${cleanPhone}@cliente.local`,
        provider: "whatsapp",
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=10B981&color=fff`,
      };
      registered.push(found);
      saveRegisteredUsers(registered);
    } else {
      // Update details if provided
      found.name = cleanName || found.name;
      if (cleanEmail) found.email = cleanEmail;
      saveRegisteredUsers(registered);
    }

    const loggedUser: PortalUser = {
      id: found.id,
      name: found.name,
      email:
        found.email ||
        (cleanEmail ? cleanEmail : `${cleanPhone}@cliente.local`),
      phone: found.phone,
      avatarUrl:
        found.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(found.name)}&background=10B981&color=fff`,
      provider: "whatsapp",
    };

    // Open WhatsApp directly to configured Admin WhatsApp number
    const adminPhoneClean = cleanPhoneForWhatsApp(activeComplexPhone);
    const waMessage = `Hola *${activeComplexName}*! 👋 Me acabo de registrar en el portal de clientes:\n\n👤 *Cliente:* ${found.name}\n📱 *WhatsApp:* ${found.phone}${cleanEmail ? `\n✉️ *Email:* ${cleanEmail}` : ""}\n\n¡Quiero realizar una reserva de cancha! ⚽🎾`;
    const waUrl = adminPhoneClean
      ? `https://api.whatsapp.com/send?phone=${adminPhoneClean}&text=${encodeURIComponent(waMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;

    try {
      window.open(waUrl, "_blank");
    } catch {
      // fallback
    }

    setAuthSuccess("¡Ingreso exitoso! Redireccionando al WhatsApp del complejo...");

    setTimeout(() => {
      onSuccessLogin(loggedUser);
      onClose();
    }, 600);
  };

  // Google Login Handler
  const handleGoogleSignInSelect = (
    email: string,
    name: string,
    avatarUrl?: string,
    phone?: string,
  ) => {
    const userPhone = phone || "";
    const googleUser: PortalUser = {
      id: "google-" + Date.now(),
      name: name || "Usuario Google",
      email: email || "usuario.google@gmail.com",
      phone: userPhone,
      avatarUrl:
        avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Google")}&background=4285F4&color=fff`,
      provider: "google",
    };

    const adminPhoneClean = cleanPhoneForWhatsApp(activeComplexPhone);
    const waMessage = `Hola *${activeComplexName}*! 👋 Me acabo de registrar con Google en el portal de clientes:\n\n👤 *Cliente:* ${googleUser.name}\n✉️ *Email:* ${googleUser.email}${userPhone ? `\n📱 *Teléfono:* ${userPhone}` : ""}\n\n¡Quiero realizar una reserva de cancha! ⚽🎾`;
    const waUrl = adminPhoneClean
      ? `https://api.whatsapp.com/send?phone=${adminPhoneClean}&text=${encodeURIComponent(waMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;

    try {
      window.open(waUrl, "_blank");
    } catch {
      // fallback
    }

    onSuccessLogin(googleUser);
    setShowGooglePicker(false);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative cursor-default"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Ingresar al Portal de Clientes
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Accedé con tu Nombre y Número de WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GOOGLE PICKER OVERLAY */}
        {showGooglePicker ? (
          <div className="p-6 space-y-5 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Iniciar sesión con Google
              </h4>
              <p className="text-xs text-slate-500">
                Seleccioná o ingresá una cuenta de Google
              </p>
            </div>

            {/* Google Profile Preset 1 */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  handleGoogleSignInSelect(
                    "jonatan.martinez@gmail.com",
                    "Jonatan Martinez",
                    "https://lh3.googleusercontent.com/a/default-user=s96-c",
                    "1122334455",
                  )
                }
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0 shadow-xs">
                  JM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Jonatan Martinez
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    jonatan.martinez@gmail.com
                  </div>
                </div>
              </button>
            </div>

            {/* Custom Google Account Input */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                O ingresá otra cuenta de Google:
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Tu Nombre completo"
                  value={googleCustomName}
                  onChange={(e) => setGoogleCustomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="tu.cuenta@gmail.com"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Teléfono / WhatsApp (ej: 1122334455)"
                  value={googleCustomPhone}
                  onChange={(e) => setGoogleCustomPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  disabled={!googleCustomEmail.trim()}
                  onClick={() =>
                    handleGoogleSignInSelect(
                      googleCustomEmail.trim(),
                      googleCustomName.trim() ||
                        googleCustomEmail.split("@")[0],
                      undefined,
                      googleCustomPhone.trim() || "1100000000",
                    )
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Continuar con esta cuenta Google
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGooglePicker(false)}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              ← Volver al ingreso rápido
            </button>
          </div>
        ) : (
          /* PRIMARY LOGIN / ACCESS FORM: NAME + WHATSAPP (EMAIL OPTIONAL) */
          <div className="p-6 space-y-5">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Ingreso Rápido:</strong> No necesitás recordar
                contraseña. Sólo completá tu nombre y número de WhatsApp.
              </span>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleWhatsAppAuthSubmit} className="space-y-4">
              {/* Field 1: Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Nombre y Apellido</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Jonatan Martínez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Field 2: WhatsApp / Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Número de WhatsApp / Celular</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 11 2345-6789"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Field 3: Email (OPTIONAL) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Correo Electrónico</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Opcional)
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com (opcional)"
                    value={optionalEmail}
                    onChange={(e) => setOptionalEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar con WhatsApp / Nombre</span>
              </button>
            </form>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                o con Google
              </span>
            </div>

            {/* GOOGLE SIGN IN BUTTON */}
            <div>
              <button
                type="button"
                onClick={() => setShowGooglePicker(true)}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
