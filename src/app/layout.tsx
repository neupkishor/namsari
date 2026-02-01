import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-outfit"
});

export const metadata = {
  title: "Namsari",
  description: "Experience the difference with Namsari.",
};

import Providers from "./providers";
import { Footer } from "@/components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
