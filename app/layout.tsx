import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppSidebar, MobileHeader } from "@/components/shared/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETF Compass - AI-Powered ETF Analysis",
  description: "Make informed ETF investment decisions with AI-powered analysis, real-time data, and personalized recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.variable} font-sans antialiased dark overflow-x-hidden`}>
        <SidebarProvider>
          <div className="flex min-h-screen w-full overflow-x-hidden">
            <AppSidebar />
            <main className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
              <MobileHeader />
              <div className="flex-1">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
