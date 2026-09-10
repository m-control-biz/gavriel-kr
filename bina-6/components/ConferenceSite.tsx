"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Mail,
  Phone,
  Accessibility,
  Car,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronUp,
  Presentation,
} from "lucide-react";
import {
  COMMITTEE,
  CONFERENCE_DATA as C,
  NAV,
  POSTERS,
  SESSIONS,
  uniqueSpeakers,
  type Person,
} from "@/data/conference";
import { Avatar } from "./Avatar";
import { A11yToolbar } from "./A11yToolbar";
import { CookieBanner } from "./CookieBanner";
import { asset } from "@/lib/paths";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export function ConferenceSite() {
  const [openNav, setOpenNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [active, setActive] = useState("home");
  const [person, setPerson] = useState<Person | null>(null);
  const speakers = useMemo(() => uniqueSpeakers(), []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setShowTop(window.scrollY > 400);
      const ids = NAV.map((n) => n.href.slice(1));
      let current = "home";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slatebg">
      <a href="#main-content" className="skip-link">
        דלג לתוכן הראשי
      </a>
      <div className="pointer-events-none fixed inset-0 bg-grid" />
      <div className="pointer-events-none fixed -start-24 top-0 h-80 w-80 rounded-full bg-[#00F2FE]/10 blur-3xl" />
      <div className="pointer-events-none fixed -end-16 top-40 h-96 w-96 rounded-full bg-[#4FACFE]/10 blur-3xl" />

      <Header
        scrolled={scrolled}
        openNav={openNav}
        setOpenNav={setOpenNav}
        active={active}
      />

      <main id="main-content" tabIndex={-1}>
        <Hero />
        <About />
        <Committee />
        <Program onPerson={setPerson} />
        <Posters />
        <Speakers speakers={speakers} onPerson={setPerson} />
        <Contact />
      </main>

      <Footer />
      <A11yToolbar />
      <CookieBanner />
      <BackToTop visible={showTop} />
      <PersonModal person={person} onClose={() => setPerson(null)} />
    </div>
  );
}

function BackToTop({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="חזרה לראש העמוד"
          className="fixed bottom-6 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/50 bg-slate-950/80 text-cyan-200 shadow-glow-sm backdrop-blur-md hover:border-cyan-200 hover:text-white"
        >
          <ChevronUp size={26} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Logos({ compact = false }: { compact?: boolean }) {
  const h = compact ? "h-10" : "h-12";
  return (
    <a href="#home" className="flex min-w-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/logos/aeai-white.svg")}
        alt="לשכת המהנדסים"
        className={`${h} w-auto`}
      />
    </a>
  );
}

function goToHash(href: string) {
  const id = href.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

function Header({
  scrolled,
  openNav,
  setOpenNav,
  active,
}: {
  scrolled: boolean;
  openNav: boolean;
  setOpenNav: (v: boolean) => void;
  active: string;
}) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Logos compact />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="ניווט ראשי">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                active === item.href.slice(1)
                  ? "bg-white/10 text-cyan-200"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={C.registerUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full bg-cyber-gradient px-4 py-2 text-sm font-extrabold text-slate-950 shadow-glow-sm sm:inline-flex"
          >
            הרשמה לכנס
          </a>
          <button
            className="rounded-full border border-white/15 p-2 text-white lg:hidden"
            onClick={() => setOpenNav(!openNav)}
            aria-label="תפריט"
          >
            {openNav ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openNav && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-white/10 bg-slate-950/95 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenNav(false);
                    window.setTimeout(() => goToHash(item.href), 250);
                  }}
                  className="rounded-lg px-3 py-2 text-slate-200 hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={C.registerUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpenNav(false)}
                className="mt-1 rounded-full bg-cyber-gradient px-4 py-2 text-center font-extrabold text-slate-950"
              >
                הרשמה לכנס
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(C.isoDate).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const units = [
    { n: pad(days), l: "ימים" },
    { n: pad(hours), l: "שעות" },
    { n: pad(mins), l: "דקות" },
    { n: pad(secs), l: "שניות" },
  ];
  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-1.5 min-[380px]:grid-cols-4 sm:gap-3" dir="ltr">
      {units.map((u) => (
        <div
          key={u.l}
          className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950/50 px-1 py-2 text-center sm:px-3 sm:py-2.5"
        >
          <div className="text-lg font-black tabular-nums leading-none text-white sm:text-3xl">
            {u.n}
          </div>
          <div className="mt-1 truncate text-[10px] text-slate-400 sm:text-xs" dir="rtl">
            {u.l}
          </div>
        </div>
      ))}
    </div>
  );
}

