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
      .replace(/\/portal\/?$/i, "") || "";
  const cleanRoot = rootPath.replace(/\/+$/, "");
  return `${window.location.origin}${cleanRoot}`;
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
  
  // Custom slug override or slug derived from complex name
  let targetSlug = custom;
  if (!targetSlug && params.complexName) {
    targetSlug = slugify(params.complexName);
  }
  if (!targetSlug && params.slug) {
    targetSlug = params.slug;
  }
  if (!targetSlug && params.id) {
    targetSlug = params.id;
  }
  if (!targetSlug) {
    targetSlug = "portal";
  }

  return `${baseUrl}?view=portal&c=${encodeURIComponent(targetSlug)}`;
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
  // If customPortalUrl is NOT an external full url (e.g. it's a slug name)
  if (custom && !/^https?:\/\//i.test(custom)) {
    targetSlug = custom;
  }
  if (!targetSlug && params.slug) {
    targetSlug = params.slug;
  }
  if (!targetSlug && params.complexName) {
    targetSlug = slugify(params.complexName);
  }
  if (!targetSlug && params.id) {
    targetSlug = params.id;
  }
  if (!targetSlug) {
    targetSlug = "complejo";
  }

  return `${baseUrl}?view=admin&c=${encodeURIComponent(targetSlug)}`;
}

/**
 * Returns the independent standalone URL for the SuperAdmin master panel (/superadmin)
 */
export function buildSuperAdminUrl(): string {
  if (typeof window === "undefined") return "";
  const baseUrl = getCleanBasePath();
  return `${baseUrl}/superadmin`;
}

