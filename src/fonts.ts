export type FontCategory = "handwriting" | "display" | "serif" | "sans-serif" | "monospace";

export interface FontOption {
  id: string;
  name: string;
  cssFamily: string;
  category: FontCategory;
  weights: number[];
  subsets: string[];
  variable?: boolean;
  file?: string;
}

const LOCAL_FILES: Record<string, string> = {
  brownist: "/fonts/Brownist.otf?v=pl",
  "better-yesterday": "/fonts/BetterYesterday.otf",
  "abril-fatface": "/fonts/AbrilFatface-Regular.ttf",
  "alex-brush": "/fonts/AlexBrush-Regular.ttf",
  allura: "/fonts/Allura-Regular.ttf",
  "amatic-sc": "/fonts/AmaticSC-Bold.ttf",
  caveat: "/fonts/Caveat.ttf",
  cinzel: "/fonts/Cinzel.ttf",
  comfortaa: "/fonts/Comfortaa.ttf",
  cookie: "/fonts/Cookie-Regular.ttf",
  "cormorant-garamond": "/fonts/CormorantGaramond.ttf",
  "dancing-script": "/fonts/DancingScript.ttf",
  "great-vibes": "/fonts/GreatVibes-Regular.ttf",
  italianno: "/fonts/Italianno-Regular.ttf",
  "josefin-sans": "/fonts/JosefinSans.ttf",
  lobster: "/fonts/Lobster-Regular.ttf",
  lora: "/fonts/Lora.ttf",
  "marck-script": "/fonts/MarckScript-Regular.ttf",
  montserrat: "/fonts/Montserrat.ttf",
  oswald: "/fonts/Oswald.ttf",
  pacifico: "/fonts/Pacifico-Regular.ttf",
  parisienne: "/fonts/Parisienne-Regular.ttf",
  "pinyon-script": "/fonts/PinyonScript-Regular.ttf",
  "playfair-display": "/fonts/PlayfairDisplay.ttf",
  quicksand: "/fonts/Quicksand.ttf",
  sacramento: "/fonts/Sacramento-Regular.ttf",
  satisfy: "/fonts/Satisfy-Regular.ttf",
  tangerine: "/fonts/Tangerine-Bold.ttf",
};

export const BRAND_FONTS: FontOption[] = [
  {
    id: "brownist",
    name: "Brownist",
    cssFamily: "Brownist",
    category: "handwriting",
    weights: [400],
    subsets: ["latin", "latin-ext"],
    file: LOCAL_FILES.brownist,
  },
  {
    id: "better-yesterday",
    name: "Better Yesterday",
    cssFamily: "Better Yesterday",
    category: "handwriting",
    weights: [400],
    subsets: ["latin", "latin-ext"],
    file: LOCAL_FILES["better-yesterday"],
  },
];

const injectedCss = new Set<string>(["Brownist", "Better Yesterday"]);
const fileUrlCache = new Map<string, string[]>();
let catalogPromise: Promise<FontOption[]> | null = null;
let catalog: FontOption[] = BRAND_FONTS;

export function getCachedCatalog() {
  return catalog;
}

function asCategory(value?: string): FontCategory {
  if (value === "handwriting" || value === "display" || value === "serif" || value === "sans-serif" || value === "monospace") {
    return value;
  }
  return "sans-serif";
}

export async function getFontCatalog(): Promise<FontOption[]> {
  if (catalogPromise) return catalogPromise;
  catalogPromise = (async () => {
    try {
      const res = await fetch("https://api.fontsource.org/v1/fonts?type=google");
      if (!res.ok) throw new Error("catalog");
      const data = (await res.json()) as Array<{
        id: string;
        family: string;
        subsets?: string[];
        weights?: number[];
        category?: string;
        variable?: boolean;
      }>;
      const google = data
        .map((f) => ({
          id: f.id,
          name: f.family,
          cssFamily: f.family,
          category: asCategory(f.category),
          weights: f.weights?.length ? f.weights : [400],
          subsets: f.subsets ?? ["latin"],
          variable: Boolean(f.variable),
          file: LOCAL_FILES[f.id],
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "en"));
      catalog = [...BRAND_FONTS, ...google.filter((f) => !BRAND_FONTS.some((brand) => brand.id === f.id))];
    } catch {
      catalog = [
        ...BRAND_FONTS,
        ...Object.entries(LOCAL_FILES)
          .filter(([id]) => !BRAND_FONTS.some((brand) => brand.id === id))
          .map(([id, file]) => ({
            id,
            name: id
              .split("-")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" "),
            cssFamily: id
              .split("-")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" "),
            category: "handwriting" as FontCategory,
            weights: [400],
            subsets: ["latin", "latin-ext"],
            file,
          })),
      ];
    }
    return catalog;
  })();
  return catalogPromise;
}

