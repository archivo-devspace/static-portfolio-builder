import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./_components/navbar";
import Footer from "./_components/footer";
import FirstTimeInstructions from "./_components/first-time-instructions";

// Google Fonts with variables
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-roboto-mono" });

export const metadata: Metadata = {
  title: "Static Portfolio Builder",
  description: "A platform to upload, deploy, and preview static portfolios. Developed by Archivo DevSpace.",
  authors: [{ name: "Archivo DevSpace", url: "https://archivodevspace.com" }],
  keywords: ["portfolio", "static site", "deployment", "nextjs", "developer", "Archivo DevSpace"],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Static Portfolio Builder",
    description: "Upload and deploy your static portfolios instantly with live preview.",
    url: "https://archivodevspace.com",
    siteName: "Archivo DevSpace",
    images: [
      {
        url: "/og-image.jpg", // internal image in /public folder
        width: 1200,
        height: 630,
        alt: "Static Portfolio Builder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Static Portfolio Builder",
    description: "Upload and deploy your static portfolios instantly with live preview.",
    site: "@archivodevspace",
    creator: "@archivodevspace",
    images: ["/og-image.jpg"], // internal image in /public folder
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${robotoMono.variable} bg-gray-50`}>
        <FirstTimeInstructions />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
