/** Public file URL that works on GitHub Pages (`/topper_studio_test/`) and locally. */
export function assetUrl(path: string): string {
  const [file, query] = path.replace(/^\/+/, "").split("?");
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${file}${query ? `?${query}` : ""}`;
}
