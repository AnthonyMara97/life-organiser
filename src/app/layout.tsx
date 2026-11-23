import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Organiser",
  description: "A private household organiser.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU">
      <body className="bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
