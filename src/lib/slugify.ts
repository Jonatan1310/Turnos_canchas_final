/**
 * Utility to generate URL-safe slugs from text (e.g. complex names)
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics (á, é, í, ó, ú, ñ -> a, e, i, o, u, n)
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, "") // remove leading & trailing hyphens
    .trim();
}

/**
 * Returns clean base origin and root path stripped from /superadmin or /portal subpaths
 */
function getCleanBasePath(): string {
  if (typeof window === "undefined") return "";
  const rootPath =
    window.location.pathname
      .replace(/\/superadmin\/?$/i, "")
      .replace(/\/portal\/?$/i, "") || "/";
  const cleanRoot = rootPath.replace(/\/+$/, "");
  return `${window.location.origin}${cleanRoot}`;
}

/**
 * Robust clipboard copy function supporting modern Clipboard API and fallback textarea
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern navigator.clipboard
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, using fallback:", err);
    }
  }

  // 2. Fallback to document.execCommand('copy') with temporary textarea
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (successful) return true;
    } catch (err) {
      console.error("execCommand fallback failed:", err);
    }
  }

  return false;
}

/**
 * Returns the public portal URL for a complex using its configured name or slug
 */
export function buildComplexPortalUrl(params: {
  complexName?: string;
  slug?: string;
  customPortalUrl?: string;
  id?: string;
}): string {
  if (typeof window === "undefined") return "";
  
  const custom = params.customPortalUrl?.trim();
  // If custom URL is a full HTTP/HTTPS URL, return it directly
  if (custom && /^https?:\/\//i.test(custom)) {
    return custom;
  }

  const baseUrl = getCleanBasePath();
  
  // Primary priority: Slug derived from the administrator's configured complexName
  let targetSlug = "";
  if (params.complexName && params.complexName.trim()) {
    targetSlug = slugify(params.complexName.trim());
  } else if (params.slug && params.slug.trim()) {
    targetSlug = slugify(params.slug.trim());
  } else if (custom && !/^https?:\/\//i.test(custom)) {
    targetSlug = slugify(custom);
  } else if (params.id && params.id.trim()) {
    targetSlug = params.id.trim();
  } else {
    targetSlug = "portal";
  }

  const separator = baseUrl.endsWith("/") ? "" : "/";
  const complexIdParam = params.id ? `&cid=${encodeURIComponent(params.id)}` : "";
  return `${baseUrl}${separator}?view=portal&c=${encodeURIComponent(targetSlug)}${complexIdParam}`;
}

/**
 * Returns the private admin portal URL for a complex using its configured name or slug
 */
export function buildComplexAdminUrl(params: {
  complexName?: string;
  slug?: string;
  customPortalUrl?: string;
  id?: string;
}): string {
  if (typeof window === "undefined") return "";
  const baseUrl = getCleanBasePath();

  const custom = params.customPortalUrl?.trim();
  let targetSlug = "";
  if (params.complexName && params.complexName.trim()) {
    targetSlug = slugify(params.complexName.trim());
  } else if (params.slug && params.slug.trim()) {
    targetSlug = slugify(params.slug.trim());
  } else if (custom && !/^https?:\/\//i.test(custom)) {
    targetSlug = slugify(custom);
  } else if (params.id && params.id.trim()) {
    targetSlug = params.id.trim();
  } else {
    targetSlug = "complejo";
  }

  const separator = baseUrl.endsWith("/") ? "" : "/";
  const complexIdParam = params.id ? `&cid=${encodeURIComponent(params.id)}` : "";
  return `${baseUrl}${separator}?view=admin&c=${encodeURIComponent(targetSlug)}${complexIdParam}`;
}

/**
 * Returns the independent standalone URL for the SuperAdmin master panel (/superadmin)
 */
export function buildSuperAdminUrl(): string {
  if (typeof window === "undefined") return "";
  const baseUrl = getCleanBasePath();
  const separator = baseUrl.endsWith("/") ? "" : "/";
  return `${baseUrl}${separator}superadmin`;
}


