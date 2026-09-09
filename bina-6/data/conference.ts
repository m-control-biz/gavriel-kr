export type Person = {
  id: string;
  name: string;
  role: string;
  org: string;
  bio?: string;
  email?: string;
  photo?: string;
};

export type Lecture = {
  time: string;
  topic: string;
  speakers: Person[];
};

export type Session = {
  id: string;
  title: string;
  leader: string;
  time: string;
  accent: string;
  lectures: Lecture[];
};

export type Poster = {
  id: number;
  presenter: string;
  institution: string;
  title: string;
  desc: string;
  email: string;
};

export const CONFERENCE_DATA = {
  title: "כנס בינה 6",
  kicker: "הכנס השנתי של איגוד מדעי הנתונים",
  subtitle: "הכנס השנתי של איגוד מדעי הנתונים בלשכת המהנדסים",
  date: "19.11.2026",
  isoDate: "2026-11-19T09:00:00+03:00",
  day: "יום חמישי",
  hours: "09:00 – 15:30",
  gathering: "08:30",
  location: {
    venue: "בית המהנדס, לשכת המהנדסים",
    address: "רח' דיזנגוף 200, תל אביב",
    parking: "חניון צמוד בתשלום ברח' ארלוזורוב 17 (מחיר אחיד: 120 ₪)",
    infoUrl: "https://www.aeai.org.il/branch/tel-aviv/",
    mapsQuery: "Dizengoff 200 Tel Aviv",
  },
  registerUrl: "https://intelligence-and-data-conference-2026.form-wizard.co/users/new",
  registration: {
    price: "מחיר השתתפות: 120 ₪",
    includes: "הרישום כולל כיבוד קל, וארוחת צהרים קלה",
    scholarship:
      "זכאי מלגת קרן ידע הנדסי-אקדמי יוכלו לנצל מלגה בהתאם לקריטריונים הנהוגים בקרן, בכפוף לאישור הקרן וליתרת המלגה של העמית בקרן במועד סיום הכנס.",
    limited: "מספר המקומות מוגבל.",
    help: "לשאלות נוספות בנושא רישום, רישום קבוצות וקבלת מידע נוסף, ניתן לפנות לאורנית, רכזת הרישום בדוא״ל:",
    helpEmail: "ornit@aeai.org.il",
  },
  contact: {
    name: "גבריאל קרסקס",
    role: "מנהל איגוד מדעי הנתונים",
    email: "gabriel@aeai.org.il",
    phone: "03-5205814",
    accessibility:
      "המקום מונגש לבעלי מוגבלות בניידות וכולל מערכת עזר לשמע. לשאלות, בקשות ולשימוש במערכת השמע יש לפנות עד 7 ימים לפני הפעילות",
  },
  archiveLinks: [
    { year: "2025", url: "https://ws.eventact.com/datascience" },
    { year: "2024", url: "https://www.aeai.org.il/software-data-conference-2024/" },
    { year: "2023", url: "https://www.aeai.org.il/software-data-conference-2023/" },
  ],
  goals: [
    "המקום השנתי להציג, לדבר, לפרסם, להיפגש ולהדגים תוכנה ונתונים.",
    "למזג תעשייה, הייטק, צבא, ממשל ואקדמיה סביב בינה ונתונים.",
    "בניית קהילה מקצועית בתחום.",
  ],
  about:
    "כנס ׳בינה׳ הוא הכנס השנתי של איגוד מדעי הנתונים בלשכת המהנדסים. בינה מלאכותית הופכת לבעלת השפעה גדולה על החברה ועל אורח החיים של כולנו. היא מהווה בסיס לכל פרויקט בארגונים בתעשיות השונות, ובשנים האחרונות נלמדת בחינוך הגבוה, בבתי הספר ובמסלולי ההדרכה של הארגונים העסקיים. הכנס הוא מפגש בין תעשייה, הייטק, אקדמיה, מערכת החינוך וגורמי מקצוע — חיבור בין ידע וטכנולוגיה לבין היישומים והאתגרים שבשטח.",
  topics: [
    "AI and data analysis techniques",
    "IoT and Industrial IoT",
    "AR/VR",
    "Digital twins",
    "Software & Data in verticals (Healthcare, City, Home, Mobility)",
    "Explainable AI",
    "Adversarial machine learning",
    "Ethical and social aspects of data technology",
    "Organizational changes for data tech",
    "Data driven innovation",
    "Roles & Responsibilities in Data",
    "Decision making & Statistics",
  ],
  dayPlan: [
    { time: "08:30 – 09:00", label: "התכנסות וכיבוד" },
    { time: "09:00 – 09:30", label: "ברכות" },
    {
      time: "09:30 – 11:10",
      label: "מושב DATA & EDUCATION",
      href: "#session-tabs",
      track: "track-1",
      glow: true,
    },
    { time: "11:10 – 11:25", label: "הפסקה" },
    {
      time: "11:25 – 12:45",
      label: "מושב בינה מלאכותית בחיי היום-יום",
      href: "#session-tabs",
      track: "track-2",
      glow: true,
    },
    { time: "12:45 – 12:55", label: "הפסקה" },
    {
      time: "12:55 – 14:15",
      label: "מושב מובילים AI",
      href: "#session-tabs",
      track: "track-3",
      glow: true,
    },
    { time: "14:15 – 15:00", label: "תערוכת פוסטרים", href: "#posters", glow: true },
    { time: "15:00 – 15:30", label: "נטוורקינג וסיום" },
  ],
};

