import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Upload,
  Download,
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
  Image as ImageIcon,
  Plus,
  Trash2,
  Palette,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Banknote,
  QrCode,
  Info,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../lib/currency";
import { slugify, buildComplexPortalUrl, buildComplexAdminUrl, copyToClipboard } from "../../lib/slugify";
import { SharePortalModal } from "../common/SharePortalModal";
import {
  THEME_PRESETS,
  ThemePresetId,
  ThemeMode,
  getThemePreset,
} from "../../lib/themePresets";

interface SettingsViewProps {
  onOpenPublicPortal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenPublicPortal,
}) => {
  const {
    settings,
    updateSettings,
    resetToInitialData,
    exportBackupJSON,
    importBackupJSON,
    setThemeMode: setContextThemeMode,
    setThemePreset: setContextThemePreset,
    activeComplex,
    activeComplexId,
  } = useApp();

  const lastLoadedComplexIdRef = useRef<string | null>(null);

  const [complexName, setComplexName] = useState(settings.complexName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [ownerName, setOwnerName] = useState(activeComplex?.ownerName || "");
  const [email, setEmail] = useState(
    settings.email || activeComplex?.ownerEmail || "",
  );
  const [defaultOpeningTime, setDefaultOpeningTime] = useState(
    settings.defaultOpeningTime || "08:00",
  );
  const [defaultClosingTime, setDefaultClosingTime] = useState(
    settings.defaultClosingTime || "23:00",
  );
  const [cancellationPolicyHours, setCancellationPolicyHours] = useState(
    settings.cancellationPolicyHours !== undefined
      ? settings.cancellationPolicyHours
      : 4,
  );
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
    // Only reload form states if the active complex changed, or on first mount
    if (activeComplexId !== lastLoadedComplexIdRef.current) {
      lastLoadedComplexIdRef.current = activeComplexId;
      setComplexName(settings.complexName);
      setLogoUrl(settings.logoUrl || "");
      setAddress(settings.address);
      setPhone(settings.phone);
      setWhatsapp(settings.whatsapp);
      setOwnerName(activeComplex?.ownerName || "");
      setEmail(settings.email || activeComplex?.ownerEmail || "");
      setDefaultOpeningTime(settings.defaultOpeningTime || "08:00");
      setDefaultClosingTime(settings.defaultClosingTime || "23:00");
      setCancellationPolicyHours(
        settings.cancellationPolicyHours !== undefined
          ? settings.cancellationPolicyHours
          : 4,
      );
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
    }
  }, [activeComplexId, settings, activeComplex]);

  // Per-card save feedback state
  const [savedCard, setSavedCard] = useState<string | null>(null);
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
    const effectiveName = (complexName || settings.complexName || activeComplex?.name || "").trim();
    const isCustomFullUrl = Boolean(customPortalUrl && /^https?:\/\//i.test(customPortalUrl.trim()));
    return buildComplexPortalUrl({
      complexName: effectiveName,
      slug: slugify(effectiveName) || activeComplex?.slug,
      customPortalUrl: isCustomFullUrl ? customPortalUrl.trim() : undefined,
      id: activeComplexId,
    });
  };

  const handleCopyLink = async () => {
    handleSaveSection("general");
    await copyToClipboard(getPublicPortalUrl());
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

  // Helper to compile and save all configuration settings
  const handleSaveSection = (sectionId: string) => {
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
      email,
      defaultOpeningTime,
      defaultClosingTime,
      cancellationPolicyHours: Number(cancellationPolicyHours) || 4,
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
      customPortalUrl:
        customPortalUrl && /^https?:\/\//i.test(customPortalUrl.trim())
          ? customPortalUrl.trim()
          : slugify(complexName),
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
      ...(ownerName ? { ownerName } : {}),
    });

    setSavedCard(sectionId);
    setTimeout(() => {
      setSavedCard((prev) => (prev === sectionId ? null : prev));
    }, 2500);
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

  // Reusable Save Button Component for each Card
  const SaveCardButton: React.FC<{
    sectionId: string;
    label?: string;
  }> = ({ sectionId, label = "Guardar Cambios" }) => {
    const isSaved = savedCard === sectionId;
    return (
      <button
        type="button"
        onClick={() => handleSaveSection(sectionId)}
        style={
          isSaved
            ? {}
            : {
                backgroundColor: primaryColor,
                boxShadow: `0 4px 14px -2px ${primaryColor}40`,
              }
        }
        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0 ${
          isSaved
            ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50"
            : "text-white hover:opacity-90"
        }`}
      >
        {isSaved ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-100 animate-pulse" />
            <span>¡Guardado con éxito!</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Configuración del Complejo & Parámetros
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Cada sección cuenta con su propio botón de guardado individual para que apliques cambios de forma rápida e independiente.
          </p>
        </div>

        <SaveCardButton sectionId="all" label="Guardar Todo" />
      </div>

      {/* 1. TARJETA: LOGO DEL COMPLEJO */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-200 dark:border-blue-800/60">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Logo e Identidad Visual del Complejo
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Se muestra en la barra superior, comprobantes y portal de reservas.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="logo" label="Guardar Logo" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
          {/* Preview */}
          <div className="relative shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo Preview"
                style={{ borderColor: primaryColor }}
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-md bg-white dark:bg-slate-800"
                onError={() => setLogoUrl("")}
              />
            ) : (
              <div
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
                className="w-24 h-24 rounded-2xl text-white flex items-center justify-center font-black text-3xl shadow-md ring-2 ring-white/20"
              >
                {complexName
                  ? complexName.substring(0, 2).toUpperCase()
                  : "CD"}
              </div>
            )}
          </div>

          {/* Upload & Controls */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <label
                style={{ backgroundColor: primaryColor }}
                className="px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir imagen de logo (JPG / PNG)</span>
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
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Quitar Logo
                </button>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                O pegá la URL directa de una imagen web (https://...):
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://ejemplo.com/mi-logo.png"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TARJETA: INFORMACIÓN GENERAL DEL COMPLEJO */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-200 dark:border-emerald-800/60">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Datos Institucionales & Contacto
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Nombre del club, ubicación, teléfonos de atención y porcentaje de seña.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="general" label="Guardar Datos Generales" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Nombre del Complejo Deportivo
              </label>
              {complexName && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  slug: {slugify(complexName)}
                </span>
              )}
            </div>
            <input
              type="text"
              value={complexName}
              onChange={(e) => {
                const val = e.target.value;
                setComplexName(val);
                if (!customPortalUrl || !/^https?:\/\//i.test(customPortalUrl)) {
                  setCustomPortalUrl(slugify(val));
                }
              }}
              onBlur={() => {
                handleSaveSection("general");
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              placeholder="Ej: Padel Club Central"
              required
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              El enlace de tu portal público usará automáticamente este nombre en su dirección web.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Dirección / Ubicación
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              placeholder="Ej: Av. del Libertador 4500, CABA"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Teléfono de Contacto
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              placeholder="Ej: +54 9 11 4455-6677"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              WhatsApp Institucional
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              placeholder="Ej: 5491144556677"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Responsable / Titular
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Email Institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              placeholder="contacto@miclub.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Horario Habitual de Apertura
            </label>
            <input
              type="time"
              value={defaultOpeningTime}
              onChange={(e) => setDefaultOpeningTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Horario Habitual de Cierre
            </label>
            <input
              type="time"
              value={defaultClosingTime}
              onChange={(e) => setDefaultClosingTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Tolerancia para Cancelaciones (Horas)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="72"
                value={cancellationPolicyHours}
                onChange={(e) => setCancellationPolicyHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                horas
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Anticipación mínima para cancelaciones de reservas.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Porcentaje de Seña Mínimo Requerido (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={depositPercentage}
                onChange={(e) => setDepositPercentage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white pr-8"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TARJETA: ESTILO VISUAL, TEMA Y COLORES PROPIOS DEL COMPLEJO */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 border border-indigo-200 dark:border-indigo-800/60">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Estilo Visual, Modo & Colores de Marca</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Independiente
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Personalizá el modo claro/oscuro y los colores principales del panel y portal público.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="theme" label="Guardar Tema y Colores" />
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
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Ajuste Fino de Colores Personalizados
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
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
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
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                  placeholder="#10b981"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs"
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
                Vista previa de botones y acentos en vivo:
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

      {/* 4. TARJETA: MONEDA, DIVISA Y COTIZACIÓN */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-200 dark:border-emerald-800/60">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Moneda, Divisa & Cotización (ARS / USD)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Elegí la divisa base, cotización de cambio y cómo se visualizan los precios a clientes y administradores.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="currency" label="Guardar Monedas y Cotización" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Moneda Base para Tarifas de Canchas
            </label>
            <select
              value={primaryCurrency}
              onChange={(e) =>
                setPrimaryCurrency(e.target.value as "ARS" | "USD")
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ARS">Pesos Argentinos ($ ARS)</option>
              <option value="USD">Dólares Estadounidenses (US$ USD)</option>
            </select>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Moneda en la que cargás el precio por hora de cada cancha.
            </p>
          </div>

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
                  setExchangeRateUsdToArs(Math.max(1, Number(e.target.value)))
                }
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Monto en Pesos equivalente a 1 Dólar para la conversión automática.
            </p>
          </div>

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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ARS">Solo Pesos Argentinos ($ ARS)</option>
              <option value="USD">Solo Dólares (US$ USD)</option>
              <option value="BOTH">Ambas Monedas ($ ARS / US$ USD)</option>
            </select>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Cómo verán los valores tus clientes al realizar una reserva online.
            </p>
          </div>

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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ARS">Solo Pesos Argentinos ($ ARS)</option>
              <option value="USD">Solo Dólares (US$ USD)</option>
              <option value="BOTH">Ambas Monedas ($ ARS / US$ USD)</option>
            </select>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Cómo se visualizarán los montos e ingresos en el panel interno.
            </p>
          </div>
        </div>

        {/* Vista Previa interactiva */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
              Muestra de conversión (Tarifa base:{" "}
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

      {/* 5. TARJETA: PORTAL PÚBLICO & ENLACE DE CLIENTES */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shrink-0 border border-teal-200 dark:border-teal-800/60">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Enlace / URL del Portal de Reservas Online
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Configurá un dominio personalizado o utilizá la dirección web generada automáticamente.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="portal_url" label="Guardar Enlace del Portal" />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            Enlace / URL Personalizada del Portal (Opcional)
          </label>
          <input
            type="text"
            value={customPortalUrl}
            onChange={(e) => setCustomPortalUrl(e.target.value)}
            placeholder="Ej: https://misreservas.com o https://mipagina.com/portal"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/30"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Si tenés un dominio propio ingresalo arriba. Si lo dejás vacío, el portal utilizará el enlace con{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">
              ?view=portal
            </code>
            .
          </p>

          {/* Active Link Preview & Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Link Actual para Clientes:
                </p>
                <p className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200 truncate">
                  {getPublicPortalUrl()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
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
                onClick={() => {
                  handleSaveSection("general");
                  setIsShareModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                title="Ver opciones de compartir y código QR"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Compartir</span>
              </button>

              {onOpenPublicPortal && (
                <button
                  type="button"
                  onClick={() => {
                    handleSaveSection("general");
                    onOpenPublicPortal();
                  }}
                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Ver portal en vivo directamente dentro del sistema"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Ver en Sistema</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  handleSaveSection("general");
                  const freshUrl = getPublicPortalUrl();
                  if (typeof window !== "undefined") {
                    window.open(freshUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Probar y abrir portal en nueva pestaña con datos actualizados"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Abrir Pestaña</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. TARJETA: CARRUSEL DE IMÁGENES DEL PORTAL */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0 border border-purple-200 dark:border-purple-800/60">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Carrusel de Imágenes & Galería del Portal
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Fotos destacadas de canchas, iluminación y áreas del club.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="carousel" label="Guardar Carrusel de Fotos" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white block">
              Mostrar carrusel en la cabecera del portal de reservas
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              Activá o desactivá la visibilidad del carrusel para los clientes.
            </span>
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
          <div className="space-y-3 pt-2">
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
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500/50"
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

      {/* 7. TARJETA: SERVICIOS PÚBLICOS, WI-FI, BAR, MAPS & REGLAMENTO */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-200 dark:border-amber-800/60">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Servicios del Complejo (Wi-Fi, Buffet, Ubicación & Normas)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Información práctica mostrada a los jugadores en el portal online.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="services" label="Guardar Servicios y Normas" />
        </div>

        {/* Toggle General de Servicios */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white block">
              Mostrar bloque de Servicios e Instalaciones en el Portal
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              Si lo desactivás, se ocultará completamente la sección de servicios en el portal de reservas.
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
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
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
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
          />
        </div>

        {/* Wi-Fi Details & Toggle */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-blue-500" />
              Datos de Conexión Wi-Fi para Clientes
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
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
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
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Bar / Canteen Info & Toggle */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-500" />
              Información del Bar / Buffet / Canteen
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
            placeholder="Ej: Abierto de 17:00 a 01:00 hs. Hamburguesas, pizzas, cerveza tirada y bebidas."
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
          />
        </div>

        {/* Reglamento y Normas & Toggle */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              Reglamento Interno y Normas del Complejo
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
              {showRulesSection ? "✓ Reglamento Visible" : "✗ Reglamento Oculto"}
            </button>
          </div>
          <textarea
            rows={2}
            value={complexRules}
            onChange={(e) => setComplexRules(e.target.value)}
            placeholder="Ej: Calzado deportivo obligatorio. Tolerancia 10 min por turno. Cancelaciones con 24hs de anticipación."
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
          />
        </div>

        {/* Amenities List */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            Servicios e Instalaciones Destacadas (separadas por coma)
          </label>
          <input
            type="text"
            value={amenitiesInput}
            onChange={(e) => setAmenitiesInput(e.target.value)}
            placeholder="Ej: Wi-Fi Gratis, Bar & Canteen, Estacionamiento, Vestuarios con Duchas, Iluminación LED Pro, Parrillas"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          />
        </div>
      </div>

      {/* 8. TARJETA: TRANSFERENCIA BANCARIA DIRECTA */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-200 dark:border-emerald-800/60">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Datos Bancarios para Transferencia Directa (CBU/CVU)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Mostrados al cliente al momento de abonar la seña o pago total por banco.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="bank" label="Guardar Datos Bancarios" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Banco / Entidad Financiera
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ej: Banco Galicia, Santander, Brubank"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              CUIT / CUIL del Titular
            </label>
            <input
              type="text"
              value={cuitCuil}
              onChange={(e) => setCuitCuil(e.target.value)}
              placeholder="Ej: 30-71829384-9"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
            />
          </div>
        </div>
      </div>

      {/* 9. TARJETA: CONFIGURACIÓN DE MERCADO PAGO */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-200 dark:border-blue-800/60">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Configuración de Mercado Pago
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Alias, CVU, links de checkout y notas para pagos con Mercado Pago.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="mercadopago" label="Guardar Mercado Pago" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Titular Cuenta Mercado Pago
            </label>
            <input
              type="text"
              value={mpAccountHolder}
              onChange={(e) => setMpAccountHolder(e.target.value)}
              placeholder="Ej: Complejo Deportivo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Link de Pago Directo Mercado Pago (Opcional)
            </label>
            <input
              type="url"
              value={checkoutLinkMp}
              onChange={(e) => setCheckoutLinkMp(e.target.value)}
              placeholder="Ej: https://mpago.la/pos/123456"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Instrucciones / Notas para el Cliente (Mercado Pago)
            </label>
            <input
              type="text"
              value={notesMp}
              onChange={(e) => setNotesMp(e.target.value)}
              placeholder="Ej: Enviar comprobante por WhatsApp una vez realizada la transferencia"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* 10. TARJETA: PAGO EN EFECTIVO / RECEPCIÓN */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-200 dark:border-emerald-800/60">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Indicaciones para Pago en Efectivo / Recepción
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Pautas para clientes que eligen saldar en caja antes del partido.
              </p>
            </div>
          </div>

          <SaveCardButton sectionId="cash" label="Guardar Indicaciones Efectivo" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Texto / Indicación Mostrada en el Portal
          </label>
          <input
            type="text"
            value={cashPaymentNotes}
            onChange={(e) => setCashPaymentNotes(e.target.value)}
            placeholder="Ej: Abonar en la caja de recepción del complejo 10 minutos antes del inicio del turno"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          />
        </div>
      </div>

      {/* 11. TARJETA: COPIAS DE SEGURIDAD (BACKUP & RESTORE) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Copias de Seguridad (Backup & Restore)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Descargá todos tus datos en formato JSON para respaldar o transferir entre dispositivos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={exportBackupJSON}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Backup JSON</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95">
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
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Resetear a Datos de Demostración</span>
          </button>
        </div>
      </div>

      {/* Modal: Confirmation Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              ¿Restablecer Datos Iniciales?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Esta acción revertirá todas las reservas, canchas, deportes y clientes a los datos de prueba iniciales de fábrica.
            </p>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
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
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
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
        onOpenDirectly={onOpenPublicPortal}
      />
    </div>
  );
};
