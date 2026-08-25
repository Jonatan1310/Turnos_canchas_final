import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Save,
  Zap,
  Lock,
  Unlock,
  Trash2,
  KeyRound,
  Palette,
  Clock,
  DollarSign,
  Percent,
  Layers,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  FileText,
  CreditCard,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { TenantComplex, Court } from "../../types";
import { formatLicenseDateTime } from "../../lib/license";
import { slugify } from "../../lib/slugify";
import {
  THEME_PRESETS,
  ThemePresetId,
  ThemeMode,
  getThemePreset,
} from "../../lib/themePresets";

interface EditClientPanelModalProps {
  complex: TenantComplex | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditClientPanelModal: React.FC<EditClientPanelModalProps> = ({
  complex,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    updateComplex,
    deleteComplex,
    activateComplexLicense,
    toggleComplexLicense,
    complexes,
    formatPrice,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "GENERAL" | "CREDENTIALS" | "OPERATIONS" | "COURTS" | "LICENSE"
  >("GENERAL");

  // General fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [themePreset, setThemePreset] = useState<string>("emerald");
  const [primaryColor, setPrimaryColor] = useState("#059669");
  const [secondaryColor, setSecondaryColor] = useState("#10b981");
  const [notes, setNotes] = useState("");

  // Credentials
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Operational & payment rules
  const [openingTime, setOpeningTime] = useState("07:30");
  const [closingTime, setClosingTime] = useState("23:30");
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [cancellationPolicyHours, setCancellationPolicyHours] = useState(4);
  const [bankName, setBankName] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [cbuCvu, setCbuCvu] = useState("");
  const [bankAlias, setBankAlias] = useState("");
  const [mpAlias, setMpAlias] = useState("");

  // Courts
  const [courtsList, setCourtsList] = useState<Court[]>([]);

  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (complex) {
      setName(complex.name || "");
      setSlug(complex.slug || slugify(complex.name || ""));
      setOwnerName(complex.ownerName || "");
      setOwnerEmail(complex.ownerEmail || "");
      setOwnerPhone(complex.ownerPhone || "");
      setAddress(complex.address || "");
      setThemeMode(complex.settings?.themeMode || "light");
      setThemePreset(complex.settings?.themePreset || "emerald");
      setPrimaryColor(complex.settings?.primaryColor || "#059669");
      setSecondaryColor(complex.settings?.secondaryColor || "#10b981");
      setNotes(complex.notes || "");

      setAdminUsername(
        complex.adminUsername ||
          `admin_${slugify(complex.name || "").replace(/-/g, "").substring(0, 10)}`,
      );
      setAdminPassword(complex.adminPassword || "admin@canchas");

      setOpeningTime(complex.settings?.defaultOpeningTime || "07:30");
      setClosingTime(complex.settings?.defaultClosingTime || "23:30");
      setDepositPercentage(complex.settings?.depositPercentage ?? 50);
      setCancellationPolicyHours(
        complex.settings?.cancellationPolicyHours ?? 4,
      );

      setBankName(complex.settings?.bankDetails?.bankName || "");
      setBankHolder(
        complex.settings?.bankDetails?.accountHolder || complex.name || "",
      );
      setCbuCvu(complex.settings?.bankDetails?.cbuCvu || "");
      setBankAlias(complex.settings?.bankDetails?.alias || "");
      setMpAlias(complex.settings?.mercadoPagoDetails?.mpAliasOrEmail || "");

      setCourtsList(
        complex.courts
          ? JSON.parse(JSON.stringify(complex.courts))
          : [],
      );
    }
  }, [complex]);

