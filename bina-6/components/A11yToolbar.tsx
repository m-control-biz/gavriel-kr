"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Contrast,
  FileText,
  Link2,
  Minus,
  Pause,
  Plus,
  RotateCcw,
  Type,
  X,
} from "lucide-react";
import { CONFERENCE_DATA as C } from "@/data/conference";

const STORAGE_KEY = "bina6-a11y";

type A11yState = {
  zoom: number;
  readable: boolean;
  contrast: boolean;
  invert: boolean;
  gray: boolean;
  links: boolean;
  motion: boolean;
  focus: boolean;
};

const DEFAULTS: A11yState = {
  zoom: 100,
  readable: false,
  contrast: false,
  invert: false,
  gray: false,
  links: false,
  motion: false,
  focus: false,
};

function loadState(): A11yState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function applyState(state: A11yState) {
  const root = document.documentElement;
  root.style.fontSize = `${state.zoom}%`;
  root.classList.toggle("a11y-readable", state.readable);
  root.classList.toggle("a11y-contrast", state.contrast);
  root.classList.toggle("a11y-invert", state.invert);
  root.classList.toggle("a11y-gray", state.gray);
  root.classList.toggle("a11y-links", state.links);
  root.classList.toggle("a11y-motion", state.motion);
  root.classList.toggle("a11y-focus", state.focus);
}

export function A11yToolbar() {
  const [open, setOpen] = useState(false);
  const [statement, setStatement] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULTS);

  useEffect(() => {
    const next = loadState();
    setState(next);
    applyState(next);
  }, []);

  useEffect(() => {
    const openStatement = () => {
      setOpen(true);
      setStatement(true);
    };
    window.addEventListener("bina6-a11y-statement", openStatement);
    return () => window.removeEventListener("bina6-a11y-statement", openStatement);
  }, []);

  useEffect(() => {
    if (!open && !statement) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (statement) setStatement(false);
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, statement]);

  const update = (patch: Partial<A11yState>) => {
    const next = { ...state, ...patch };
    setState(next);
    applyState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const reset = () => {
    setState(DEFAULTS);
    applyState(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <div className="fixed left-4 top-1/2 z-[90] -translate-y-1/2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="a11y-panel"
          aria-label={open ? "סגירת תפריט נגישות" : "פתיחת תפריט נגישות"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/50 bg-slate-950/90 text-cyan-200 shadow-glow-sm backdrop-blur-md hover:border-cyan-200 hover:text-white"
        >
          {open ? <X size={22} /> : <Accessibility size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed left-20 top-4 bottom-4 z-[90] flex items-center">
            <motion.div
              id="a11y-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="a11y-title"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="glass flex max-h-full w-72 flex-col overflow-hidden rounded-3xl p-4 shadow-glow"
            >
            <h2 id="a11y-title" className="shrink-0 text-base font-extrabold text-white">
              סרגל נגישות
            </h2>
            <p className="mt-1 shrink-0 text-xs leading-5 text-slate-400">
              התאמה לת״י 5568, WCAG 2.2 רמה AA ו־EN 301 549.
            </p>

            <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
              <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  <Type size={16} /> גודל טקסט
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="הקטנת טקסט"
                    className="rounded-lg p-1 hover:bg-white/10"
                    onClick={() => update({ zoom: Math.max(100, state.zoom - 12.5) })}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-xs tabular-nums">{state.zoom}%</span>
                  <button
                    type="button"
                    aria-label="הגדלת טקסט"
                    className="rounded-lg p-1 hover:bg-white/10"
                    onClick={() => update({ zoom: Math.min(175, state.zoom + 12.5) })}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <Toggle
                active={state.readable}
                onClick={() => update({ readable: !state.readable })}
                icon={<Type size={16} />}
                label="גופן קריא"
              />
              <Toggle
                active={state.contrast}
                onClick={() => update({ contrast: !state.contrast })}
                icon={<Contrast size={16} />}
                label="ניגודיות גבוהה"
              />
              <Toggle
                active={state.invert}
                onClick={() => update({ invert: !state.invert })}
                icon={<Contrast size={16} />}
                label="היפוך צבעים"
              />
              <Toggle
                active={state.gray}
                onClick={() => update({ gray: !state.gray })}
                icon={<Contrast size={16} />}
                label="גווני אפור"
              />
              <Toggle
                active={state.links}
                onClick={() => update({ links: !state.links })}
                icon={<Link2 size={16} />}
                label="הדגשת קישורים"
              />
              <Toggle
                active={state.motion}
                onClick={() => update({ motion: !state.motion })}
                icon={<Pause size={16} />}
                label="עצירת אנימציות"
              />
              <Toggle
                active={state.focus}
                onClick={() => update({ focus: !state.focus })}
                icon={<Accessibility size={16} />}
                label="פוקוס מקלדת מודגש"
              />
            </div>

            <div className="mt-3 flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => setStatement(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-cyan-200 hover:bg-white/5"
              >
                <FileText size={16} /> הצהרת נגישות
              </button>
              <button
                type="button"
                onClick={reset}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                <RotateCcw size={16} /> איפוס הגדרות
              </button>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statement && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setStatement(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="a11y-statement-title"
              className="glass max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="a11y-statement-title" className="text-xl font-black text-white">
                הצהרת נגישות
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <p>
                  אתר כנס בינה 6 פועל ליישום תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות
                  נגישות לשירות), התשע״ג–2013, התקן הישראלי ת״י 5568, הנחיות WCAG 2.2 ברמת
                  AA, ותקן הנגישות האירופי EN 301 549.
                </p>
                <p>
                  ניתן להתאים את התצוגה באמצעות סרגל הנגישות: גודל טקסט, גופן קריא, ניגודיות,
                  היפוך צבעים, הדגשת קישורים, עצירת אנימציות ופוקוס מקלדת. האתר תומך בניווט
                  מקלדת ובקישור ״דלג לתוכן״.
                </p>
                <p>
                  רכז נגישות: {C.contact.name}, {C.contact.role}. דוא״ל:{" "}
                  <a className="text-cyan-200 underline" href={`mailto:${C.contact.email}`}>
                    {C.contact.email}
                  </a>
                  , טלפון:{" "}
                  <a className="text-cyan-200 underline" href={`tel:${C.contact.phone.replace(/-/g, "")}`}>
                    {C.contact.phone}
                  </a>
                  .
                </p>
                <p>תאריך עדכון ההצהרה: 9.9.2026.</p>
              </div>
              <button
                type="button"
                onClick={() => setStatement(false)}
                className="mt-5 rounded-full bg-cyber-gradient px-5 py-2 text-sm font-extrabold text-slate-950"
              >
                סגירה
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Toggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
        active
          ? "border-cyan-300/50 bg-cyan-400/10 text-white"
          : "border-white/10 text-slate-200 hover:bg-white/5"
      }`}
    >
      <span className="flex items-center gap-2">
        {icon} {label}
      </span>
      <span className="text-xs text-slate-400">{active ? "פעיל" : "כבוי"}</span>
    </button>
  );
}
