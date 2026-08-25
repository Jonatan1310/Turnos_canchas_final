import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Building2,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { SUPER_ADMIN_CREDENTIALS } from "../../lib/license";

interface SuperAdminStandaloneLoginPageProps {
  onExit: () => void;
  onSuccess?: () => void;
}

export const SuperAdminStandaloneLoginPage: React.FC<
  SuperAdminStandaloneLoginPageProps
> = ({ onExit, onSuccess }) => {
  const { loginSuperAdmin, settings, activeComplex } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const result = loginSuperAdmin(username, password);
      setIsLoading(false);

      if (result.success) {
        setSuccessMessage("¡Credenciales verificadas! Accediendo a la Consola Maestra...");
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 500);
      } else {
        setErrorMessage(result.message);
      }
    }, 300);
  };

  const handleFillCredentials = () => {
    setUsername(SUPER_ADMIN_CREDENTIALS.username);
    setPassword(SUPER_ADMIN_CREDENTIALS.password);
    setErrorMessage("");
  };

  const complexName = settings.complexName || activeComplex?.name || "Complejo Deportivo";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/6 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Standalone Header */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
              ReservaMaster <span className="text-indigo-400">SuperAdmin</span>
            </h1>
            <p className="text-xs text-slate-400">
              Página Independiente de Control Multi-Complejo
            </p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Panel de {complexName}</span>
        </button>
      </header>

      {/* Center Login Container */}
      <main className="relative z-10 my-auto py-8 max-w-md mx-auto w-full animate-fadeIn">
        <div className="bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl space-y-6">
          {/* Card Title & Icon */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-black uppercase tracking-wider border border-indigo-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Acceso Restringido</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Consola Super Administrador
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ingresa con tu usuario maestro para gestionar licencias de 30 días, crear nuevos complejos y administrar los paneles de clientes.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Usuario SuperAdmin</span>
                <span className="text-[10px] text-slate-500 font-mono">SuperAdmin</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="SuperAdmin"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Contraseña Maestra</span>
                <span className="text-[10px] text-slate-500 font-mono">Super@Admin</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer"
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98] mt-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? "Validando..." : "Ingresar al Panel SuperAdmin"}</span>
            </button>
          </form>

          {/* Quick Credential Autofill Helper */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <button
              type="button"
              onClick={handleFillCredentials}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-dashed border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Autocompletar Credenciales de Demostración</span>
            </button>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Usuario:</span>
                <code className="text-slate-200 font-bold font-mono">SuperAdmin</code>
              </div>
              <div className="flex justify-between">
                <span>Contraseña:</span>
                <code className="text-slate-200 font-bold font-mono">Super@Admin</code>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Standalone Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-500 py-4 border-t border-slate-800/80 max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>ReservaMaster Platform &copy; Todos los derechos reservados.</span>
        <span className="font-mono text-[11px] text-slate-400">
          URL independiente: <code>?view=superadmin</code>
        </span>
      </footer>
    </div>
  );
};
