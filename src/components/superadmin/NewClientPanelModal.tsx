import React, { useState } from "react";
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Zap,
  CheckCircle2,
  Palette,
  Layers,
  FileText,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { SportPreset } from "../../types";

interface NewClientPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdComplexId: string) => void;
}

export const NewClientPanelModal: React.FC<NewClientPanelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createComplex, switchComplex } = useApp();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sportPreset, setSportPreset] = useState<SportPreset>("PADEL");
  const [primaryColor, setPrimaryColor] = useState("#059669");
  const [durationDays, setDurationDays] = useState<number>(30);
  const [notes, setNotes] = useState("");
  const [openImmediately, setOpenImmediately] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
  };

  const handlePresetSelect = (preset: SportPreset) => {
    setSportPreset(preset);
    if (preset === "PADEL") setPrimaryColor("#059669");
    else if (preset === "FUTBOL") setPrimaryColor("#2563eb");
    else if (preset === "TENIS") setPrimaryColor("#d97706");
    else setPrimaryColor("#4f46e5");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("El nombre del complejo es obligatorio.");
      return;
    }
    if (!ownerName.trim()) {
      setErrorMsg("El nombre del cliente/propietario es obligatorio.");
      return;
    }
    if (!ownerPhone.trim()) {
      setErrorMsg("El teléfono o WhatsApp de contacto es obligatorio.");
      return;
    }

    try {
      const created = createComplex({
        name: name.trim(),
        slug: slug.trim() || undefined,
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim() || "contacto@canchas.app",
        ownerPhone: ownerPhone.trim(),
        address: address.trim() || "Dirección del Complejo",
        sportPreset,
        primaryColor,
        initialDurationDays: durationDays > 0 ? durationDays : 30,
        notes: notes.trim() || undefined,
      });

      if (openImmediately) {
        switchComplex(created.id);
      }

      if (onSuccess) {
        onSuccess(created.id);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error al crear el panel del cliente.");
    }
  };

  const sportPresetsList = [
    {
      id: "PADEL" as SportPreset,
      name: "Pádel Panorámico",
      desc: "3 Pistas de cristal (Panorámica, Indoor, Exterior)",
      color: "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      badge: "Más Popular",
    },
    {
      id: "FUTBOL" as SportPreset,
      name: "Fútbol 5 & 7",
      desc: "3 Canchas de césped sintético techadas y descubiertas",
      color: "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      id: "TENIS" as SportPreset,
      name: "Tenis Polvo de Ladrillo",
      desc: "2 Canchas profesionales de polvo de ladrillo",
      color: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      id: "MULTISPORT" as SportPreset,
      name: "Club Multideporte",
      desc: "Fútbol 5 sintético, Pádel cristal y Tenis combinados",
      color: "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  Habilitación de 30 Días
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  SuperAdmin
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Crear Nuevo Panel de Administrador
              </h2>
              <p className="text-xs text-slate-300">
                Genera un panel totalmente funcional y aislado para un nuevo cliente deportivo.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Complex Information */}
          <div className="space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>1. Datos del Complejo Deportivo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre del Complejo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pádel Club San Isidro"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Identificador / Slug Web (Portal)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">
                    /portal?c=
                  </span>
                  <input
                    type="text"
                    placeholder="padel-san-isidro"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full pl-22 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Dirección Física
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Ej: Av. Dardo Rocha 1250, San Isidro, Buenos Aires"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Owner Contact */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span>2. Datos del Cliente / Propietario</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gonzalo Fernández"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="+54 9 11 5566-7788"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email de Contacto
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Sport Preset & Initial Courts */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>3. Tipo de Deporte & Canchas Predeterminadas</span>
              </span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">
                (Se pueden editar luego en el panel)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sportPresetsList.map((preset) => {
                const isSelected = sportPreset === preset.id;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? `${preset.color} ring-2 ring-indigo-500/50 shadow-sm`
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {preset.name}
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 inline" />
                        )}
                      </span>
                      {preset.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                          {preset.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Initial 30-Day Activation */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>4. Período de Habilitación Inicial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Días de Habilitación
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationDays(30)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      durationDays === 30
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    30 Días
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays(60)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      durationDays === 60
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    60 Días
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays(90)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      durationDays === 90
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    90 Días
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notas Internas de SuperAdmin
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cliente abonó plan mensual en efectivo"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Checkbox: Open immediately */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={openImmediately}
                  onChange={(e) => setOpenImmediately(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  Acceder inmediatamente a este nuevo panel tras crearlo
                </span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Crear & Habilitar Panel (30 Días)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
