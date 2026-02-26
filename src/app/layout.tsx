import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Re:Formd | Health Optimization & Performance System",
  description:
    "Re:Formd is a data-driven health optimization platform combining biomarker tracking, hormone optimization, and structured performance protocols to restore energy, improve recovery, and build long-term longevity.",
  metadataBase: new URL("https://getreformd.com"),
  openGraph: {
    title: "Re:Formd | Health Optimization & Performance System",
    description:
      "Data-driven health optimization. Biomarker tracking. Hormone optimization. Structured performance systems.",
    url: "https://getreformd.com",
    siteName: "Re:Formd",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
