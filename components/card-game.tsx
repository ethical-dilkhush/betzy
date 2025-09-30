"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Diamond, Crown, TrendingUp, TrendingDown, RotateCcw, CheckCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useBetting } from "@/hooks/use-betting"
import { useToast } from "@/hooks/use-toast"
import { GameResultModal } from "./game-result-modal"
import { cn } from "@/lib/utils"

type CardType = "joker" | "king"
type GameState = "idle" | "revealing" | "result"

export function CardGame() {
  const { walletState } = useWallet()
  const { placeBet, isPlacingBet, lastBetResult } = useBetting()
  const { toast } = useToast()

  const [betAmount, setBetAmount] = useState("0.1")
  const [selectedCard, setSelectedCard] = useState<CardType>("joker")
  const [gameState, setGameState] = useState<GameState>("idle")
  const [showResult, setShowResult] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [revealedCard, setRevealedCard] = useState<CardType | null>(null)

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

  const handlePlayCard = async () => {
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

    setGameState("revealing")
    setShowResult(false)
    setRevealedCard(null)

    toast({
      title: "Processing Bet",
      description: "Please confirm the transaction in your wallet...",
    })

    try {
      console.log("[v0] Starting card game bet placement...")

      // Place the bet using the same betting system as coin flip
      const result = await placeBet(betAmount, selectedCard)

      console.log("[v0] Card game bet result:", result)

      // Reveal animation
      setTimeout(async () => {
        // Map coin flip result to card result
        const cardResult: CardType = result.result === "heads" ? "joker" : "king"
        setRevealedCard(cardResult)

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
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Card game bet placement error:", error)
      setGameState("idle")
      setRevealedCard(null)

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
    setRevealedCard(null)
    setShowResultModal(false)
  }

  const isValidBetAmount = () => {
    const amount = Number.parseFloat(betAmount)
    const balance = Number.parseFloat(walletState.balance || "0")
    return amount >= Number.parseFloat(minBet) && amount <= balance && amount > 0
  }

  const CardDisplay = ({
    cardType,
    isSelected,
    isRevealed,
  }: { cardType: CardType; isSelected?: boolean; isRevealed?: boolean }) => (
    <div
      className={cn(
        "relative w-24 h-32 rounded-lg border-2 bg-gradient-to-br from-card to-card/80 flex flex-col items-center justify-center shadow-lg transition-all duration-300",
        isSelected ? "border-primary bg-primary/10 scale-105" : "border-border",
        isRevealed && "animate-pulse",
      )}
    >
      {cardType === "joker" ? (
        <>
          <Diamond className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm font-bold">JOKER</span>
        </>
      ) : (
        <>
          <Crown className="h-8 w-8 text-yellow-500 mb-2" />
          <span className="text-sm font-bold">KING</span>
        </>
      )}
    </div>
  )

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Game Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Card Game</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            {/* Card Display */}
            <div className="flex justify-center py-8">
              <div className="flex gap-8">
                <div className="text-center">
                  <CardDisplay cardType="joker" />
                  <p className="text-sm text-muted-foreground mt-2">Joker</p>
                </div>
                <div className="text-center">
                  <CardDisplay cardType="king" />
                  <p className="text-sm text-muted-foreground mt-2">King</p>
                </div>
              </div>
            </div>

            {/* Revealed Card */}
            {gameState === "result" && revealedCard && (
              <div className="flex justify-center">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Winning Card:</p>
                  <CardDisplay cardType={revealedCard} isRevealed />
                </div>
              </div>
            )}

            {/* Card Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Choose Your Card</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedCard === "joker" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedCard("joker")}
                  disabled={gameState === "revealing"}
                  className="h-16"
                >
                  <div className="text-center">
                    <Diamond className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Joker</div>
                  </div>
                </Button>
                <Button
                  variant={selectedCard === "king" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedCard("king")}
                  disabled={gameState === "revealing"}
                  className="h-16"
                >
                  <div className="text-center">
                    <Crown className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">King</div>
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
                  disabled={gameState === "revealing"}
                  className="text-lg h-12"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickBetAmount(0.1)}
                    disabled={gameState === "revealing"}
                  >
                    10%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickBetAmount(0.25)}
                    disabled={gameState === "revealing"}
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickBetAmount(0.5)}
                    disabled={gameState === "revealing"}
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(walletState.balance || "0")}
                    disabled={gameState === "revealing"}
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
                  onClick={handlePlayCard}
                  disabled={!walletState.isConnected || !isValidBetAmount() || isPlacingBet}
                  className="flex-1 pulse-glow"
                  size="lg"
                >
                  <Diamond className="h-4 w-4 mr-2" />
                  {gameState === "revealing" ? "Revealing..." : "Play Cards"}
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
                  <div className="font-semibold capitalize">{selectedCard}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Winning Card:</span>
                  <div className="font-semibold capitalize">{revealedCard}</div>
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
