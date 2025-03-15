import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import ThemeProvider from "./_components/theme-provider";
import Navbar from "./_components/navbar";
import { SessionProvider } from "next-auth/react";
import Footer from "./_components/footer";

export const metadata: Metadata = {
  title: "SS",
  description: "SS",
  icons: [{ rel: "icon", url: "/mental-health-icon.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <SessionProvider>
        <TRPCReactProvider>
          <ThemeProvider>
            <Navbar />
            <main className="container mx-auto p-4">{children}</main>
            <Footer/>
          </ThemeProvider>
        </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