export function findFont(id: string): FontOption | undefined {
  return catalog.find((f) => f.id === id) ?? BRAND_FONTS.find((f) => f.id === id);
}

export function fontFileCandidates(font: FontOption): string[] {
  const weight = font.weights.includes(400)
    ? 400
    : font.weights.includes(500)
      ? 500
      : font.weights[0] ?? 400;
  const cdn = `https://cdn.jsdelivr.net/fontsource/fonts/${font.id}@latest`;
  const subsets = font.subsets.includes("latin")
    ? ["latin", ...(font.subsets.includes("latin-ext") ? ["latin-ext"] : [])]
    : font.subsets.slice(0, 2);
  const urls: string[] = [];
  if (font.file) urls.push(font.file);
  for (const subset of subsets) {
    urls.push(`${cdn}/${subset}-${weight}-normal.ttf`);
    urls.push(`${cdn}/${subset}-400-normal.ttf`);
    urls.push(`${cdn}/${subset}-${weight}-normal.woff`);
    if (font.variable) urls.push(`${cdn}/${subset}-wght-normal.ttf`);
  }
  return [...new Set(urls)];
}

type FontsourceFile = { url?: { ttf?: string; woff?: string } };
type FontsourceMeta = {
  variants?: Record<string, Record<string, Record<string, FontsourceFile>>>;
};

async function urlsFromFontsource(id: string): Promise<string[]> {
  const cached = fileUrlCache.get(id);
  if (cached) return cached;
  try {
    const res = await fetch(`https://api.fontsource.org/v1/fonts/${id}`);
    if (!res.ok) return [];
    const data = (await res.json()) as FontsourceMeta;
    const variants = data.variants ?? {};
    const weights = Object.keys(variants);
    const weight = weights.includes("400") ? "400" : weights[0];
    if (!weight) return [];
    const style = variants[weight]?.normal ?? variants[weight]?.italic;
    if (!style) return [];
    const order = ["latin", "latin-ext", ...Object.keys(style)];
    const urls: string[] = [];
    for (const subset of order) {
      const files = style[subset]?.url;
      if (files?.ttf) urls.push(files.ttf);
      if (files?.woff) urls.push(files.woff);
    }
    const unique = [...new Set(urls)];
    fileUrlCache.set(id, unique);
    return unique;
  } catch {
    return [];
  }
}

async function urlsFromGoogleCss(family: string): Promise<string[]> {
  const query = encodeURIComponent(family).replace(/%20/g, "+");
  const hrefs = [
    `https://fonts.googleapis.com/css2?family=${query}&display=swap`,
    `https://fonts.googleapis.com/css2?family=${query}:wght@400;500;700&display=swap`,
    `https://fonts.googleapis.com/css?family=${query}&subset=latin,latin-ext`,
  ];
  const urls: string[] = [];
  for (const href of hrefs) {
    try {
      const res = await fetch(href);
      if (!res.ok) continue;
      const css = await res.text();
      const faces = css.match(/@font-face\s*\{[\s\S]*?\}/g) ?? [];
      const prefer = faces.filter(
        (face) =>
          /unicode-range:\s*U\+0+0-00FF/i.test(face) ||
          /U\+0000-00FF/i.test(face) ||
          /U\+0100-024F/i.test(face) ||
          !/unicode-range/i.test(face),
      );
      const pick = prefer.length ? prefer : faces;
      for (const face of pick) {
        for (const match of face.matchAll(/url\((['"]?)(https:[^'")]+)\1\)/g)) {
          const url = match[2];
          if (/\.(woff2)(\?|$)/i.test(url)) continue;
          urls.push(url);
        }
      }
      if (urls.length) break;
    } catch {
      /* try next */
    }
  }
  return [...new Set(urls)];
}

export async function resolveFontUrls(font: FontOption): Promise<string[]> {
  const local = font.file ? [font.file] : [];
  if (font.file && LOCAL_FILES[font.id]) return local;
  const fromApi = await urlsFromFontsource(font.id);
  const google = await urlsFromGoogleCss(font.cssFamily);
  const ranked = [...local, ...fromApi, ...google, ...fontFileCandidates(font)].filter(
    (url) => !/\.woff2(\?|$)/i.test(url),
  );
  const outlines = ranked.filter((url) => /\.(ttf|otf|woff)(\?|$)/i.test(url));
  const ttf = outlines.filter((url) => /\.(ttf|otf)(\?|$)/i.test(url));
  const woff = outlines.filter((url) => /\.woff(\?|$)/i.test(url));
  return [...new Set([...ttf, ...woff, ...ranked])];
}

export function ensureFontCss(family: string) {
  if (injectedCss.has(family) || typeof document === "undefined") return;
  injectedCss.add(family);
  const query = encodeURIComponent(family).replace(/%20/g, "+");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${query}&display=swap`;
  document.head.appendChild(link);
}
