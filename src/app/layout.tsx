import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "やることタイマー",
  description: "子どもの支度をたのしく",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "やること" },
};

export const viewport: Viewport = {
  themeColor: "#fb923c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
