"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { WalletConnect } from "@/components/wallet-connect"
import { useWallet } from "@/hooks/use-wallet"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Coins, Diamond, Dice1, TrendingUp, Zap, Star, Sparkles } from "lucide-react"
import Link from "next/link"

const games = [
  {
    id: "divine-colors",
    name: "Divine Colors",
    icon: Diamond,
    description: "Pick your favourite colour and test your luck!",
    gradient: "from-red-500 to-green-500",
    gameType: "COLORS",
    image: "/colour.webp",
  },
  {
    id: "heavenly-flip",
    name: "Betzy Flip",
    icon: Coins,
    status: null,
    description: "Classic coin flip with celestial rewards",
    gradient: "from-blue-500 to-purple-500",
    gameType: "COIN FLIP",
    image: "/betzy.webp",
  },
  {
    id: "divine-dice",
    name: "Divine Dice",
    icon: Dice1,
    status: null,
    description: "Roll the dice for betzy wins",
    gradient: "from-green-500 to-blue-500",
    gameType: "DICE ROLL",
    image: "/dice.webp",
  },
  {
    id: "celestial-limbo",
    name: "Celestial Limbo",
    icon: TrendingUp,
    status: null,
    description: "How high can you go?",
    gradient: "from-yellow-500 to-orange-500",
    gameType: "LIMBO",
    image: "/limbo.webp",
  },
  {
    id: "plinko",
    name: "Plinko",
    icon: Zap,
    status: null,
    description: "Drop the ball and watch it bounce to victory",
    gradient: "from-purple-500 to-pink-500",
    gameType: "PLINKO",
    image: "/plinko.webp",
  },
]

export default function HomePage() {
  const { walletState } = useWallet()

  return (
    <LayoutWrapper>
      {!walletState.isConnected ? (
        /* Wallet Connection Required */
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-blue-800/90 to-purple-800/90 backdrop-blur-sm border-cyan-500/50">
            <CardContent className="text-center py-8">
              <div className="mb-6">
                <div className="h-16 w-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">Welcome to Betzy</h2>
                <p className="text-xl text-gray-300 mb-6">
                  Connect your wallet to experience divine gaming with celestial rewards on the Plasma Network
                </p>
                <div className="flex justify-center">
                  <WalletConnect />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Main Game Selection */
        <div className="space-y-6 md:space-y-12">
          {/* Title Section Above Hero */}
          <div className="text-center mb-0 md:mb-0">
            <div className="mb-1 md:mb-2">
              <div className="betzy-container h-20 sm:h-20 md:h-24 lg:h-32">
                <span className="betzy-key">B</span>
                <span className="betzy-key">E</span>
                <span className="betzy-key">T</span>
                <span className="betzy-key">Z</span>
                <span className="betzy-key">Y</span>
              </div>
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-2 md:mb-3 font-medium drop-shadow-md px-4">
              Experience divine gaming with celestial rewards
            </p>
            <Badge variant="secondary" className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border-cyan-400/50 text-sm md:text-lg px-4 md:px-6 py-1 md:py-2 backdrop-blur-sm shadow-lg">
              Powered by XPL Tokens
            </Badge>
          </div>

          {/* Hero Section */}
          <div className="relative mb-6 md:mb-12">
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden">
              <img 
                src="/heros.webp" 
                alt="Betzy"
                className="w-full h-full object-contain rounded-t-2xl md:rounded-t-4xl rounded-b-2xl"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            </div>
          </div>

          {/* Games Title */}
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
              Games
            </h2>
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {games.map((game) => (
              <Link key={game.id} href={`/game?game=${game.id}`}>
                  <CardContent className="p-0">
                    {/* Game Image Cover - Auto Height */}
                    <div className="relative w-full overflow-hidden rounded-t-xl">
                      <img 
                        src={game.image} 
                        alt={game.name}
                        className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    {/* Content Below Image */}
                    <div className="p-3 md:p-4 text-center space-y-2 md:space-y-3 bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-sm rounded-b-xl border-t border-cyan-500/20">
                      {/* Game Description */}
                      <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-medium">{game.description}</p>

                      {/* Play Now Button */}
                      <div className="pt-1">
                        <div className="inline-flex items-center justify-center gap-1 md:gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-300 group-hover:scale-105">
                          <Star className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="text-xs md:text-sm">PLAY NOW</span>
                          <Star className="h-3 w-3 md:h-4 md:w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
              </Link>
            ))}
          </div>

          {/* Bottom Wheel Fortune Section */}
          
        </div>
      )}
    </LayoutWrapper>
  )
}
