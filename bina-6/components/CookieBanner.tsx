"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "bina6-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem(KEY));
  }, []);

  const choose = (value: "accepted" | "declined") => {
    localStorage.setItem(KEY, value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-3"
        >
          <div className="glass mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:gap-4">
            <p id="cookie-title" className="flex-1 text-sm leading-6 text-slate-200">
              האתר משתמש בעוגיות. עוגיות שדרושות להפעלת האתר יישמרו בכל מקרה. עוגיות למדידה,
              לניתוח שימוש ולשיווק יישמרו רק אם תאשרו.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="rounded-full bg-cyber-gradient px-4 py-2 text-sm font-extrabold text-slate-950"
              >
                אישור
              </button>
              <button
                type="button"
                onClick={() => choose("declined")}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/5"
              >
                סירוב
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
