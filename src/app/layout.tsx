import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from 'sonner';
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DesktopOnlyMessage />
        <Toaster
          theme="dark"
          position="top-left"
          toastOptions={{
            style: {
              background: 'rgb(15 23 42 / 0.95)',
              border: '1px solid rgb(51 65 85 / 0.5)',
              color: '#e2e8f0',
            },
          }}
        />
        <div id="main-app-content">
          <AppProvider>{children}</AppProvider>
        </div>
      </body>
    </html>
  );
}