const P = {
  eilat: {
    id: "eilat-toker",
    name: "ד״ר אילת טוקר",
    role: "ראש החוג לניתוח מידע ונתונים",
    org: "המכללה האקדמית בית ברל",
    photo: "/speakers/eilat-toker.jpg",
    email: "eilat.smkb@gmail.com",
    bio: "ראש החוג למידע ונתונים במכללה האקדמית בית ברל, ועומדת גם בראש המסלול האלטרנטיבי להוראה במכללה. מדריכה מחוזית בתחום המדידה וההערכה במשרד החינוך. עבודתה משלבת הכשרת מורים, פיתוח תכניות לימוד באנליזת נתונים, ועיצוב הכשרה לרכזי הערכה. בשנים האחרונות היא מובילה שילוב של כלי בינה מלאכותית בהוראה ובהערכה.",
  },
  becky: {
    id: "becky-leshem",
    name: "ד״ר בקי לשם",
    role: "דיקנית הפקולטה לחינוך ומנהיגות",
    org: "המכללה האקדמית אחווה",
    photo: "/speakers/becky-leshem.jpg",
    email: "becky.leshem@achva.ac.il",
    bio: "מרצה וחוקרת בתחום החינוך, המתמקדת בחוסן נפשי וחינוכי, מיינדפולנס בהוראה, ונוירו-פדגוגיה. עבודתה עוסקת בקידום גמישות מחשבתית, רווחה נפשית של לומדים ומורים, ופיתוח מודלים פדגוגיים המשלבים תובנות ממדעי המוח עם פרקטיקות חינוכיות.",
  },
  rami: {
    id: "rami-inbar",
    name: "רמי ענבר",
    role: "מנהל המרכז לדאטה",
    org: "האוניברסיטה הפתוחה",
    photo: "/speakers/rami-inbar.jpg",
    email: "Rami@openu.ac.il",
    bio: "מנהל המרכז לדאטה ובינה ארגונית באוניברסיטה הפתוחה. מוביל פרויקטים לבניית תשתיות דאטה מתקדמות, יישום פתרונות מבוססי בינה מלאכותית וניתוחים שמקדמים תהליכים מבוססי נתונים — הן בתהליכי העבודה הפנימיים והן מול הסטודנטים.",
  },
  yaelAlon: {
    id: "yael-alon",
    name: "יעל אלון יצחקי",
    role: "מובילת המכון הישראלי לחדשנות בחינוך",
    org: "המכון הישראלי לחדשנות בחינוך",
    photo: "/speakers/yael-alon.jpg",
    email: "5667yael@gmail.com",
    bio: "מייסדת ומובילת המכון הישראלי לחדשנות בחינוך, הפועל לחיבור בין מערכת החינוך לתעשייה להכנת דור העתיד. מובילה שיתופי פעולה עם חברות מובילות במשק, מפתחת תוכניות מנטורינג וחדשנות, ומקדמת מודלים המחברים בין ידע, מיומנויות וערכים.",
  },
  ronit: {
    id: "ronit-nehemia",
    name: "רונית נחמיה",
    role: "מפמ״רית מידע ונתונים לשעבר",
    org: "משרד החינוך",
    email: "ronit2107@gmail.com",
    photo: "/speakers/ronit-nehemia.jpg",
    bio: "לשעבר מפקחת על תחום מידע ונתונים במשרד החינוך. בעלת תואר ראשון בלשון וג״ג ותואר שני בלימודי מידע בבר-אילן. בעברה שימשה גם כמנהלת יריד המגמות הטכנולוגיות ומפקחת על תכנית התקשוב הלאומית.",
  },
  noam: {
    id: "noam-brenner",
    name: "ד״ר נועם ברנר",
    role: "פוסט-דוקטורנט",
    org: "הפקולטה לחינוך מדע וטכנולוגיה, הטכניון",
    photo: "/speakers/noam-brenner.jpg",
    email: "noam.brenner@campus.technion.ac.il",
  },
  yaelErez: {
    id: "yael-erez",
    name: "ד״ר יעל ארז",
    role: "חברת סגל",
    org: "הפקולטה למדעי המחשב והפקולטה לחינוך, הטכניון",
    photo: "/speakers/yael-erez.jpg",
    email: "yaelerez@cs.technion.ac.il",
  },
  ido: {
    id: "ido-ram",
    name: "מר עידו רם",
    role: "דוקטורנט",
    org: "הפקולטה למדעי המחשב, הטכניון",
    photo: "/speakers/ido-ram.jpg",
    email: "andevstdio23@gmail.com",
  },
  avigail: {
    id: "avigail-yampolsky",
    name: "גב׳ אביגיל ימפולסקי",
    role: "סטודנטית לתואר שני",
    org: "הפקולטה למדעי המחשב, הטכניון",
    photo: "/speakers/avigail-yampolsky.jpg",
    email: "avigailyampolsky@gmail.com",
  },
  dikla: {
    id: "dikla-tavor",
    name: "דקלה תבור",
    role: "Head of Innovation and Strategic Solutions",
    org: "מטריקס דבאופס",
    email: "diklat@matrix.co.il",
  },
  anat: {
    id: "anat-hines",
    name: "ענת היינס",
    role: "יזמת ויועצת עצמאית",
    org: "מנטורינג וייעוץ טכנולוגי",
    photo: "/speakers/anat-hines.jpg",
  },
  tomer: {
    id: "tomer-carmi",
    name: "תומר כרמי",
    role: "יזם ויועץ עצמאי",
    org: "מנטורינג וייעוץ טכנולוגי",
    photo: "/speakers/tomer-carmi.jpg",
    email: "tomerc666@gmail.com",
    bio: "לשעבר מנהל פיתוח ומוביל קבוצות טכנולוגיות, בעל כ־20 שנות ניסיון בפיתוח, ניהול והובלת שינוי. כיום מאמן ומנטור למנהלים טכנולוגיים, המלווה מנהלים וארגונים בשיפור ביצועים, אג׳ייל והטמעת AI.",
  },
  amir: {
    id: "amir-navon",
    name: "ד״ר אמיר נבון",
    role: "בכיר באקדמית כנרת",
    org: "המכללה האקדמית כנרת",
    photo: "/speakers/amir-navon.jpg",
    email: "amirn@kinneret.ac.il",
    bio: "מרצה בארץ ובעולם, בכיר באקדמית כנרת, חוקר ומרצה בתחומי הניהול האפקטיבי. עוסק באתגרים ניהוליים, סוכני שינוי, קבלת החלטות מבוססות נתונים וניהול כישרונות כבסיס לחדשנות ויזמות בארגון.",
  },
  giora: {
    id: "giora-goren",
    name: "גיורא לינדנבאום-גורן",
    role: "עורך פטנטים מוסמך",
    org: "Goren IP",
    photo: "/speakers/giora-goren.jpg",
    email: "giora@goren-ip.com",
    bio: "עורך פטנטים מוסמך ומהנדס. קניין רוחני ל-AI, טכנולוגיות קוונטיות, מכשור רפואי ומערכות אנרגיה.",
  },
  tzachi: {
    id: "tzachi-lotati",
    name: "צחי לוטטי",
    role: "CTO",
    org: "בנק דיסקונט",
    photo: "/speakers/tzachi-lotati.jpg",
    email: "nir.abel@dbank.co.il",
  },
  michal: {
    id: "michal-shlomy",
    name: "מיכל שלומי",
    role: "יו״ר משותף",
    org: "המכון לניהול אג׳ילי",
    photo: "/speakers/michal-shlomy.jpg",
    email: "michal@michalshlomy.co.il",
    bio: "יו״ר משותף המכון לניהול אג׳ילי, מומחית לניהול וחדשנות.",
  },
} satisfies Record<string, Person>;