function LtrTime({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span dir="ltr" className={`inline-block tabular-nums ${className}`}>
      {children}
    </span>
  );
}

function Hero() {
  return (
    <section id="home" className="relative min-h-[92vh] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/hero-theme.jpg")}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_right]"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-[#070d18] via-[#070d18]/82 to-[#070d18]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-slatebg via-transparent to-black/45" />

      <div className="relative mx-auto grid w-full min-w-0 max-w-7xl items-center gap-6 px-3 pb-28 pt-32 sm:px-4 sm:pt-36 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <motion.div className="min-w-0" initial="hidden" animate="show" variants={fade}>
          <p className="mb-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
            <Sparkles size={14} /> {C.kicker}
          </p>
          <h1 className="text-6xl font-black leading-none text-white sm:text-7xl">
            <span className="bg-cyber-gradient bg-clip-text text-transparent">
              {C.title}
            </span>
          </h1>
          <p className="mt-3 text-4xl font-black text-white">{C.day}</p>
          <p className="text-5xl font-black leading-none text-white sm:text-6xl">
            <LtrTime>{C.date}</LtrTime>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="glass relative w-full min-w-0 overflow-hidden rounded-3xl p-2.5 shadow-glow sm:p-8 lg:row-span-2"
        >
          <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-[#00F2FE]/20 blur-2xl" />
          <div className="relative">
            <Countdown />
          </div>
        </motion.div>

        <motion.div className="min-w-0" initial="hidden" animate="show" variants={fade}>
          <p className="max-w-xl text-lg text-slate-200">{C.subtitle}</p>
          <p className="mt-2 text-slate-300">
            AI, דאטה, חדשנות — והחיבור שבין טכנולוגיה לאנשים.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <InfoChip
              icon={<Clock size={16} />}
              label={<LtrTime>{C.hours}</LtrTime>}
            />
            <InfoChip icon={<MapPin size={16} />} label={C.location.venue} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={C.registerUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-cyber-gradient px-6 py-3 text-sm font-extrabold text-slate-950 shadow-glow"
            >
              הרשמה לכנס
            </a>
            <a
              href="#program"
              className="rounded-full border border-white/20 bg-black/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/10"
            >
              לתוכנית המלאה
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function InfoChip({ icon, label }: { icon: ReactNode; label: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
      <span className="text-cyan-300">{icon}</span>
      {label}
    </span>
  );
}

function SectionTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="mb-7 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">{kicker}</p>
      <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl text-slate-400">{subtitle}</p>}
    </div>
  );
}

