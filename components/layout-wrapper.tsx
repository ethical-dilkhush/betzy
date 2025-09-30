"use client"

import { TopHeader } from "@/components/top-header"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden flex flex-col">
      {/* Starry Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      <TopHeader />

      <main className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 pt-24 md:pt-32 flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-blue-900/80 via-blue-800/80 to-purple-900/80 backdrop-blur-sm border-t border-cyan-400/30 py-3 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
          <p className="text-white/80 text-xs md:text-sm">
            © 2025 All Rights Reserved Betzy
          </p>
        </div>
      </footer>
    </div>
  )
}