export const SESSIONS: Session[] = [
  {
    id: "track-1",
    title: "מושב DNE DATA & EDUCATION",
    leader: "רונית נחמיה",
    time: "09:30 – 11:10",
    accent: "from-cyan-400 to-sky-500",
    lectures: [
      {
        time: "09:30 – 09:45",
        topic: "לנוע עם הנתונים אל גובה העיניים: הוראה של נתונים בעידן של AI",
        speakers: [P.eilat],
      },
      {
        time: "09:50 – 10:15",
        topic: "חינוך מבוסס דאטה: הכשרת מורים למגמת מידע ונתונים",
        speakers: [P.becky],
      },
      {
        time: "10:20 – 10:35",
        topic: "דאטה, אנשים וחדשנות — החיבור שמייצר השפעה",
        speakers: [P.rami],
      },
      {
        time: "10:40 – 10:55",
        topic: "הקשר בין החינוך לתעשייה",
        speakers: [P.yaelAlon],
      },
      {
        time: "11:00 – 11:10",
        topic: "אולימפיאדאטה — אפשרות להפעלת המשתתפים בפתרון חידות",
        speakers: [P.ronit],
      },
    ],
  },
  {
    id: "track-2",
    title: "מושב בינה מלאכותית בחיי היום-יום",
    leader: "איתי דברן",
    time: "11:25 – 12:45",
    accent: "from-sky-400 to-indigo-400",
    lectures: [
      {
        time: "11:25 – 11:45",
        topic: "מסיפורים לדאטה: כיצד בינה מלאכותית מסייעת בניהול פרויקטים מרובי-משתתפים",
        speakers: [P.noam],
      },
      {
        time: "11:45 – 12:05",
        topic: "סטודנטים לתחומי STEM ובינה יוצרת: דפוסים ותובנות",
        speakers: [P.yaelErez],
      },
      {
        time: "12:05 – 12:25",
        topic: "צר יותר הוא יותר טוב: המרה מבוססת מטרה של ממשקים לסוכני AI של תוכנה",
        speakers: [P.ido],
      },
      {
        time: "12:25 – 12:45",
        topic: "Causal Sensitivity Through Diffusion-Based Synthetic Data Augmentation",
        speakers: [P.avigail],
      },
    ],
  },
  {
    id: "track-3",
    title: "מושב מובילים AI: מעבדה לחדשנות ויעילות",
    leader: "מיכל שלומי",
    time: "12:55 – 14:15",
    accent: "from-fuchsia-400 to-cyan-400",
    lectures: [
      {
        time: "12:55 – 13:15",
        topic: "בינה בתהליכי ניהול, חדשנות אג׳ילית בניהול פרויקט מורכב קפדני",
        speakers: [P.dikla],
      },
      {
        time: "13:15 – 13:35",
        topic: "הבינה בסיעור מוחות בחדשנות, פיצוח אתגרי מנהלי הפיתוח",
        speakers: [P.anat, P.tomer],
      },
      {
        time: "13:35 – 13:50",
        topic: "חדשנות בעידן ה-AI וקידום הכשרות הייטק בשפת הכנרת",
        speakers: [P.amir, P.giora],
      },
      {
        time: "13:50 – 14:10",
        topic: "שימוש מאובטח בבינה מלאכותית בארגוני ענק",
        speakers: [P.tzachi],
      },
      {
        time: "14:10 – 14:15",
        topic: "לקראת 2040, מהו תפקיד ההורים בהצלחה טכנולוגית של הילדים הבוגרים?",
        speakers: [P.michal],
      },
    ],
  },
];

