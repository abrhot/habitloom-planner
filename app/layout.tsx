import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Habitloom — Daily Planner & Habit Tracker",
  description: "Build lasting habits with daily tracking, task management, and event planning.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakartaSans.variable} ${dmSerif.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>{children}</Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
