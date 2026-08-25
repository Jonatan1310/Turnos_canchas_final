import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface SuperAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SuperAdminLoginModal: React.FC<SuperAdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginSuperAdmin } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const result = loginSuperAdmin(username, password);
      setIsLoading(false);

      if (result.success) {
        setSuccessMessage("¡Acceso autorizado! Abriendo Panel Super Admin...");
        setTimeout(() => {
          setSuccessMessage("");
          setUsername("");
          setPassword("");
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        }, 600);
      } else {
        setErrorMessage(result.message);
      }
    }, 250);
  };

  const handleFillCredentials = () => {
    setUsername("SuperAdmin");
    setPassword("Super@Admin");
    setErrorMessage("");
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 text-slate-100 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 max-w-md w-full overflow-hidden cursor-default relative z-[1000000] my-auto flex flex-col"
      >
        {/* Glow effect header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 relative border-b border-indigo-500/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/30 mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Acceso Restringido</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Panel Super Admin
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Control maestro y habilitación por 30 días
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Usuario Super Admin</span>
              <span className="text-[10px] text-slate-500 font-mono">SuperAdmin</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: SuperAdmin"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl text-sm text-white placeholder-slate-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Contraseña Maestra</span>
              <span className="text-[10px] text-slate-500 font-mono">Super@Admin</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl text-sm text-white placeholder-slate-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Auto-fill helper shortcut */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleFillCredentials}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3 h-3" />
              <span>Autocompletar credenciales</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>
              {isLoading ? "Validando credenciales..." : "Ingresar a Super Admin"}
            </span>
          </button>
        </form>

        {/* Footer tip */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Credenciales requeridas por seguridad</span>
          <span className="font-mono text-[10px] text-slate-500">v2.4.0</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
