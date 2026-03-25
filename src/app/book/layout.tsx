import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import type { Metadata } from "next";

const bookSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-book-serif",
  display: "swap",
});

const bookSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-book-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "You Are Not Dead Yet",
  description:
    "A Body Repair Manual for People Who Refuse to Feel Old — Brant Wadsworth, Re:Formd.",
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${bookSerif.variable} ${bookSans.variable} min-h-screen bg-[#0E0E0E] text-[#F0EBE0] antialiased`}
    >
      {children}
    </div>
  );
}
