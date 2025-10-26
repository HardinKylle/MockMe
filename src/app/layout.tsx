import type { Metadata } from "next";
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

export const metadata = {
  title: "MockMe",
};


// Add this component definition
const DesktopOnlyMessage = () => {
  return (
    <div id="desktop-only-message">
      <div className="message-content">
        <h2>Best Viewed on Desktop</h2>
        <p>
          This application is designed for a desktop experience. Please switch
          to a larger screen for full functionality.
        </p>
      </div>
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* USE YOUR GEIST FONT VARIABLES HERE */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> 
        <DesktopOnlyMessage />
        <div id="main-app-content">
          {children}
        </div>
      </body>
    </html>
  );
}