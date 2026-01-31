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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        {children}
      </body>
    </html>
  );
}
