"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  CheckCircle,
} from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useBetting } from "@/hooks/use-betting"
import { useToast } from "@/hooks/use-toast"
import { GameResultModal } from "./game-result-modal"
import { cn } from "@/lib/utils"

type BetChoice = "low" | "high" // low = 2-7, high = 8-12
type GameState = "idle" | "rolling" | "result"

export function DiceGame() {
  const { walletState } = useWallet()
  const { placeBet, isPlacingBet, lastBetResult } = useBetting()
  const { toast } = useToast()

  const [betAmount, setBetAmount] = useState("0.1")
  const [selectedBet, setSelectedBet] = useState<BetChoice>("low")
  const [gameState, setGameState] = useState<GameState>("idle")
  const [showResult, setShowResult] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [dice1, setDice1] = useState(1)
  const [dice2, setDice2] = useState(1)
  const [diceSum, setDiceSum] = useState(2)

  const minBet = "0.001"
  const maxBet = walletState.balance ? (Number.parseFloat(walletState.balance) * 0.5).toString() : "0"

  const handleBetAmountChange = (value: string) => {
    // Only allow valid decimal numbers
    if (/^\d*\.?\d*$/.test(value)) {
      setBetAmount(value)
    }
  }

  const setQuickBetAmount = (percentage: number) => {
    if (!walletState.balance) return
    const balance = Number.parseFloat(walletState.balance)
    const amount = (balance * percentage).toFixed(4)
    setBetAmount(amount)
  }

  const getDiceIcon = (value: number) => {
    const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
    const DiceIcon = diceIcons[value - 1] || Dice1
    return <DiceIcon className="h-12 w-12 text-primary" />
  }

  const handlePlayDice = async () => {
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

    setGameState("rolling")
    setShowResult(false)

    toast({
      title: "Processing Bet",
      description: "Please confirm the transaction in your wallet...",
    })

    try {
      console.log("[v0] Starting dice game bet placement...")

      // Place the bet using the same betting system as other games
      const result = await placeBet(betAmount, selectedBet)

      console.log("[v0] Dice game bet result:", result)

      // Rolling animation
      const rollDuration = 2000
      const rollInterval = 100
      let rollCount = 0
      const maxRolls = rollDuration / rollInterval

      const rollAnimation = setInterval(() => {
        setDice1(Math.floor(Math.random() * 6) + 1)
        setDice2(Math.floor(Math.random() * 6) + 1)
        rollCount++

        if (rollCount >= maxRolls) {
          clearInterval(rollAnimation)

          // Generate final dice values based on game result
          // Use the seed to generate consistent dice values
          const seed = Number.parseInt(result.seed.slice(0, 8), 16)
          const finalDice1 = (seed % 6) + 1
          const finalDice2 = ((seed >> 8) % 6) + 1
          const finalSum = finalDice1 + finalDice2

          setDice1(finalDice1)
          setDice2(finalDice2)
          setDiceSum(finalSum)

          setGameState("result")
          setShowResult(true)

          if (result.won) {
            toast({
              title: "🎉 You Won!",
              description: `You won ${result.payout} XPL! Payout sent to your wallet. Transaction: ${result.txHash.slice(0, 10)}...`,
              variant: "default",
            })
          } else {
            toast({
              title: "Better luck next time!",
              description: `You lost ${result.amount} XPL. Transaction confirmed: ${result.txHash.slice(0, 10)}...`,
              variant: "destructive",
            })
          }

          // Show result modal
          setTimeout(() => {
            setShowResultModal(true)
          }, 500)
        }
      }, rollInterval)
    } catch (error: any) {
      console.error("[v0] Dice game bet placement error:", error)
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
    setDice1(1)
    setDice2(1)
    setDiceSum(2)
  }

  const isValidBetAmount = () => {
    const amount = Number.parseFloat(betAmount)
    const balance = Number.parseFloat(walletState.balance || "0")
    return amount >= Number.parseFloat(minBet) && amount <= balance && amount > 0
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Game Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Divine Dice</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            {/* Dice Display */}
            <div className="flex justify-center py-8">
              <div className="flex gap-8 items-center">
                <div className="text-center">
                  <div
                    className={cn(
                      "w-20 h-20 rounded-lg border-2 bg-gradient-to-br from-card to-card/80 flex items-center justify-center shadow-lg transition-all duration-300",
                      gameState === "rolling" && "animate-bounce",
                    )}
                  >
                    {getDiceIcon(dice1)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Die 1</p>
                </div>
                <div className="text-4xl font-bold text-primary">+</div>
                <div className="text-center">
                  <div
                    className={cn(
                      "w-20 h-20 rounded-lg border-2 bg-gradient-to-br from-card to-card/80 flex items-center justify-center shadow-lg transition-all duration-300",
                      gameState === "rolling" && "animate-bounce",
                    )}
                  >
                    {getDiceIcon(dice2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Die 2</p>
                </div>
                <div className="text-4xl font-bold text-primary">=</div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-lg border-2 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-primary">{diceSum}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Sum</p>
                </div>
              </div>
            </div>

            {/* Bet Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Choose Your Bet</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedBet === "low" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedBet("low")}
                  disabled={gameState === "rolling"}
                  className="h-16"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">2-7</div>
                    <div className="text-sm opacity-80">Low Range</div>
                  </div>
                </Button>
                <Button
                  variant={selectedBet === "high" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedBet("high")}
                  disabled={gameState === "rolling"}
                  className="h-16"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">8-12</div>
                    <div className="text-sm opacity-80">High Range</div>
                  </div>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Bet Amount */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Bet Amount (XPL)</Label>
              <div className="space-y-3">
                <Input
                  type="text"
                  value={betAmount}
                  onChange={(e) => handleBetAmountChange(e.target.value)}
                  placeholder="Enter bet amount"
                  disabled={gameState === "rolling"}
                  className="text-lg h-12"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickBetAmount(0.1)}
                    disabled={gameState === "rolling"}
                  >
                    10%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickBetAmount(0.25)}
                    disabled={gameState === "rolling"}
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickBetAmount(0.5)}
                    disabled={gameState === "rolling"}
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(walletState.balance || "0")}
                    disabled={gameState === "rolling"}
                  >
                    Max
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Min: {minBet} XPL | Max: {maxBet} XPL | Balance: {walletState.balance || "0"} XPL
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {gameState === "result" ? (
                <Button onClick={resetGame} className="flex-1" size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Roll Again
                </Button>
              ) : (
                <Button
                  onClick={handlePlayDice}
                  disabled={!walletState.isConnected || !isValidBetAmount() || isPlacingBet}
                  className="flex-1 pulse-glow"
                  size="lg"
                >
                  <Dice1 className="h-4 w-4 mr-2" />
                  {gameState === "rolling" ? "Rolling..." : "Roll Dice"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
                  <span className="text-muted-foreground">Your Bet:</span>
                  <div className="font-semibold">{selectedBet === "low" ? "2-7 (Low)" : "8-12 (High)"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Dice Sum:</span>
                  <div className="font-semibold">{diceSum}</div>
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