export const POSTERS: Poster[] = [
  {
    id: 1,
    presenter: "שירן קרסיק",
    institution: "מדעי המחשב, הטכניון",
    title: "DataSetGo — All-in-one trip planner",
    desc: "Collect all important information, schedule top picks, and travel with no worry in mind.",
    email: "Karasiksh@gmail.com",
  },
  {
    id: 2,
    presenter: "דריה בבין",
    institution: "מדעי המחשב, הטכניון",
    title: "Stickers of Meaning",
    desc: "A mobile application dedicated to honoring the legacy of the victims of the Swords of Iron war.",
    email: "Dashay@campus.technion.ac.il",
  },
  {
    id: 3,
    presenter: "סמיחה עאלם",
    institution: "מדעי המחשב, הטכניון",
    title: "GitNote",
    desc: "A smart note-taking app providing a unified digital workspace where students can write, organize, and manage their study materials.",
    email: "smeha.alem@campus.technion.ac.il",
  },
  {
    id: 4,
    presenter: "אחמד עבדולחלים",
    institution: "מדעי המחשב, הטכניון",
    title: "AisleBook",
    desc: "An AI-powered wedding planning platform.",
    email: "ahmad-ab@campus.technion.ac.il",
  },
  {
    id: 5,
    presenter: "מרום שמואלי",
    institution: "מדעי המחשב, הטכניון",
    title: "Stickeep",
    desc: "An accessible seat reservation system for students with disabilities.",
    email: "Maromshmueli@campus.technion.ac.il",
  },
  {
    id: 6,
    presenter: "סילין אבו שקרה",
    institution: "מדעי המחשב, הטכניון",
    title: "MindGuard",
    desc: "An all-in-one focus and productivity app for habit building, reducing distractions, and task management.",
    email: "selen.abu@campus.technion.ac.il",
  },
  {
    id: 7,
    presenter: "מלק סלימאן",
    institution: "מדעי המחשב, הטכניון",
    title: "Himam",
    desc: "Connecting volunteers with their community, one task at a time.",
    email: "Smalak@campus.technion.ac.il",
  },
  {
    id: 8,
    presenter: "רגד ח׳ליל",
    institution: "מדעי המחשב, הטכניון",
    title: "IoT Clinic Medication Service",
    desc: "An advanced IoT system bridging healthcare gaps for uninsured populations through smart records, kiosk ID issuance, and automated pharmacy tracking.",
    email: "raghadkhalil@campus.technion.ac.il",
  },
  {
    id: 9,
    presenter: "אודי מרקל ורועי שריד",
    institution: "הנדסת תעשייה וניהול, רופין",
    title: "Teamgle",
    desc: "Innovative team management platform.",
    email: "udimarkel4@gmail.com",
  },
];

