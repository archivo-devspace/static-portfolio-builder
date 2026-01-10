import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./_components/navbar";
import Footer from "./_components/footer";

// Google Fonts with variables
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-roboto-mono" });

export const metadata: Metadata = {
  title: "Static Portfolio Builder",
  description: "Developed by Archivo DevSpace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${robotoMono.variable} bg-gray-50`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
