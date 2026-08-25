import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Upload,
  Download,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  Globe,
  Copy,
  ExternalLink,
  Check,
  Share2,
  DollarSign,
  Building2,
  CreditCard,
  Wifi,
  Coffee,
  MapPin,
  FileText,
  CheckSquare,
  Compass,
  Image as ImageIcon,
  Plus,
  Trash2,
  Palette,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Layers,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../lib/currency";
import { slugify, buildComplexPortalUrl, buildComplexAdminUrl } from "../../lib/slugify";
import { SharePortalModal } from "../common/SharePortalModal";
import {
  THEME_PRESETS,
  ThemePresetId,
  ThemeMode,
  getThemePreset,
} from "../../lib/themePresets";

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToInitialData,
    exportBackupJSON,
    importBackupJSON,
    activeUser,
    setThemeMode: setContextThemeMode,
    setThemePreset: setContextThemePreset,
    theme: currentTheme,
  } = useApp();

  const [complexName, setComplexName] = useState(settings.complexName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    settings.themeMode || "light",
  );
  const [themePreset, setThemePresetState] = useState<string>(
    settings.themePreset || "emerald",
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    settings.primaryColor || "#059669",
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    settings.secondaryColor || "#10b981",
  );
  const [currency, setCurrency] = useState(settings.currencySymbol || "$");
  const [primaryCurrency, setPrimaryCurrency] = useState<"ARS" | "USD">(
    settings.primaryCurrency || "ARS",
  );
  const [exchangeRateUsdToArs, setExchangeRateUsdToArs] = useState<number>(
    settings.exchangeRateUsdToArs || 1200,
  );
  const [displayCurrencyAdmin, setDisplayCurrencyAdmin] = useState<
    "ARS" | "USD" | "BOTH"
  >(settings.displayCurrencyAdmin || "ARS");
  const [displayCurrencyClient, setDisplayCurrencyClient] = useState<
    "ARS" | "USD" | "BOTH"
  >(settings.displayCurrencyClient || "ARS");
  const [depositPercentage, setDepositPercentage] = useState(
    settings.depositPercentage,
  );

  // Bank Transfer & Payment Details
  const [bankName, setBankName] = useState(
    settings.bankDetails?.bankName || "Banco Galicia",
  );
  const [accountHolder, setAccountHolder] = useState(
    settings.bankDetails?.accountHolder || "Complejo Deportivo S.R.L.",
  );
  const [cbuCvu, setCbuCvu] = useState(
    settings.bankDetails?.cbuCvu || "0000003100087654321098",
  );
  const [alias, setAlias] = useState(
    settings.bankDetails?.alias || "CANCHAS.RESERVAS.MP",
  );
  const [cuitCuil, setCuitCuil] = useState(
    settings.bankDetails?.cuitCuil || "30-71829384-9",
  );

  // Mercado Pago Details
  const [mpAccountHolder, setMpAccountHolder] = useState(
    settings.mercadoPagoDetails?.accountHolder ||
      settings.complexName ||
      "Complejo Deportivo",
  );
  const [mpAliasOrEmail, setMpAliasOrEmail] = useState(
    settings.mercadoPagoDetails?.mpAliasOrEmail || "complejo.mp",
  );
  const [cvuMp, setCvuMp] = useState(
    settings.mercadoPagoDetails?.cvuMp || "0000003100099887766554",
  );
  const [cuitCuilMp, setCuitCuilMp] = useState(
    settings.mercadoPagoDetails?.cuitCuilMp || "30-71829384-9",
  );
  const [checkoutLinkMp, setCheckoutLinkMp] = useState(
    settings.mercadoPagoDetails?.checkoutLinkMp || "",
  );
  const [notesMp, setNotesMp] = useState(
    settings.mercadoPagoDetails?.notesMp ||
      "Transferir la seña al Alias/CVU de Mercado Pago o mediante Link.",
  );

  const [cashPaymentNotes, setCashPaymentNotes] = useState(
    settings.cashPaymentNotes ||
      "Abonar en recepción del complejo antes del inicio del turno.",
  );

  // Public Portal Amenities & Features
  const [customPortalUrl, setCustomPortalUrl] = useState(
    settings.customPortalUrl || "",
  );
  const [showCarousel, setShowCarousel] = useState(
    settings.showCarousel !== false,
  );
  const [carouselImages, setCarouselImages] = useState<string[]>(
    settings.carouselImages || [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80",
    ],
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showPublicServices, setShowPublicServices] = useState(
    settings.showPublicServices !== false,
  );
  const [showWifiSection, setShowWifiSection] = useState(
    settings.showWifiSection !== false,
  );
  const [showBarSection, setShowBarSection] = useState(
    settings.showBarSection !== false,
  );
  const [showRulesSection, setShowRulesSection] = useState(
    settings.showRulesSection !== false,
  );
  const [showGoogleMapsBtn, setShowGoogleMapsBtn] = useState(
    settings.showGoogleMapsBtn !== false,
  );
  const [wifiName, setWifiName] = useState(
    settings.wifiName || "Complejo_Invitados_5G",
  );
  const [wifiPassword, setWifiPassword] = useState(
    settings.wifiPassword || "padelyfutbol2026",
  );
  const [barInfo, setBarInfo] = useState(
    settings.barInfo ||
      "Abierto todos los días de 17:00 a 01:00 hs. Hamburguesas, minutas, pizzas, cerveza tirada y bebidas.",
  );
  const [complexRules, setComplexRules] = useState(
    settings.complexRules ||
      "Calzado deportivo sin tapones metálicos. Tolerancia de 10 min por turno. Cancelaciones con 24hs de anticipación.",
  );
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    settings.googleMapsUrl || "https://maps.google.com/?q=-34.5453,-58.4497",
  );
  const [amenitiesInput, setAmenitiesInput] = useState(
    (
      settings.amenitiesList || [
        "Wi-Fi Gratis",
        "Bar & Canteen",
        "Estacionamiento",
        "Vestuarios con Duchas",
        "Iluminación LED Pro",
      ]
    ).join(", "),
  );

  useEffect(() => {
    setComplexName(settings.complexName);
    setLogoUrl(settings.logoUrl || "");
    setAddress(settings.address);
    setPhone(settings.phone);
    setWhatsapp(settings.whatsapp);
    setCurrency(settings.currencySymbol || "$");
    setPrimaryCurrency(settings.primaryCurrency || "ARS");
    setExchangeRateUsdToArs(settings.exchangeRateUsdToArs || 1200);
    setDisplayCurrencyAdmin(settings.displayCurrencyAdmin || "ARS");
    setDisplayCurrencyClient(settings.displayCurrencyClient || "ARS");
    setDepositPercentage(settings.depositPercentage);
    setBankName(settings.bankDetails?.bankName || "Banco Galicia");
    setAccountHolder(
      settings.bankDetails?.accountHolder || "Complejo Deportivo S.R.L.",
    );
    setCbuCvu(settings.bankDetails?.cbuCvu || "0000003100087654321098");
    setAlias(settings.bankDetails?.alias || "CANCHAS.RESERVAS.MP");
    setCuitCuil(settings.bankDetails?.cuitCuil || "30-71829384-9");
    setMpAccountHolder(
      settings.mercadoPagoDetails?.accountHolder ||
        settings.complexName ||
        "Complejo Deportivo",
    );
    setMpAliasOrEmail(
      settings.mercadoPagoDetails?.mpAliasOrEmail || "complejo.mp",
    );
    setCvuMp(settings.mercadoPagoDetails?.cvuMp || "0000003100099887766554");
    setCuitCuilMp(settings.mercadoPagoDetails?.cuitCuilMp || "30-71829384-9");
    setCheckoutLinkMp(settings.mercadoPagoDetails?.checkoutLinkMp || "");
    setNotesMp(
      settings.mercadoPagoDetails?.notesMp ||
        "Transferir la seña al Alias/CVU de Mercado Pago o mediante Link.",
    );
    setCashPaymentNotes(
      settings.cashPaymentNotes ||
        "Abonar en recepción del complejo antes del inicio del turno.",
    );

    setCustomPortalUrl(settings.customPortalUrl || "");
    setShowCarousel(settings.showCarousel !== false);
    setCarouselImages(
      settings.carouselImages || [
        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80",
      ],
    );
    setShowPublicServices(settings.showPublicServices !== false);
    setShowWifiSection(settings.showWifiSection !== false);
    setShowBarSection(settings.showBarSection !== false);
    setShowRulesSection(settings.showRulesSection !== false);
    setShowGoogleMapsBtn(settings.showGoogleMapsBtn !== false);
    setWifiName(settings.wifiName || "Complejo_Invitados_5G");
    setWifiPassword(settings.wifiPassword || "padelyfutbol2026");
    setBarInfo(
      settings.barInfo ||
        "Abierto todos los días de 17:00 a 01:00 hs. Hamburguesas, minutas, pizzas, cerveza tirada y bebidas.",
    );
    setComplexRules(
      settings.complexRules ||
        "Calzado deportivo sin tapones metálicos. Tolerancia de 10 min por turno. Cancelaciones con 24hs de anticipación.",
    );
    setGoogleMapsUrl(
      settings.googleMapsUrl || "https://maps.google.com/?q=-34.5453,-58.4497",
    );
    setThemeModeState(settings.themeMode || "light");
    setThemePresetState(settings.themePreset || "emerald");
    setPrimaryColor(settings.primaryColor || "#059669");
    setSecondaryColor(settings.secondaryColor || "#10b981");
    setAmenitiesInput(
      (
        settings.amenitiesList || [
          "Wi-Fi Gratis",
          "Bar & Canteen",
          "Estacionamiento",
          "Vestuarios con Duchas",
          "Iluminación LED Pro",
        ]
      ).join(", "),
    );
  }, [settings]);

  const [savedFeedback, setSavedFeedback] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSelectPreset = (presetId: ThemePresetId) => {
    const preset = getThemePreset(presetId);
    setThemePresetState(presetId);
    setPrimaryColor(preset.primaryColor);
    setSecondaryColor(preset.secondaryColor);
    setContextThemePreset(presetId);
  };

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setContextThemeMode(mode);
  };

  const getPublicPortalUrl = () => {
    return buildComplexPortalUrl({
      complexName: complexName || settings.complexName,
      customPortalUrl: customPortalUrl,
      id: settings.complexName ? slugify(settings.complexName) : undefined,
    });
  };

  const getAdminPortalUrl = () => {
    return buildComplexAdminUrl({
      complexName: complexName || settings.complexName,
      customPortalUrl: customPortalUrl,
      id: settings.complexName ? slugify(settings.complexName) : undefined,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPublicPortalUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert(
          "La imagen es demasiado grande. Por favor selecciona un archivo menor a 3MB.",
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmenities = amenitiesInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    updateSettings({
      complexName,
      logoUrl,
      address,
      phone,
      whatsapp,
      themeMode,
      themePreset,
      primaryColor,
      secondaryColor,
      currencySymbol: primaryCurrency === "USD" ? "US$" : "$",
      primaryCurrency,
      exchangeRateUsdToArs,
      displayCurrencyAdmin,
      displayCurrencyClient,
      depositPercentage,
      bankDetails: {
        bankName,
        accountHolder,
        cbuCvu,
        alias,
        cuitCuil,
      },
      mercadoPagoDetails: {
        accountHolder: mpAccountHolder,
        mpAliasOrEmail,
        cvuMp,
        cuitCuilMp,
        checkoutLinkMp,
        notesMp,
      },
      cashPaymentNotes,
      customPortalUrl,
      showCarousel,
      carouselImages,
      showPublicServices,
      showWifiSection,
      showBarSection,
      showRulesSection,
      showGoogleMapsBtn,
      wifiName,
      wifiPassword,
      barInfo,
      complexRules,
      googleMapsUrl,
      amenitiesList:
        parsedAmenities.length > 0
          ? parsedAmenities
          : [
              "Wi-Fi Gratis",
              "Bar & Canteen",
              "Estacionamiento",
              "Vestuarios con Duchas",
              "Iluminación LED Pro",
            ],
    });

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = importBackupJSON(json);
        if (res.success) {
          alert("Copia de seguridad restaurada correctamente.");
          window.location.reload();
        } else {
          alert("Error al importar copia de seguridad.");
        }
      } catch (err) {
        alert("Archivo JSON no válido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Configuración del Complejo & Backups
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalizá datos institucionales, porcentaje de seña, respaldos y
            reinicio de datos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {savedFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuración guardada exitosamente.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Logo del Complejo */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Logo del Complejo Deportivo</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview */}
              <div className="relative shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-md bg-white dark:bg-slate-900"
                    onError={() => setLogoUrl("")}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-2xl shadow-md ring-2 ring-white/20">
                    {complexName
                      ? complexName.substring(0, 2).toUpperCase()
                      : "RM"}
                  </div>
                )}
              </div>

              {/* Upload & Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir imagen de logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer"
                    >
                      Quitar Logo
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    O pega la URL directa de una imagen (https://...):
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://ejemplo.com/mi-logo.png"
                    className="w-full px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold">
                  Nombre del Complejo Deportivo
                </label>
                {complexName && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    slug: {slugify(complexName)}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={complexName}
                onChange={(e) => setComplexName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                placeholder="Ej: Padel Club Central"
                required
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                El enlace de tu portal público usará automáticamente este nombre en su dirección web.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Dirección / Ubicación
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                WhatsApp Institucional
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Porcentaje de Seña Mínimo (%)
              </label>
              <input
                type="number"
                value={depositPercentage}
                onChange={(e) => setDepositPercentage(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                required
              />
            </div>

            {/* Configuración de Tema, Modo y Estilo Visual Propio del Complejo */}
            <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Estilo Visual & Tema del Complejo</span>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        Independiente
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Personalizá el modo claro/oscuro y los colores de marca propios de este club, sin afectar a los demás administradores.
                    </p>
                  </div>
                </div>

                {/* Live Mode Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Tema actual:
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-sm">
                    {themeMode === "dark" ? (
                      <>
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Modo Oscuro</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Modo Claro</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Selector de Modo (Claro / Oscuro / Sistema) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Modo de Color Predeterminado del Panel y Portal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleThemeModeChange("light")}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      themeMode === "light"
                        ? "bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm"
                        : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/60">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Modo Claro</span>
                        {themeMode === "light" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Fondo blanco limpio con máximo contraste para día.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeModeChange("dark")}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      themeMode === "dark"
                        ? "bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm"
                        : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800/60">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Modo Oscuro</span>
                        {themeMode === "dark" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Fondo oscuro profesional para clubes nocturnos e indoor.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeModeChange("system")}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      themeMode === "system"
                        ? "bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm"
                        : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Automático</span>
                        {themeMode === "system" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Se adapta a la configuración del sistema operativo.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Selector de Presets de Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Paleta de Colores & Identidad del Club
                  </label>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Hacé clic en un estilo para aplicarlo en tiempo real
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {THEME_PRESETS.map((p) => {
                    const isSelected =
                      themePreset === p.id ||
                      (!themePreset && p.id === "emerald");
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/25 shadow-md"
                            : "bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {p.name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </div>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-2">
                            {p.category}
                          </span>
                        </div>

                        {/* Color swatches */}
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {p.previewColors.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-4 h-4 rounded-full border border-black/10 shadow-sm shrink-0"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[90px]">
                            {p.suggestedSports}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colores Personalizados (Hex Pickers) */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Ajuste Fino de Colores de Marca
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    CSS Variables (--brand-primary)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Color Primario (Botones, Destacados y Acentos)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          setThemePresetState("custom");
                          updateSettings({
                            primaryColor: e.target.value,
                            themePreset: "custom",
                          });
                        }}
                        className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          setThemePresetState("custom");
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                        placeholder="#059669"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Color Secundario / Gradientes
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => {
                          setSecondaryColor(e.target.value);
                          setThemePresetState("custom");
                          updateSettings({
                            secondaryColor: e.target.value,
                            themePreset: "custom",
                          });
                        }}
                        className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => {
                          setSecondaryColor(e.target.value);
                          setThemePresetState("custom");
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                  style={{
                    background:
                      themeMode === "dark"
                        ? "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))"
                        : "linear-gradient(135deg, rgba(248,250,252,0.95), rgba(241,245,249,0.95))",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      ✓
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Vista previa de botones y acentos:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-sm cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Botón Principal
                    </button>
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                        backgroundColor: `${primaryColor}15`,
                      }}
                    >
                      Insignia Activa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración Completa de Moneda y Divisa (ARS / USD) */}
            <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 mt-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Moneda, Divisa y Cotización (Dólar / Peso Argentino)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Elegí la divisa base, el valor del dólar y en qué moneda
                      se mostrarán los precios en el portal y en la
                      administración.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Moneda Base de las Tarifas */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Moneda Base para Tarifas de Canchas
                  </label>
                  <select
                    value={primaryCurrency}
                    onChange={(e) =>
                      setPrimaryCurrency(e.target.value as "ARS" | "USD")
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="ARS">Pesos Argentinos ($ ARS)</option>
                    <option value="USD">
                      Dólares Estadounidenses (US$ USD)
                    </option>
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Moneda en la que cargás el precio por hora de cada cancha.
                  </p>
                </div>

                {/* Valor de la Divisa (Cotización USD -> ARS) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Valor de la Divisa / Cotización (1 USD = $ ARS)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={exchangeRateUsdToArs}
                      onChange={(e) =>
                        setExchangeRateUsdToArs(
                          Math.max(1, Number(e.target.value)),
                        )
                      }
                      className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Monto en Pesos equivalente a 1 Dólar para la conversión.
                  </p>
                </div>

                {/* Moneda a mostrar en Portal del Cliente */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Moneda a Mostrar en Portal del Cliente
                  </label>
                  <select
                    value={displayCurrencyClient}
                    onChange={(e) =>
                      setDisplayCurrencyClient(
                        e.target.value as "ARS" | "USD" | "BOTH",
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="ARS">Solo Pesos Argentinos ($ ARS)</option>
                    <option value="USD">Solo Dólares (US$ USD)</option>
                    <option value="BOTH">
                      Ambas Monedas ($ ARS / US$ USD)
                    </option>
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Cómo verán los valores tus clientes al realizar una reserva
                    online.
                  </p>
                </div>

                {/* Moneda a mostrar en Panel Administrador */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Moneda a Mostrar en Panel de Administrador
                  </label>
                  <select
                    value={displayCurrencyAdmin}
                    onChange={(e) =>
                      setDisplayCurrencyAdmin(
                        e.target.value as "ARS" | "USD" | "BOTH",
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="ARS">Solo Pesos Argentinos ($ ARS)</option>
                    <option value="USD">Solo Dólares (US$ USD)</option>
                    <option value="BOTH">
                      Ambas Monedas ($ ARS / US$ USD)
                    </option>
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Cómo se visualizarán los montos e ingresos en el panel
                    interno.
                  </p>
                </div>
              </div>

              {/* Vista Previa interactiva */}
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                    Vista previa de muestra (Monto:{" "}
                    {primaryCurrency === "ARS" ? "$ 12.000 ARS" : "US$ 10 USD"}
                    ):
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-extrabold text-[11px]">
                    Cliente:{" "}
                    {formatCurrency(
                      primaryCurrency === "ARS" ? 12000 : 10,
                      {
                        primaryCurrency,
                        exchangeRateUsdToArs,
                        displayCurrencyClient,
                      },
                      "client",
                    )}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px]">
                    Admin:{" "}
                    {formatCurrency(
                      primaryCurrency === "ARS" ? 12000 : 10,
                      {
                        primaryCurrency,
                        exchangeRateUsdToArs,
                        displayCurrencyAdmin,
                      },
                      "admin",
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Información para el Portal Público (Wi-Fi, Bar, Google Maps, Reglas) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>
                  Información del Portal Público (Wi-Fi, Bar, Ubicación y
                  Reglas)
                </span>
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                Visible para clientes
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              {/* URL Personalizada del Portal */}
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Enlace / URL Personalizada del Portal de Reservas (Opcional)
                    </span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 w-fit">
                    Configuración de Clientes
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Si tenés un dominio o enlace web propio para tus clientes,
                  ingresalo aquí. Si lo dejás en blanco, se usará el link
                  automático con{" "}
                  <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-[10px]">
                    ?view=portal
                  </code>
                  .
                </p>
                <input
                  type="text"
                  value={customPortalUrl}
                  onChange={(e) => setCustomPortalUrl(e.target.value)}
                  placeholder="Ej: https://misreservas.com o https://mipagina.com/portal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {/* Active Link Preview & Direct Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        Link Configurado para Clientes:
                      </p>
                      <p className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200 truncate">
                        {getPublicPortalUrl()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                      title="Copiar enlace al portapapeles"
                    >
                      {copiedLink ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedLink ? "¡Copiado!" : "Copiar Link"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 transition-all cursor-pointer"
                      title="Ver opciones de compartir y QR"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Compartir</span>
                    </button>

                    <a
                      href={getPublicPortalUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition-all"
                      title="Probar y abrir portal en nueva pestaña"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Probar</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Sección Carrusel de Imágenes */}
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Carrusel de Imágenes del Portal de Reservas</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Podés mostrar u ocultar un carrusel de imágenes destacadas
                      del complejo (canchas, instalaciones, buffet) en la
                      portada del Portal de Reservas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCarousel(!showCarousel)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2 ${
                      showCarousel
                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {showCarousel
                      ? "Visibilidad: ACTIVADA (Visible)"
                      : "Visibilidad: OCULTA"}
                  </button>
                </div>

                {showCarousel && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Fotos cargadas en el carrusel ({carouselImages.length}):
                      </span>
                      {carouselImages.length === 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setCarouselImages([
                              "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80",
                              "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
                              "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80",
                            ])
                          }
                          className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                        >
                          Restablecer fotos predeterminadas
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {carouselImages.map((imgUrl, index) => (
                        <div
                          key={index}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 aspect-video shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex items-end justify-between">
                            <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                              Foto #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setCarouselImages(
                                  carouselImages.filter((_, i) => i !== index),
                                )
                              }
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                              title="Eliminar foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Quitar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Agregar nueva URL de foto */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Ingresá el enlace/URL de una imagen (https://...)"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newImageUrl.trim()) {
                            setCarouselImages([
                              ...carouselImages,
                              newImageUrl.trim(),
                            ]);
                            setNewImageUrl("");
                          }
                        }}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar Foto</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle: Mostrar / Ocultar Servicios en Portal Público */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    Mostrar sección de Servicios (Wi-Fi, Bar, Reglas y
                    Ubicación) en el Portal
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Activá esta opción para mostrar los datos de Wi-Fi, menú del
                    buffet y reglas a tus clientes en el Portal. Si la
                    desactivás, se ocultará por completo.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPublicServices(!showPublicServices)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2 ${
                    showPublicServices
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {showPublicServices
                    ? "Visibilidad: ACTIVADA (Visible)"
                    : "Visibilidad: OCULTA"}
                </button>
              </div>

              {/* Google Maps Link & Toggle */}
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Enlace de Ubicación y Botón "Cómo Llegar" (Google Maps)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGoogleMapsBtn(!showGoogleMapsBtn)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      showGoogleMapsBtn
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400"
                    }`}
                  >
                    {showGoogleMapsBtn ? "✓ Botón Visible" : "✗ Botón Oculto"}
                  </button>
                </div>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="Ej: https://maps.google.com/?q=-34.5453,-58.4497"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              {/* Wi-Fi Details & Toggle */}
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-blue-500" />
                    Tarjeta de Wi-Fi para Clientes
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowWifiSection(!showWifiSection)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      showWifiSection
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400"
                    }`}
                  >
                    {showWifiSection ? "✓ Wi-Fi Visible" : "✗ Wi-Fi Oculto"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 mb-1">
                      Nombre Red Wi-Fi (SSID)
                    </span>
                    <input
                      type="text"
                      value={wifiName}
                      onChange={(e) => setWifiName(e.target.value)}
                      placeholder="Ej: Wifi_Invitados_5G"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 mb-1">
                      Contraseña de Wi-Fi
                    </span>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Ej: padelyfutbol2026"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Bar / Canteen Info & Toggle */}
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-amber-500" />
                    Tarjeta del Bar / Buffet / Canteen
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBarSection(!showBarSection)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      showBarSection
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400"
                    }`}
                  >
                    {showBarSection ? "✓ Bar Visible" : "✗ Bar Oculto"}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={barInfo}
                  onChange={(e) => setBarInfo(e.target.value)}
                  placeholder="Ej: Abierto de 17:00 a 01:00 hs. Contamos con hamburguesas gourmet, pizzas, cerveza tirada y bebidas de hidratación."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                />
              </div>

              {/* Reglamento y Normas & Toggle */}
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Tarjeta del Reglamento y Normas
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRulesSection(!showRulesSection)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      showRulesSection
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400"
                    }`}
                  >
                    {showRulesSection
                      ? "✓ Reglamento Visible"
                      : "✗ Reglamento Oculto"}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={complexRules}
                  onChange={(e) => setComplexRules(e.target.value)}
                  placeholder="Ej: Calzado deportivo obligatorio. Tolerancia 10 minutos. Cancelaciones con 24hs de anticipación."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                />
              </div>

              {/* Amenities List */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  Servicios e Instalaciones (separados por coma)
                </label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="Ej: Wi-Fi Gratis, Bar & Canteen, Estacionamiento, Vestuarios con Duchas, Iluminación LED Pro, Parrillas"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Medios de Pago & Datos Bancarios */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-6">
            {/* Section 1: Transferencia Bancaria */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Datos Bancarios para Transferencia Directa (CBU/CVU)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Banco / Entidad Financiera
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ej: Banco Galicia, Brubank"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Titular de la Cuenta
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Ej: Complejo Deportivo S.R.L."
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CBU / CVU (22 dígitos)
                  </label>
                  <input
                    type="text"
                    value={cbuCvu}
                    onChange={(e) => setCbuCvu(e.target.value)}
                    placeholder="Ej: 0000003100087654321098"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alias CBU / CVU
                  </label>
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Ej: CANCHAS.PADEL.FUTBOL"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CUIT / CUIL
                  </label>
                  <input
                    type="text"
                    value={cuitCuil}
                    onChange={(e) => setCuitCuil(e.target.value)}
                    placeholder="Ej: 30-71829384-9"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Mercado Pago Configuration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Configuración de Mercado Pago</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Titular Cuenta Mercado Pago
                  </label>
                  <input
                    type="text"
                    value={mpAccountHolder}
                    onChange={(e) => setMpAccountHolder(e.target.value)}
                    placeholder="Ej: Complejo Deportivo"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alias / Email Mercado Pago
                  </label>
                  <input
                    type="text"
                    value={mpAliasOrEmail}
                    onChange={(e) => setMpAliasOrEmail(e.target.value)}
                    placeholder="Ej: mi.complejo.mp"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CVU Mercado Pago
                  </label>
                  <input
                    type="text"
                    value={cvuMp}
                    onChange={(e) => setCvuMp(e.target.value)}
                    placeholder="Ej: 0000003100099887766554"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CUIT / CUIL Titular MP
                  </label>
                  <input
                    type="text"
                    value={cuitCuilMp}
                    onChange={(e) => setCuitCuilMp(e.target.value)}
                    placeholder="Ej: 30-71829384-9"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link de Pago Mercado Pago (Opcional)
                  </label>
                  <input
                    type="url"
                    value={checkoutLinkMp}
                    onChange={(e) => setCheckoutLinkMp(e.target.value)}
                    placeholder="Ej: https://mpago.la/pos/123456"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Instrucciones / Notas Mercado Pago
                  </label>
                  <input
                    type="text"
                    value={notesMp}
                    onChange={(e) => setNotesMp(e.target.value)}
                    placeholder="Ej: Enviar comprobante por WhatsApp una vez transferido"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Pago en Efectivo */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Indicaciones para Pago en Efectivo / Recepción
              </label>
              <input
                type="text"
                value={cashPaymentNotes}
                onChange={(e) => setCashPaymentNotes(e.target.value)}
                placeholder="Ej: Abonar en la caja del complejo 10 minutos antes del turno"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Restore Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Copias de Seguridad (Backup & Restore)
        </h3>
        <p className="text-xs text-slate-500">
          Descargá todos tus datos en JSON para respaldar o transferir entre
          dispositivos.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={exportBackupJSON}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Backup JSON</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restaurar desde JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Resetear a Datos de Demostración</span>
          </button>
        </div>
      </div>

      {/* Modal: Confirmation Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              ¿Restablecer Datos Iniciales?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Esta acción revertirá todas las reservas, canchas, deportes y
              clientes a los datos de prueba iniciales de fábrica.
            </p>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToInitialData();
                  setShowResetConfirm(false);
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Sí, Resetear Todo
              </button>
            </div>
          </div>
        </div>
      )}

      <SharePortalModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        customUrl={getPublicPortalUrl()}
      />
    </div>
  );
};
