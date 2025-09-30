"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, TrendingUp, TrendingDown, RotateCcw, CheckCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useBetting } from "@/hooks/use-betting"
import { useToast } from "@/hooks/use-toast"
import { GameResultModal } from "./game-result-modal"
import { cn } from "@/lib/utils"

type CoinSide = "heads" | "tails"
type GameState = "idle" | "flipping" | "result"

export function CoinFlipGame() {
  const { walletState } = useWallet()
  const { placeBet, isPlacingBet, lastBetResult } = useBetting()
  const { toast } = useToast()

  const [betAmount, setBetAmount] = useState("0.1")
  const [selectedSide, setSelectedSide] = useState<CoinSide>("heads")
  const [gameState, setGameState] = useState<GameState>("idle")
  const [coinRotation, setCoinRotation] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)

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

  const handleFlipCoin = async () => {
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

    setGameState("flipping")
    setShowResult(false)

    toast({
      title: "Processing Bet",
      description: "Please confirm the transaction in your wallet...",
    })

    // Start coin flip animation
    const flipDuration = 3000
    const rotationInterval = setInterval(() => {
      setCoinRotation((prev) => prev + 180)
    }, 100)

    try {
      console.log("[v0] Starting bet placement...")

      // Place the bet - this will now handle real payouts
      const result = await placeBet(betAmount, selectedSide)

      console.log("[v0] Bet result:", result)

      // Stop animation after flip duration
      setTimeout(async () => {
        clearInterval(rotationInterval)

        // Set final rotation based on result
        const finalRotation = result.result === "heads" ? 0 : 180
        setCoinRotation(finalRotation)

        setGameState("result")
        setShowResult(true)

        if (result.won) {
          toast({
            title: "🎉 You Won!",
            description: `You won ${result.payout} XPL! Payout sent to your wallet. Transaction: ${result.txHash.slice(0, 10)}...`,
            variant: "default",
          })
        } else {
          // Show loss message with transaction confirmation
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
      }, flipDuration)
    } catch (error: any) {
      console.error("[v0] Bet placement error:", error)
      clearInterval(rotationInterval)
      setGameState("idle")
      setCoinRotation(0)

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
    setCoinRotation(0)
    setShowResultModal(false)
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
              <CardTitle className="text-2xl">Coin Flip Game</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            {/* Coin Display */}
            <div className="flex justify-center py-8">
              <div
                className={cn(
                  "relative w-32 h-32 rounded-full border-4 border-primary/20 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg transition-transform duration-100",
                  gameState === "flipping" && "animate-spin",
                )}
                style={{
                  transform: `rotateY(${coinRotation}deg)`,
                }}
              >
                {gameState === "result" && lastBetResult
                  ? lastBetResult.result === "heads"
                    ? "H"
                    : "T"
                  : selectedSide === "heads"
                    ? "H"
                    : "T"}
              </div>
            </div>

            {/* Side Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Choose Your Side</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedSide === "heads" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedSide("heads")}
                  disabled={gameState === "flipping"}
                  className="h-16"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">H</div>
                    <div className="text-sm">Heads</div>
                  </div>
                </Button>
                <Button
                  variant={selectedSide === "tails" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedSide("tails")}
                  disabled={gameState === "flipping"}
                  className="h-16"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">T</div>
                    <div className="text-sm">Tails</div>
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
                  disabled={gameState === "flipping"}
                  className="text-lg h-12"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickBetAmount(0.1)}
                    disabled={gameState === "flipping"}
                  >
                    10%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickBetAmount(0.25)}
                    disabled={gameState === "flipping"}
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickBetAmount(0.5)}
                    disabled={gameState === "flipping"}
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(walletState.balance || "0")}
                    disabled={gameState === "flipping"}
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
                  Play Again
                </Button>
              ) : (
                <Button
                  onClick={handleFlipCoin}
                  disabled={!walletState.isConnected || !isValidBetAmount() || isPlacingBet}
                  className="flex-1 pulse-glow"
                  size="lg"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  {gameState === "flipping" ? "Flipping..." : "Flip Coin"}
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
                  <span className="text-muted-foreground">Your Choice:</span>
                  <div className="font-semibold capitalize">{lastBetResult.choice}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Result:</span>
                  <div className="font-semibold capitalize">{lastBetResult.result}</div>
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
