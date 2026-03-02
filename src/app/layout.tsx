import "./globals.css";
import SiteNav from "@/components/site-nav";

export const metadata = {
  title: "Re:Formd",
  description: "Built to Last.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <SiteNav />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
