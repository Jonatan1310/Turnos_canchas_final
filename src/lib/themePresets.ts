import { ComplexSettings } from "../types";

export type ThemePresetId =
  | "emerald"
  | "indigo"
  | "blue"
  | "amber"
  | "rose"
  | "violet"
  | "teal"
  | "slate"
  | "custom";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemePresetOption {
  id: ThemePresetId;
  name: string;
  category: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  gradient: string;
  darkGradient: string;
  previewColors: [string, string, string];
  suggestedSports: string;
}

export const THEME_PRESETS: ThemePresetOption[] = [
  {
    id: "emerald",
    name: "Verde Pádel & Césped",
    category: "Pádel / Fútbol",
    description: "Estilo fresco y natural, óptimo para clubes de pádel de cristal y fútbol sintético.",
    primaryColor: "#059669",
    secondaryColor: "#10b981",
    gradient: "from-emerald-600 to-teal-700",
    darkGradient: "from-emerald-950 via-slate-900 to-teal-950",
    previewColors: ["#059669", "#10b981", "#34d399"],
    suggestedSports: "Pádel, Fútbol 5/7, Golf",
  },
  {
    id: "indigo",
    name: "Azul Índigo Pro",
    category: "Champions / Multisport",
    description: "Elegante, tecnológico y corporativo con alto contraste y toque premium.",
    primaryColor: "#4f46e5",
    secondaryColor: "#6366f1",
    gradient: "from-indigo-600 to-blue-700",
    darkGradient: "from-indigo-950 via-slate-900 to-blue-950",
    previewColors: ["#4f46e5", "#6366f1", "#818cf8"],
    suggestedSports: "Multideporte, Tenis, Squash",
  },
  {
    id: "blue",
    name: "Azul Océano Sport",
    category: "Club Clásico",
    description: "Confianza, dinamismo y máxima claridad visual para complejos tradicionales.",
    primaryColor: "#2563eb",
    secondaryColor: "#3b82f6",
    gradient: "from-blue-600 to-cyan-700",
    darkGradient: "from-blue-950 via-slate-900 to-slate-950",
    previewColors: ["#2563eb", "#3b82f6", "#60a5fa"],
    suggestedSports: "Fútbol 11, Básquet, Natación",
  },
  {
    id: "amber",
    name: "Naranja & Ámbar Fuego",
    category: "Tenis / Arena",
    description: "Energía intensa, calor y pasión. Ideal para polvo de ladrillo y vóley de playa.",
    primaryColor: "#d97706",
    secondaryColor: "#f59e0b",
    gradient: "from-amber-600 to-orange-700",
    darkGradient: "from-amber-950 via-slate-900 to-orange-950",
    previewColors: ["#d97706", "#f59e0b", "#fbbf24"],
    suggestedSports: "Tenis Polvo, Beach Vóley, Básquet",
  },
  {
    id: "rose",
    name: "Rojo & Coral Competitivo",
    category: "Arena / Alta Competencia",
    description: "Fuerza, adrenalina y garra competitiva para torneos y ligas nocturnas.",
    primaryColor: "#e11d48",
    secondaryColor: "#f43f5e",
    gradient: "from-rose-600 to-red-700",
    darkGradient: "from-rose-950 via-slate-900 to-red-950",
    previewColors: ["#e11d48", "#f43f5e", "#fb7185"],
    suggestedSports: "Fútbol nocturno, Boxeo, Crossfit",
  },
  {
    id: "violet",
    name: "Violeta & Neón Cyber",
    category: "Boutique / Night Club",
    description: "Moderno, futurista y vibrante para clubes nocturnos de pádel tech y fitness.",
    primaryColor: "#7c3aed",
    secondaryColor: "#8b5cf6",
    gradient: "from-violet-600 to-purple-700",
    darkGradient: "from-violet-950 via-slate-900 to-purple-950",
    previewColors: ["#7c3aed", "#8b5cf6", "#a78bfa"],
    suggestedSports: "Pádel Glow, Fitness, Gaming",
  },
  {
    id: "teal",
    name: "Turquesa Caribe Fresh",
    category: "Náutico / Verano",
    description: "Relajado, fresco y veraniego para complejos al aire libre y clubes de campo.",
    primaryColor: "#0d9488",
    secondaryColor: "#14b8a6",
    gradient: "from-teal-600 to-cyan-700",
    darkGradient: "from-teal-950 via-slate-900 to-cyan-950",
    previewColors: ["#0d9488", "#14b8a6", "#2dd4bf"],
    suggestedSports: "Pádel Outdoor, Tenis, Country Club",
  },
  {
    id: "slate",
    name: "Carbón & Ónix Minimal",
    category: "Minimalista / Luxury",
    description: "Sobrio, sofisticado y monocromático de máxima distinción y contraste puro.",
    primaryColor: "#334155",
    secondaryColor: "#475569",
    gradient: "from-slate-700 to-zinc-900",
    darkGradient: "from-slate-950 via-zinc-900 to-black",
    previewColors: ["#334155", "#475569", "#64748b"],
    suggestedSports: "Club Privado, Pistas VIP, Squash",
  },
];

// Helper to convert HEX to RGB components
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

/**
 * Applies custom CSS variables and document classes for the specific complex
 */
export function applyThemeToDocument(settings?: ComplexSettings) {
  if (typeof document === "undefined" || !settings) return;

  const root = document.documentElement;
  const primaryColor = settings.primaryColor || "#059669";
  const secondaryColor = settings.secondaryColor || primaryColor;
  const themeMode = settings.themeMode || "light";

  // 1. Set Light / Dark Mode class on HTML Root
  if (themeMode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // 2. Compute RGB values for Tailwind and CSS alpha channels
  const primaryRgb = hexToRgb(primaryColor) || { r: 5, g: 150, b: 105 };
  const secondaryRgb = hexToRgb(secondaryColor) || primaryRgb;

  root.style.setProperty("--brand-primary", primaryColor);
  root.style.setProperty(
    "--brand-primary-rgb",
    `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`,
  );
  root.style.setProperty("--brand-secondary", secondaryColor);
  root.style.setProperty(
    "--brand-secondary-rgb",
    `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`,
  );

  // 3. Set meta theme-color for mobile browsers
  let metaTheme = document.querySelector<HTMLMetaElement>(
    "meta[name='theme-color']",
  );
  if (!metaTheme) {
    metaTheme = document.createElement("meta");
    metaTheme.name = "theme-color";
    document.head.appendChild(metaTheme);
  }
  metaTheme.content = themeMode === "dark" ? "#0f172a" : primaryColor;

  // 4. Synchronize Document Title with complex name
  if (settings.complexName && settings.complexName.trim()) {
    document.title = `${settings.complexName.trim()} | Sistema de Reservas`;
  }

  // 5. Synchronize Browser Favicon with configured complex logo
  if (settings.logoUrl && settings.logoUrl.trim()) {
    let faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.rel = "shortcut icon";
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = settings.logoUrl.trim();
  }

  // 6. Synchronize OpenGraph metadata for sharing
  if (settings.complexName) {
    let ogTitle = document.querySelector<HTMLMetaElement>("meta[property='og:title']");
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = `${settings.complexName} | Portal Oficial de Reservas`;
  }
  if (settings.logoUrl) {
    let ogImage = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    ogImage.content = settings.logoUrl;
  }
}

export function getThemePreset(presetId?: string): ThemePresetOption {
  const found = THEME_PRESETS.find((p) => p.id === presetId);
  return found || THEME_PRESETS[0];
}