  if (!isOpen || !complex) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(complex.name)) {
      setSlug(slugify(val));
    }
  };

  const handleCourtPriceChange = (courtId: string, newPrice: number) => {
    setCourtsList((prev) =>
      prev.map((c) =>
        c.id === courtId ? { ...c, pricePerHour: Math.max(0, newPrice) } : c,
      ),
    );
  };

  const handleCourtNameChange = (courtId: string, newName: string) => {
    setCourtsList((prev) =>
      prev.map((c) => (c.id === courtId ? { ...c, name: newName } : c)),
    );
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim()) {
      setFeedback("El nombre del complejo y el cliente son obligatorios.");
      return;
    }

    const cleanSlug = slug.trim() || slugify(name.trim()) || complex.id;

    const updatedSettings = {
      ...(complex.settings || {}),
      complexName: name.trim(),
      address: address.trim(),
      phone: ownerPhone.trim(),
      whatsapp: ownerPhone.replace(/[^0-9]/g, ""),
      email: ownerEmail.trim(),
      themeMode,
      themePreset,
      primaryColor,
      secondaryColor,
      customPortalUrl: cleanSlug,
      defaultOpeningTime: openingTime,
      defaultClosingTime: closingTime,
      depositPercentage: Number(depositPercentage) || 50,
      cancellationPolicyHours: Number(cancellationPolicyHours) || 4,
      bankDetails: {
        ...(complex.settings?.bankDetails || {}),
        bankName: bankName.trim(),
        accountHolder: bankHolder.trim() || name.trim(),
        cbuCvu: cbuCvu.trim(),
        alias: bankAlias.trim(),
      },
      mercadoPagoDetails: {
        ...(complex.settings?.mercadoPagoDetails || {}),
        accountHolder: bankHolder.trim() || name.trim(),
        mpAliasOrEmail: mpAlias.trim(),
      },
    };

    updateComplex(complex.id, {
      name: name.trim(),
      slug: cleanSlug,
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim(),
      ownerPhone: ownerPhone.trim(),
      address: address.trim(),
      notes: notes.trim(),
      adminUsername: adminUsername.trim() || complex.adminUsername,
      adminPassword: adminPassword.trim() || complex.adminPassword,
      settings: updatedSettings,
      courts: courtsList,
    });

    setFeedback(`¡Panel "${name.trim()}" guardado y actualizado con total independencia!`);
    setTimeout(() => {
      setFeedback("");
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  const currentComplex =
    complexes.find((c) => c.id === complex.id) || complex;

  const handleAddDays = (days: number) => {
    activateComplexLicense(
      currentComplex.id,
      days,
      `Extensión de +${days} días realizada desde el panel de edición SuperAdmin`,
    );
    setFeedback(`¡Se sumaron +${days} días a la licencia con éxito!`);
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleToggleActive = () => {
    const nextState = !currentComplex.license?.isEnabled;
    toggleComplexLicense(currentComplex.id, nextState);
    setFeedback(
      nextState
        ? "Panel habilitado con éxito"
        : "Panel pausado/bloqueado temporalmente",
    );
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleDelete = () => {
    if (complexes.length <= 1) {
      alert("No se puede eliminar el único complejo restante.");
      return;
    }
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar permanentemente el panel de "${currentComplex.name}"? Todos sus datos de reservas y canchas se borrarán.`,
      )
    ) {
      deleteComplex(currentComplex.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-5xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white relative shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                  Edición Independiente de Cliente
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  ID: {complex.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {complex.license?.isEnabled ? "Habilitado" : "Bloqueado"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {complex.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-700/60 pt-4 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveTab("GENERAL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === "GENERAL"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-100"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>General & Contacto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CREDENTIALS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === "CREDENTIALS"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-100"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Credenciales Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("COURTS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === "COURTS"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-100"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Canchas & Precios ({courtsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("OPERATIONS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === "OPERATIONS"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-100"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Cobros & Horarios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("LICENSE")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === "LICENSE"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-100"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Licencia 30 Días</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveAll} className="p-6 overflow-y-auto flex-1 space-y-6">
          {feedback && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fadeIn flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{feedback}</span>
            </div>
          )}

          {/* TAB 1: GENERAL & CONTACT */}
          {activeTab === "GENERAL" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nombre del Complejo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Slug Identificador de URL *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Usado para los enlaces: ?view=admin&c={slug || "slug"} y ?view=portal&c={slug || "slug"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cliente / Propietario *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    WhatsApp / Teléfono
                  </label>
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Modo de Pantalla Predeterminado
                  </label>
                  <select
                    value={themeMode}
                    onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="light">☀️ Modo Claro (Blanco)</option>
                    <option value="dark">🌙 Modo Oscuro (Noche)</option>
                    <option value="system">💻 Automático (Sistema)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Paleta de Estilo & Color de Marca
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={themePreset}
                      onChange={(e) => {
                        const pid = e.target.value as ThemePresetId;
                        setThemePreset(pid);
                        if (pid !== "custom") {
                          const p = getThemePreset(pid);
                          setPrimaryColor(p.primaryColor);
                          setSecondaryColor(p.secondaryColor);
                        }
                      }}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {THEME_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.suggestedSports})
                        </option>
                      ))}
                      <option value="custom">Personalizado (Selector Hex)</option>
                    </select>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setThemePreset("custom");
                      }}
                      className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 shrink-0"
                      title="Color Primario"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dirección Física
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Notas Internas del Super Administrador
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones de pago, acuerdos comerciales o requerimientos particulares..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS */}
          {activeTab === "CREDENTIALS" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-200">
                <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  Configura el usuario y la clave exclusivos para que este cliente ingrese a su portal de administración. Cada cliente tiene sus propias credenciales independientes.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Usuario Administrador
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Contraseña Administrador
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COURTS & PRICING */}
          {activeTab === "COURTS" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Canchas pertenecientes a este cliente
                </span>
                <span className="text-xs text-slate-500">
                  {courtsList.length} canchas activas
                </span>
              </div>

              <div className="space-y-3">
                {courtsList.map((court, idx) => (
                  <div
                    key={court.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <input
                        type="text"
                        value={court.name}
                        onChange={(e) => handleCourtNameChange(court.id, e.target.value)}
                        className="w-full font-bold text-sm text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                      />
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold">
                          {court.typeName || "Deporte"}
                        </span>
                        <span className="truncate">{court.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500 font-medium">Precio/Hora:</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">$</span>
                        <input
                          type="number"
                          step={500}
                          value={court.pricePerHour}
                          onChange={(e) => handleCourtPriceChange(court.id, Number(e.target.value))}
                          className="w-28 pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-black font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OPERATIONS & PAYMENTS */}
          {activeTab === "OPERATIONS" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Horario de Apertura
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Horario de Cierre
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    % de Seña Requerida al Reservar
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={depositPercentage}
                      onChange={(e) => setDepositPercentage(Number(e.target.value))}
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Anticipación Mínima Cancelación (Horas)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={72}
                      value={cancellationPolicyHours}
                      onChange={(e) => setCancellationPolicyHours(Number(e.target.value))}
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Datos de Cobro Bancarios & Mercado Pago
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Banco / Entidad
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Banco Galicia"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Titular de la Cuenta
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del Titular"
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      CBU / CVU Bancario
                    </label>
                    <input
                      type="text"
                      placeholder="00000031..."
                      value={cbuCvu}
                      onChange={(e) => setCbuCvu(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Alias Bancario
                    </label>
                    <input
                      type="text"
                      placeholder="CANCHAS.PAGOS"
                      value={bankAlias}
                      onChange={(e) => setBankAlias(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Alias o Email Mercado Pago
                    </label>
                    <input
                      type="text"
                      placeholder="canchas.mp o pagos@canchas.com"
                      value={mpAlias}
                      onChange={(e) => setMpAlias(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LICENSE & 30 DAYS */}
          {activeTab === "LICENSE" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Fecha y Hora de Expiración Actual:
                      </div>
                      <div className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
                        {formatLicenseDateTime(
                          currentComplex.license?.expiresAt || "",
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleActive}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      currentComplex.license?.isEnabled
                        ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {currentComplex.license?.isEnabled ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pausar / Bloquear Panel</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Habilitar Panel</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-indigo-100/60 dark:border-indigo-800/40">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    Extensión Rápida de Días:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddDays(30)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span>+30 Días</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddDays(60)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      +60 Días
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddDays(90)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      +90 Días
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Panel</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
