import type { Metadata } from "next";
import { Fraunces, DM_Sans, Noto_Serif_Tamil } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const notoSerifTamil = Noto_Serif_Tamil({
  subsets: ["tamil"],
  weight: ["400", "600"],
  variable: "--font-noto-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Varalaru · வரலாறு",
  description: "Explore Tamil leaders, quotes, and history - from ancient kings to modern statesmen.",
  openGraph: {
    title: "Varalaru · வரலாறு",
    description: "Explore Tamil leaders, quotes, and history.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${notoSerifTamil.variable}`}>
      <body>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { -webkit-font-smoothing: antialiased; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(176,125,42,0.35); border-radius: 4px; }
          a { color: inherit; }
          @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes pulse   { 0%, 100% { opacity: .3; transform: scale(.8) } 50% { opacity: 1; transform: scale(1.2) } }
        `}</style>
        {children}
      </body>
    </html>
  );
}
