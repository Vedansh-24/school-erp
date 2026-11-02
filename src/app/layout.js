import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// School portal metadata aur PWA manifest configuration[cite: 13]
export const metadata = {
  title: "MySchoolDashboard ERP System",[cite: 13]
  description: "Blue Heaven Kids Academy Staff Portal",[cite: 13]
  manifest: "/manifest.json",[cite: 13]
};

// Mobile browser ke liye theme color[cite: 13]
export const viewport = {
  themeColor: "#1B3A6B",[cite: 13]
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}