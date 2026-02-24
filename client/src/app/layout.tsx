import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google"; // Import both
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

// UI Font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Artistic/Lyrics Font
const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zemeromo | Gospel Music Hub",
  description: "The digital home for Ethiopian Gospel Choirs and Lyrics.",
  icons: { icon: "./zemeromo.png" }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="antialiased selection:bg-primary selection:text-white">

        <AuthProvider>
          {children}
          <Toaster position="bottom-right" richColors theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}