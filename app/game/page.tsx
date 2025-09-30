"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { CoinFlipGame } from "@/components/coin-flip-game"
import { CardGame } from "@/components/card-game"
import { DiceGame } from "@/components/dice-game"
import { LimboGame } from "@/components/limbo-game"
import { PlinkoGame } from "@/components/plinko-game"
import { GameStats } from "@/components/game-stats"
import { BetHistory } from "@/components/bet-history"
import { WalletConnect } from "@/components/wallet-connect"
import { XPLBalanceDisplay } from "@/components/xpl-balance-display"
import { XPLTransactionHistory } from "@/components/xpl-transaction-history"
import { HouseWalletStatus } from "@/components/house-wallet-status"
import { TransactionTester } from "@/components/transaction-tester"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Coins, Shield, Zap, Dice1, Target, Circle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useEffect, useState } from "react"

export default function GamePage() {
  const { walletState } = useWallet()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeGame, setActiveGame] = useState("coinflip")

  useEffect(() => {
    const gameParam = searchParams.get('game')
    if (gameParam) {
      setActiveGame(gameParam)
    }
  }, [searchParams])

  return (
    <LayoutWrapper>
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Button>
      </div>

      {!walletState.isConnected ? (
        /* Wallet Connection Required */
        <div className="max-w-2xl mx-auto">
          <Card className="text-center bg-gradient-to-br from-blue-800/90 to-purple-800/90 backdrop-blur-sm border-cyan-500/50">
            <CardHeader>
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-white">Connect Your Wallet</CardTitle>
              <CardDescription className="text-lg text-gray-300">
                Connect your wallet to start playing Head or Tail with XPL tokens on Plasma Network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <WalletConnect />
              </div>

              <Separator />

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Secure & Fair</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <span>Instant Payouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span>Pattern-Based</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Game Interface */
        <div className="space-y-8">
          {/* Game Stats and House Status */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-white">Game Statistics</h2>
              <GameStats />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white">Platform Status</h2>
              <HouseWalletStatus />
            </div>
          </div>


          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Game */}
            <div className="lg:col-span-2">
              <div className="w-full">
                {activeGame === "heavenly-flip" && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-white">Betzy Flip</h2>
                    <CoinFlipGame />
                  </>
                )}
                {activeGame === "divine-colors" && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-white">Divine Colors</h2>
                    <CardGame />
                  </>
                )}
                {activeGame === "divine-dice" && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-white">Divine Dice</h2>
                    <DiceGame />
                  </>
                )}
                {activeGame === "celestial-limbo" && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-white">Celestial Limbo</h2>
                    <LimboGame />
                  </>
                )}
                {activeGame === "plinko" && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-white">Plinko</h2>
                    <PlinkoGame />
                  </>
                )}
                {!["heavenly-flip", "divine-colors", "divine-dice", "celestial-limbo", "plinko"].includes(activeGame) && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-white">Coin Flip Game</h2>
                    <CoinFlipGame />
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* XPL Balance Display */}
              <XPLBalanceDisplay />

              {/* Transaction Tester */}
              <TransactionTester />

              {/* Tabbed interface for history */}
              <Tabs defaultValue="bets" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bets">Bet History</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                <TabsContent value="bets">
                  <BetHistory />
                </TabsContent>
                <TabsContent value="transactions">
                  <XPLTransactionHistory />
                </TabsContent>
              </Tabs>

              {/* Game Info */}
              <Card className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Game Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Payout:</span>
                    <span className="font-semibold text-white">2x bet amount</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Min Bet:</span>
                    <span className="font-semibold text-white">0.001 XPL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Max Bet:</span>
                    <span className="font-semibold text-white">50% of balance</span>
                  </div>
                  <Separator />
                  <div className="text-xs text-gray-400">
                    <p>
                      <strong>Coin Flip:</strong> Choose Heads or Tails
                    </p>
                    <p>
                      <strong>Cards:</strong> Choose Joker or King
                    </p>
                    <p>• Set your bet amount</p>
                    <p>• Win 2x your bet if you're the lucky player</p>
                    <p>• Instant payouts from house wallet</p>
                  </div>
                </CardContent>
              </Card>

              {/* Network Info */}
              <Card className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Network Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Network:</span>
                    <Badge variant="secondary">Plasma</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Chain ID:</span>
                    <span className="font-mono text-white">9745</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Currency:</span>
                    <span className="font-semibold text-white">XPL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Your Balance:</span>
                    <span className="font-semibold text-white">{walletState.balance || "0"} XPL</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  )
}
