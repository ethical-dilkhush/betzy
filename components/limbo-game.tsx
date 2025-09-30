"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, RotateCcw, CheckCircle, Zap, Star } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useBetting } from "@/hooks/use-betting"
import { useToast } from "@/hooks/use-toast"
import { GameResultModal } from "./game-result-modal"
import { cn } from "@/lib/utils"

type GameState = "idle" | "climbing" | "result"

export function LimboGame() {
  const { walletState } = useWallet()
  const { placeBet, isPlacingBet, lastBetResult } = useBetting()
  const { toast } = useToast()

  const [betAmount, setBetAmount] = useState("0.1")
  const [targetMultiplier, setTargetMultiplier] = useState("2.00")
  const [gameState, setGameState] = useState<GameState>("idle")
  const [showResult, setShowResult] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [currentMultiplier, setCurrentMultiplier] = useState(0.0)
  const [crashPoint, setCrashPoint] = useState(0.0)

  const minBet = "0.001"
  const maxBet = walletState.balance ? (Number.parseFloat(walletState.balance) * 0.5).toString() : "0"

  const handleBetAmountChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setBetAmount(value)
    }
  }

  const handleTargetMultiplierChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setTargetMultiplier(value)
    }
  }

  const setQuickBetAmount = (amount: string) => {
    setBetAmount(amount)
  }

  const calculatePotentialWin = () => {
    const bet = Number.parseFloat(betAmount) || 0
    const multiplier = Number.parseFloat(targetMultiplier) || 1
    return (bet * multiplier).toFixed(6)
  }

  const handlePlayLimbo = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place a bet",
        variant: "destructive",
      })
      return
    }

    const betAmountNum = Number.parseFloat(betAmount)
    const balanceNum = Number.parseFloat(walletState.balance || "0")
    const targetMultiplierNum = Number.parseFloat(targetMultiplier)

    if (betAmountNum < Number.parseFloat(minBet)) {
      toast({
        title: "Bet Too Small",
        description: `Minimum bet is ${minBet} XPL`,
        variant: "destructive",
      })
      return
    }

    if (betAmountNum > balanceNum) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough XPL for this bet",
        variant: "destructive",
      })
      return
    }

    if (targetMultiplierNum < 1.01) {
      toast({
        title: "Invalid Multiplier",
        description: "Target multiplier must be at least 1.01x",
        variant: "destructive",
      })
      return
    }

    setGameState("climbing")
    setShowResult(false)
    setCurrentMultiplier(1.0)

    toast({
      title: "Processing Bet",
      description: "Please confirm the transaction in your wallet...",
    })

    try {
      console.log("[v0] Starting limbo game bet placement...")

      // Place the bet using the same betting system as other games
      // We'll use the target multiplier as the "choice" parameter
      const result = await placeBet(betAmount, targetMultiplierNum > 2 ? "high" : "low")

      console.log("[v0] Limbo game bet result:", result)

      // Generate crash point based on game result and seed
      const seed = Number.parseInt(result.seed.slice(0, 8), 16)
      let finalCrashPoint: number

      if (result.won) {
        // If player should win, crash point should be higher than target
        finalCrashPoint = targetMultiplierNum + (seed % 100) / 100 + 0.1
      } else {
        // If player should lose, crash point should be lower than target
        const maxCrash = Math.max(1.01, targetMultiplierNum - 0.01)
        finalCrashPoint = 1.01 + (seed % Math.floor((maxCrash - 1.01) * 100)) / 100
      }

      setCrashPoint(finalCrashPoint)

      // Climbing animation
      const climbDuration = 3000
      const climbInterval = 50
      let climbCount = 0
      const maxClimbs = climbDuration / climbInterval
      const increment = finalCrashPoint / maxClimbs

      const climbAnimation = setInterval(() => {
        climbCount++
        const newMultiplier = Math.min(1.0 + increment * climbCount, finalCrashPoint)
        setCurrentMultiplier(newMultiplier)

        if (climbCount >= maxClimbs || newMultiplier >= finalCrashPoint) {
          clearInterval(climbAnimation)
          setCurrentMultiplier(finalCrashPoint)
          setGameState("result")
          setShowResult(true)

          if (result.won) {
            toast({
              title: "🚀 You Won!",
              description: `Crashed at ${finalCrashPoint.toFixed(2)}x! You won ${result.payout} XPL! Transaction: ${result.txHash.slice(0, 10)}...`,
              variant: "default",
            })
          } else {
            toast({
              title: "💥 Crashed!",
              description: `Crashed at ${finalCrashPoint.toFixed(2)}x before your target of ${targetMultiplierNum.toFixed(2)}x. Transaction: ${result.txHash.slice(0, 10)}...`,
              variant: "destructive",
            })
          }

          // Show result modal
          setTimeout(() => {
            setShowResultModal(true)
          }, 500)
        }
      }, climbInterval)
    } catch (error: any) {
      console.error("[v0] Limbo game bet placement error:", error)
      setGameState("idle")

      let errorMessage = "Failed to place bet"

      if (error.message.includes("User denied")) {
        errorMessage = "Transaction was cancelled by user"
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction"
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection to Plasma network"
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Bet Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const resetGame = () => {
    setGameState("idle")
    setShowResult(false)
    setShowResultModal(false)
    setCurrentMultiplier(0.0)
    setCrashPoint(0.0)
  }

  const isValidBetAmount = () => {
    const amount = Number.parseFloat(betAmount)
    const balance = Number.parseFloat(walletState.balance || "0")
    return amount >= Number.parseFloat(minBet) && amount <= balance && amount > 0
  }

  const isValidTargetMultiplier = () => {
    const multiplier = Number.parseFloat(targetMultiplier)
    return multiplier >= 1.01 && multiplier <= 1000
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Display */}
          <div className="lg:col-span-2">
            <Card className="relative overflow-hidden h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />

              {/* Floating stars */}
              <div className="absolute inset-0 overflow-hidden">
                <Star className="absolute top-4 left-8 h-4 w-4 text-yellow-400 animate-pulse" />
                <Star className="absolute top-12 right-12 h-3 w-3 text-blue-400 animate-pulse delay-300" />
                <Star className="absolute bottom-16 left-16 h-5 w-5 text-purple-400 animate-pulse delay-700" />
                <Star className="absolute bottom-8 right-8 h-4 w-4 text-pink-400 animate-pulse delay-500" />
              </div>

              <CardContent className="relative h-full flex flex-col items-center justify-center">
                {/* Multiplier Display */}
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-primary mb-2">x{currentMultiplier.toFixed(2)}</div>
                  {gameState === "climbing" && (
                    <div className="text-lg text-muted-foreground animate-pulse">Climbing to Betzy...</div>
                  )}
                  {gameState === "result" && (
                    <div
                      className={cn("text-lg font-semibold", lastBetResult?.won ? "text-success" : "text-destructive")}
                    >
                      {lastBetResult?.won ? "🚀 Reached the target!" : "💥 Crashed before target!"}
                    </div>
                  )}
                </div>

                {/* Limbo Character */}
                <div className="relative">
                  <div className="w-32 h-20 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-2xl flex items-center justify-center">
                    <div
                      className={cn(
                        "w-8 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full transition-all duration-300",
                        gameState === "climbing" && "animate-bounce",
                      )}
                    >
                      {/* Simple silhouette figure */}
                      <div className="w-3 h-3 bg-gray-500 rounded-full mx-auto mt-1" />
                      <div className="w-1 h-6 bg-gray-500 mx-auto mt-1" />
                      <div className="flex justify-center mt-1">
                        <div className="w-1 h-2 bg-gray-500 rotate-12" />
                        <div className="w-1 h-2 bg-gray-500 -rotate-12" />
                      </div>
                    </div>
                  </div>

                  {/* Limbo bar */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-40 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                      <div
                        className={cn(
                          "w-2 h-8 bg-primary rounded-full transition-all duration-300",
                          gameState === "climbing" && "animate-pulse",
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Limbo Game Controls
                </CardTitle>
                <p className="text-sm text-muted-foreground">Set your target multiplier and see how high it goes!</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bet Amount */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Bet Amount (XPL)</Label>
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickBetAmount("0.0001")}
                      disabled={gameState === "climbing"}
                      className="text-xs"
                    >
                      0.0001 XPL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickBetAmount("0.01")}
                      disabled={gameState === "climbing"}
                      className="text-xs"
                    >
                      0.01 XPL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickBetAmount("0.1")}
                      disabled={gameState === "climbing"}
                      className="text-xs"
                    >
                      0.1 XPL
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setQuickBetAmount("1")}
                      disabled={gameState === "climbing"}
                      className="text-xs bg-yellow-500 hover:bg-yellow-600"
                    >
                      1 XPL
                    </Button>
                  </div>
                  <Input
                    type="text"
                    value={betAmount}
                    onChange={(e) => handleBetAmountChange(e.target.value)}
                    placeholder="Enter bet amount"
                    disabled={gameState === "climbing"}
                    className="h-10"
                  />
                </div>

                {/* Target Multiplier */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Target Multiplier (X)</Label>
                  <Input
                    type="text"
                    value={targetMultiplier}
                    onChange={(e) => handleTargetMultiplierChange(e.target.value)}
                    placeholder="2.00"
                    disabled={gameState === "climbing"}
                    className="h-10 text-lg font-bold"
                  />
                </div>

                {/* Potential Win */}
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">Potential Win</div>
                  <div className="text-lg font-bold text-primary">{calculatePotentialWin()} XPL</div>
                </div>

                {/* Play Button */}
                {gameState === "result" ? (
                  <Button onClick={resetGame} className="w-full" size="lg">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                ) : (
                  <Button
                    onClick={handlePlayLimbo}
                    disabled={
                      !walletState.isConnected || !isValidBetAmount() || !isValidTargetMultiplier() || isPlacingBet
                    }
                    className="w-full pulse-glow bg-yellow-500 hover:bg-yellow-600"
                    size="lg"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {gameState === "climbing" ? "Climbing..." : `Play Limbo (${betAmount} XPL)`}
                  </Button>
                )}

                <div className="text-xs text-muted-foreground text-center">
                  Balance: {walletState.balance || "0"} XPL
                </div>
              </CardContent>
            </Card>

            {/* How to Play */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Play Celestial Limbo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Set your bet amount and target multiplier</p>
                <p>2. The multiplier will climb from 1.00x upward</p>
                <p>3. If it reaches your target before crashing, you win!</p>
                <p>4. Higher targets = bigger wins but higher risk</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Result Display */}
        {showResult && lastBetResult && (
          <Card className={cn("border-2", lastBetResult.won ? "border-success" : "border-destructive")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {lastBetResult.won ? (
                  <>
                    <TrendingUp className="h-5 w-5 text-success" />
                    You Won!
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    You Lost!
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastBetResult.won && (
                <Alert className="border-success/20 bg-success/5">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success-foreground">
                    Congratulations! {lastBetResult.payout} XPL has been sent to your wallet.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Target:</span>
                  <div className="font-semibold">{targetMultiplier}x</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Crashed at:</span>
                  <div className="font-semibold">{crashPoint.toFixed(2)}x</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Bet Amount:</span>
                  <div className="font-semibold">{lastBetResult.amount} XPL</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{lastBetResult.won ? "Won:" : "Lost:"}</span>
                  <div className={cn("font-semibold", lastBetResult.won ? "text-success" : "text-destructive")}>
                    {lastBetResult.won ? lastBetResult.payout : lastBetResult.amount} XPL
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Transaction: {lastBetResult.txHash.slice(0, 10)}...{lastBetResult.txHash.slice(-8)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Game Result Modal */}
      <GameResultModal
        result={lastBetResult}
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        onPlayAgain={resetGame}
      />
    </>
  )
}
