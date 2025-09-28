import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smartclip | AI video highlighter",
  description: "Turn any video into shareable highlights with AI-powered analysis."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
