import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { PlacementProvider } from "@/context/PlacementContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlaceMe — Smart Placement & Career Tracking Portal",
  description:
    "Centralized placement portal for students and faculty. Browse drives, track applications, and manage your placement journey end-to-end.",
  icons: {
    icon: "/applogo.png",
    apple: "/applogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <PlacementProvider>{children}</PlacementProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
