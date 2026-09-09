import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { BASE_PATH } from "@/lib/paths";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "כנס בינה 6 | איגוד מדעי הנתונים · לשכת המהנדסים",
  description:
    "הכנס השנתי של איגוד מדעי הנתונים בלשכת המהנדסים — 19.11.2026, בית המהנדס, תל אביב.",
  icons: {
    icon: [{ url: `${BASE_PATH}/icon.png`, type: "image/png", sizes: "192x192" }],
    apple: [{ url: `${BASE_PATH}/apple-icon.png`, sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-heebo antialiased">{children}</body>
    </html>
  );
}
