import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { WalletProvider } from "@/hooks/use-wallet"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "BETZY",
  description: "Experience divine gaming with celestial rewards on the Plasma Network",
  generator: "Betzy",
  icons: {
    icon: "/betz.webp",
    shortcut: "/betz.webp",
    apple: "/betz.webp",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <WalletProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