export const COMMITTEE: { name: string; role: string; photo?: string }[] = [
  { name: "פרופ׳ יעל דובינסקי", role: "יו״ר הכנס", photo: "/speakers/yael-dubinsky.jpg" },
  { name: "איתי דברן", role: "חבר ועדת היגוי", photo: "/speakers/itai-dabran.jpg" },
  { name: "רונית נחמיה", role: "חברת ועדת היגוי", photo: "/speakers/ronit-nehemia.jpg" },
  { name: "מיכל שלומי", role: "חברת ועדת היגוי", photo: "/speakers/michal-shlomy.jpg" },
];

export const NAV = [
  { href: "#home", label: "בית" },
  { href: "#about", label: "אודות" },
  { href: "#program", label: "תוכנית" },
  { href: "#posters", label: "פוסטרים" },
  { href: "#speakers", label: "דוברים" },
  { href: "#committee", label: "ועדת היגוי" },
  { href: "#contact", label: "יצירת קשר והגעה" },
];

export function uniqueSpeakers(): Person[] {
  const map = new Map<string, Person>();
  for (const session of SESSIONS) {
    for (const lecture of session.lectures) {
      for (const speaker of lecture.speakers) {
        map.set(speaker.id, speaker);
      }
    }
  }
  return [...map.values()];
}
