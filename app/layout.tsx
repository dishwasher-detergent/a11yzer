import type { Metadata } from "next";
import { IBM_Plex_Mono, Karla } from "next/font/google";
import { Toaster } from "sonner";

import { SessionProvider } from "@/providers/session-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const karla = Karla({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "200", "500", "600"],
});

export const metadata: Metadata = {
  title: "A11yzer",
  description: "Analyze the accessibility of your web pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${karla.variable} ${ibmPlexMono.variable} min-h-dvh overflow-x-hidden antialiased flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
            <div id="modal-root" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
