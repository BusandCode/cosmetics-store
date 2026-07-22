import "./globals.css";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
// const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", weight: ["500", "600"] });

export const metadata = {
  title: "Cosmetics Store",
  description: "Deodorants, perfumes, and costumes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable}`}>
      <body className="bg-white text-black font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}