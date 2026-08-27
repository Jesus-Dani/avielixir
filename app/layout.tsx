import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/layout/GoogleAnalytics";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Avi Elixir | Scents That Define You",
  description:
    "Affordable, premium fragrances for teens and young adults in Nigeria. Perfumes, body mists, and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
