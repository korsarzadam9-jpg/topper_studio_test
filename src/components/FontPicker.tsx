import { useEffect, useMemo, useRef, useState } from "react";
import {
  ensureFontCss,
  findFont,
  getCachedCatalog,
  getFontCatalog,
  type FontCategory,
  type FontOption,
} from "../fonts";
import { useI18n } from "../i18n/LanguageContext";
import type { Msg } from "../i18n/translations";

const ITEM_H = 42;
const VIEW_COUNT = 18;
const CAT_KEYS: Record<FontCategory, Msg> = {
  handwriting: "fonts.handwriting",
  display: "fonts.display",
  serif: "fonts.serif",
  "sans-serif": "fonts.sans",
  monospace: "fonts.mono",
};

export function FontPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { t } = useI18n();
  const [fonts, setFonts] = useState<FontOption[]>(() => getCachedCatalog());
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<"all" | FontCategory>("all");
  const [scrollTop, setScrollTop] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFontCatalog().then(setFonts);
  }, []);

  const current = fonts.find((f) => f.id === value) ?? findFont(value);

  useEffect(() => {
    if (current) ensureFontCss(current.cssFamily);
  }, [current]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setScrollTop(0);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [query, category, open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fonts
      .filter((f) => category === "all" || f.category === category)
      .filter((f) => !q || f.name.toLowerCase().includes(q) || f.id.includes(q));
  }, [fonts, query, category]);

  const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - 4);
  const end = Math.min(filtered.length, start + VIEW_COUNT + 8);
  const visible = filtered.slice(start, end);

  return (
    <div className="font-picker" ref={boxRef}>
      <button
        type="button"
        className="font-select font-select-btn"
        style={{ fontFamily: `"${current?.cssFamily ?? "Montserrat"}"` }}
        onClick={() => setOpen((v) => !v)}
      >
        {current?.name ?? value}
      </button>
      {open ? (
        <div className="font-popover">
          <input
            autoFocus
            className="font-search"
            placeholder={t("fonts.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="font-cats">
            <button type="button" className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>
              {t("fonts.all")}
            </button>
            {(Object.keys(CAT_KEYS) as FontCategory[]).map((cat) => (
              <button key={cat} type="button" className={category === cat ? "active" : ""} onClick={() => setCategory(cat)}>
                {t(CAT_KEYS[cat])}
              </button>
            ))}
          </div>
          <div
            className="font-list"
            ref={listRef}
            onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
          >
            <div style={{ height: filtered.length * ITEM_H, position: "relative" }}>
              {visible.map((font, i) => (
                <button
                  key={font.id}
                  type="button"
                  className={font.id === value ? "active" : ""}
                  style={{
                    fontFamily: `"${font.cssFamily}", Montserrat, sans-serif`,
                    position: "absolute",
                    top: (start + i) * ITEM_H,
                    left: 0,
                    right: 0,
                    height: ITEM_H,
                  }}
                  onMouseEnter={() => ensureFontCss(font.cssFamily)}
                  onClick={() => {
                    ensureFontCss(font.cssFamily);
                    onChange(font.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {font.name}
                </button>
              ))}
            </div>
            {!filtered.length ? <p>{t("fonts.empty")}</p> : null}
          </div>
          <div className="font-count">
            {query || category !== "all"
              ? t("fonts.filtered", { n: filtered.length, total: fonts.length })
              : t("fonts.count", { n: fonts.length })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