function About() {
  return (
    <section id="about" className="relative px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <SectionTitle kicker="About" title="אודות הכנס" />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <p className="text-lg leading-8 text-slate-200">{C.about}</p>
            <ul className="mt-6 space-y-3">
              {C.goals.map((g) => (
                <li key={g} className="flex gap-3 text-slate-300">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyber-gradient" />
                  {g}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-sm text-slate-400">ארכיון כנסים:</span>
              {C.archiveLinks.map((a) => (
                <a
                  key={a.year}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 px-3 py-1 text-sm text-cyan-200 hover:bg-cyan-400/10"
                >
                  {a.year} <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold text-slate-300">רשימת נושאים</p>
            <div className="flex flex-wrap gap-2">
              {C.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Program({ onPerson }: { onPerson: (p: Person) => void }) {
  const [tab, setTab] = useState(SESSIONS[0].id);
  const current = SESSIONS.find((s) => s.id === tab) ?? SESSIONS[0];
  const [jump, setJump] = useState<{
    label: string;
    href: string;
    track?: string;
  } | null>(null);

  const goJump = () => {
    if (!jump) return;
    if (jump.track) setTab(jump.track);
    document.getElementById(jump.href.slice(1))?.scrollIntoView({
      behavior: document.documentElement.classList.contains("a11y-motion")
        ? "auto"
        : "smooth",
      block: "start",
    });
    setJump(null);
  };

  useEffect(() => {
    if (!jump) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setJump(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  const slotClass = (glow?: boolean) =>
    [
      "flex h-full w-full flex-col justify-center rounded-2xl border bg-slate-900/50 px-2.5 py-2 text-center transition hover:border-cyan-300/40 hover:bg-white/5 md:w-40",
      glow ? "border-cyan-300/70 shadow-glow-sm" : "border-white/10",
    ].join(" ");

  return (
    <section id="program" className="relative px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          kicker="Agenda"
          title="תוכנית הכנס"
          subtitle="יום מקצועי אחד, שלושה מושבים ותערוכת פוסטרים."
        />

        <div className="mb-4 text-center">
          <p className="text-sm font-bold text-slate-200">סדר היום</p>
          <p className="mt-1 text-xs text-slate-500">מהבוקר עד הסיום, מימין לשמאל</p>
        </div>
        <ol className="mb-12 flex flex-col items-center gap-y-3 md:flex-row md:flex-wrap md:items-stretch md:justify-center md:gap-x-0 md:gap-y-5">
          {C.dayPlan.map((slot, i) => (
            <li
              key={slot.time + slot.label}
              className="flex w-full max-w-xs flex-col items-center md:w-auto md:flex-row md:items-stretch"
            >
              {slot.href ? (
                <button
                  type="button"
                  onClick={() =>
                    setJump({
                      label: slot.label,
                      href: slot.href!,
                      track: slot.track,
                    })
                  }
                  className={slotClass(slot.glow)}
                >
                  <LtrTime className="text-xs font-bold text-cyan-300">{slot.time}</LtrTime>
                  <div className="mt-0.5 flex min-h-[2.25rem] items-center justify-center text-sm leading-snug text-slate-200">
                    {slot.label}
                  </div>
                </button>
              ) : (
                <div className={slotClass(slot.glow)}>
                  <LtrTime className="text-xs font-bold text-cyan-300">{slot.time}</LtrTime>
                  <div className="mt-0.5 flex min-h-[2.25rem] items-center justify-center text-sm leading-snug text-slate-200">
                    {slot.label}
                  </div>
                </div>
              )}
              {i < C.dayPlan.length - 1 && (
                <ChevronLeft
                  size={18}
                  aria-hidden
                  className="my-1 rotate-90 text-cyan-300/80 md:mx-1.5 md:my-0 md:rotate-0 md:self-center"
                />
              )}
            </li>
          ))}
        </ol>

        <AnimatePresence>
          {jump && (
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJump(null)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="jump-title"
                className="glass w-full max-w-[16.5rem] rounded-2xl p-4 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <p id="jump-title" className="text-base font-extrabold text-white">
                  מעבר ל«{jump.label}»?
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    type="button"
                    autoFocus
                    onClick={goJump}
                    className="rounded-full bg-cyber-gradient px-4 py-1.5 text-sm font-extrabold text-slate-950"
                  >
                    כן
                  </button>
                  <button
                    type="button"
                    onClick={() => setJump(null)}
                    className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-bold text-slate-200 hover:bg-white/5"
                  >
                    לא עכשיו
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div id="session-tabs">
        <p className="mb-3 text-center text-sm text-slate-400">
          בחרו מושב כדי לראות את ההרצאות והשעות שלו.
        </p>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          {SESSIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className={`flex-1 rounded-2xl border px-4 py-3 text-start transition ${
                tab === s.id
                  ? "border-cyan-300/40 bg-cyan-400/10 text-white"
                  : "border-white/10 bg-slate-900/40 text-slate-300 hover:bg-white/5"
              }`}
            >
              <div className="text-xs text-cyan-300">
                מושב {i + 1} · <LtrTime>{s.time}</LtrTime>
              </div>
              <div className="font-bold">{s.title}</div>
              <div className="text-xs text-slate-400">בהנחיית {s.leader}</div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {current.lectures.map((lec) => (
            <div
              key={lec.time + lec.topic}
              className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
            >
              <LtrTime className="w-32 shrink-0 text-sm font-bold text-cyan-300">
                {lec.time}
              </LtrTime>
              <div className="flex -space-x-3 space-x-reverse">
                {lec.speakers.map((sp) => (
                  <button key={sp.id} onClick={() => onPerson(sp)} aria-label={sp.name}>
                    <Avatar src={sp.photo} name={sp.name} size="md" />
                  </button>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white">{lec.topic}</p>
                <p className="text-sm text-slate-400">
                  {lec.speakers.map((s) => s.name).join(" · ")}
                  {" · "}
                  {lec.speakers[0].org}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                {lec.speakers.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => onPerson(sp)}
                    className="inline-flex items-center justify-end gap-1 text-sm font-bold text-cyan-200"
                  >
                    לפרטים
                    {lec.speakers.length > 1 && (
                      <span className="font-medium text-slate-300">{sp.name}</span>
                    )}
                    <ArrowLeft size={14} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

function Speakers({
  speakers,
  onPerson,
}: {
  speakers: Person[];
  onPerson: (p: Person) => void;
}) {
  return (
    <section id="speakers" className="relative px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          kicker="Speakers"
          title="הדוברים"
          subtitle="מרצות ומרצים מהאקדמיה, ממערכת החינוך ומהתעשייה — לחצו על כרטיס לביוגרפיה."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {speakers.map((sp, i) => (
            <motion.button
              key={sp.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onPerson(sp)}
              className="glass group rounded-3xl p-5 text-center transition hover:-translate-y-1 hover:border-cyan-300/40"
            >
              <div className="mx-auto">
                <Avatar src={sp.photo} name={sp.name} size="xl" className="mx-auto" />
              </div>
              <h3 className="mt-4 font-extrabold text-white">{sp.name}</h3>
              <p className="mt-1 text-sm text-cyan-200">{sp.role}</p>
              <p className="text-xs text-slate-400">{sp.org}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Posters() {
  return (
    <section id="posters" className="relative px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          kicker="Posters"
          title="תערוכת פוסטרים"
          subtitle={
            <>
              <LtrTime>14:15 – 15:00</LtrTime>
              {" · "}
              פרויקטים של סטודנטים מהטכניון ומרופין.
            </>
          }
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {POSTERS.map((p) => (
            <article key={p.id} className="glass rounded-3xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-xs font-bold text-cyan-200">
                  #{p.id}
                </span>
                <Presentation size={16} className="text-cyan-300" />
              </div>
              <h3 className="text-lg font-extrabold text-white" dir="ltr">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300" dir="ltr">
                {p.desc}
              </p>
              <div className="mt-4 border-t border-white/10 pt-3 text-sm">
                <p className="font-bold text-slate-100">{p.presenter}</p>
                <p className="text-slate-400">{p.institution}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function sessionLeadCaption(name: string, role: string) {
  const session = SESSIONS.find((s) => s.leader === name);
  if (!session) return null;
  const lead = role.includes("חברת") ? "מובילת מושב" : "מוביל מושב";
  const sessionName = session.title.replace(/^מושב\s+/, "");
  return `${lead} ${sessionName}`;
}

function Committee() {
  return (
    <section id="committee" className="relative px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <SectionTitle kicker="Steering" title="ועדת היגוי" />
        <div className="flex flex-wrap justify-center gap-4">
          {COMMITTEE.map((m) => {
            const lead = sessionLeadCaption(m.name, m.role);
            return (
              <div
                key={m.name}
                className="glass w-full max-w-[230px] rounded-3xl p-5 text-center sm:w-[230px]"
              >
                <Avatar src={m.photo} name={m.name} size="lg" className="mx-auto" />
                <h3 className="mt-3 font-extrabold text-white">{m.name}</h3>
                <p className="text-sm text-cyan-200">{m.role}</p>
                {lead && <p className="mt-1 text-xs leading-5 text-slate-400">{lead}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    C.location.mapsQuery
  )}&z=16&hl=he&output=embed`;

  return (
    <section id="contact" className="relative px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <SectionTitle kicker="Venue & Contact" title="יצירת קשר והגעה" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass overflow-hidden rounded-3xl">
            <iframe
              title="מפת הגעה לבית המהנדס"
              src={mapSrc}
              className="h-80 w-full grayscale-[0.3] contrast-125"
              loading="lazy"
            />
          </div>
          <div className="space-y-4">
            <div className="glass rounded-3xl p-5">
              <h3 className="flex items-center gap-2 font-extrabold text-white">
                <MapPin size={18} className="text-cyan-300" /> {C.location.venue}
              </h3>
              <p className="mt-1 text-slate-300">{C.location.address}</p>
              <a
                href={C.location.infoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-cyan-200"
              >
                להסבר הגעה <ExternalLink size={12} />
              </a>
            </div>
            <div className="glass rounded-3xl p-5 text-slate-300">
              <p className="flex items-start gap-2">
                <Car size={18} className="mt-0.5 text-cyan-300" />
                {C.location.parking}
              </p>
              <p className="mt-3 flex items-start gap-2">
                <Accessibility size={18} className="mt-0.5 shrink-0 text-cyan-300" />
                <span>
                  {C.contact.accessibility} בדוא״ל:{" "}
                  <a
                    href={`mailto:${C.contact.email}`}
                    className="font-bold text-cyan-200 underline-offset-2 hover:underline"
                  >
                    {C.contact.email}
                  </a>{" "}
                  ובטלפון:{" "}
                  <a
                    href={`tel:${C.contact.phone.replace(/-/g, "")}`}
                    className="font-bold text-cyan-200 underline-offset-2 hover:underline"
                  >
                    {C.contact.phone}
                  </a>
                  .
                </span>
              </p>
            </div>
            <div className="glass rounded-3xl p-5">
              <p className="font-extrabold text-white">{C.contact.name}</p>
              <p className="text-sm text-slate-400">{C.contact.role}</p>
              <a
                href={`mailto:${C.contact.email}`}
                className="mt-3 flex items-center gap-2 text-cyan-200"
              >
                <Mail size={16} /> {C.contact.email}
              </a>
              <a
                href={`tel:${C.contact.phone.replace(/-/g, "")}`}
                className="mt-1 flex items-center gap-2 text-cyan-200"
              >
                <Phone size={16} /> {C.contact.phone}
              </a>
            </div>
          </div>
        </div>

        <div
          id="register"
          className="mt-10 overflow-hidden rounded-3xl border border-cyan-300/30 bg-gradient-to-l from-[#4FACFE]/20 to-[#00F2FE]/10 p-8 text-center"
        >
          <h3 className="text-2xl font-black text-white">הרשמה לכנס</h3>
          <p className="mt-3 text-lg font-bold text-white">{C.registration.price}</p>
          <p className="mx-auto mt-3 max-w-2xl text-slate-200">{C.registration.includes}</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            {C.registration.scholarship}
          </p>
          <p className="mt-4 font-bold text-slate-100">{C.registration.limited}</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            {C.registration.help}{" "}
            <a
              href={`mailto:${C.registration.helpEmail}`}
              className="font-bold text-cyan-200 underline-offset-2 hover:underline"
            >
              {C.registration.helpEmail}
            </a>
          </p>
          <a
            href={C.registerUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-cyber-gradient px-8 py-3 font-extrabold text-slate-950 shadow-glow"
          >
            להרשמה
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Logos />
        <p className="text-center text-sm text-slate-500">
          © {C.title} · {C.date} · איגוד דאטה סיינס בלשכת המהנדסים
        </p>
        <button
          type="button"
          className="text-sm text-cyan-200 underline-offset-2 hover:underline"
          onClick={() => window.dispatchEvent(new Event("bina6-a11y-statement"))}
        >
          הצהרת נגישות
        </button>
      </div>
    </footer>
  );
}

function PersonModal({
  person,
  onClose,
}: {
  person: Person | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!person) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [person, onClose]);

  return (
    <AnimatePresence>
      {person && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="person-name"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl p-6"
          >
            <div className="flex items-start gap-4">
              <Avatar src={person.photo} name={person.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 id="person-name" className="text-xl font-black text-white">{person.name}</h3>
                <p className="text-cyan-200">{person.role}</p>
                <p className="text-sm text-slate-400">{person.org}</p>
              </div>
              <button onClick={onClose} className="text-slate-400" aria-label="סגירה">
                <X size={18} />
              </button>
            </div>
            {person.bio && (
              <p className="mt-5 leading-7 text-slate-200">{person.bio}</p>
            )}
            {person.email && (
              <a
                href={`mailto:${person.email}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-200"
              >
                <Mail size={14} /> {person.email}
              </a>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
