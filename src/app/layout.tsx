import "./globals.css";

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
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
