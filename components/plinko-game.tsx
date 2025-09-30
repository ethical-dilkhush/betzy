"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { useBetting } from "@/hooks/use-betting"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Triangle } from "lucide-react"

export function PlinkoGame() {
  const { walletState } = useWallet()
  const { placeBet, isPlacingBet, lastBetResult } = useBetting()
  const { toast } = useToast()
  const [betAmount, setBetAmount] = useState("0.1")
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [finalMultiplier, setFinalMultiplier] = useState<number | null>(null)
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null)

  // Plinko board configuration
  const rows = 8
  const multipliers = [1.8, 0.7, 0.4, 0.7, 1.8]

  const animateBall = (targetSlot: number) => {
    setIsAnimating(true)
    setBallPosition({ x: 50, y: 0 })

    // Simulate ball bouncing through pegs
    let currentX = 50
    let step = 0
    const totalSteps = rows * 2

    const animate = () => {
      if (step < totalSteps) {
        // Random bounce left or right, but bias towards target slot
        const targetX = (targetSlot / (multipliers.length - 1)) * 100
        const progress = step / totalSteps
        const randomOffset = (Math.random() - 0.5) * 20 * (1 - progress)
        currentX = targetX + randomOffset

        setBallPosition({
          x: Math.max(5, Math.min(95, currentX)),
          y: (step / totalSteps) * 85,
        })

        step++
        setTimeout(animate, 100)
      } else {
        // Final position
        setBallPosition({
          x: (targetSlot / (multipliers.length - 1)) * 100,
          y: 90,
        })
        setFinalMultiplier(multipliers[targetSlot])
        setIsAnimating(false)
      }
    }

    animate()
  }

  const playGame = async () => {
    if (!walletState.isConnected || isPlacingBet) return

    const betAmountNum = Number.parseFloat(betAmount)
    if (isNaN(betAmountNum) || betAmountNum <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      })
      return
    }

    setGameResult(null)
    setFinalMultiplier(null)

    try {
      console.log("[v0] Plinko Game - Starting bet placement...")

      const result = await placeBet(betAmount, "heads")

      console.log("[v0] Plinko Game - Bet result:", result)

      const seed = Number.parseInt(result.seed.slice(0, 8), 16)
      let targetSlot: number

      if (result.won) {
        targetSlot = seed % 2 === 0 ? 0 : 4
      } else {
        const loseSlots = [1, 2, 3]
        targetSlot = loseSlots[seed % loseSlots.length]
      }

      animateBall(targetSlot)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const multiplier = multipliers[targetSlot]

      if (result.won) {
        setGameResult("win")
        toast({
          title: "Congratulations!",
          description: `You won ${result.payout} XPL with ${multiplier}x multiplier!`,
        })
        console.log("[v0] Plinko Game - Player won")
      } else {
        setGameResult("lose")
        toast({
          title: "Better luck next time!",
          description: `Ball landed on ${multiplier}x multiplier`,
          variant: "destructive",
        })
        console.log("[v0] Plinko Game - Player lost")
      }
    } catch (error) {
      console.error("[v0] Plinko Game - Error:", error)
      toast({
        title: "Game Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
      setGameResult("lose")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Controls */}
      <div className="lg:col-span-1">
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Triangle className="h-5 w-5 text-primary" />
              Plinko Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Bet Amount (XPL)</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0.1"
                step="0.01"
                min="0.01"
                disabled={isPlacingBet}
                className="bg-background/50"
              />
            </div>

            <Button
              onClick={playGame}
              disabled={!walletState.isConnected || isPlacingBet}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isPlacingBet ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Dropping Ball...
                </>
              ) : (
                `Drop Ball (${betAmount} XPL)`
              )}
            </Button>

            {finalMultiplier && (
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Final Multiplier</div>
                <div className="text-2xl font-bold text-primary">{finalMultiplier}x</div>
                {gameResult && (
                  <Badge variant={gameResult === "win" ? "default" : "destructive"} className="mt-2">
                    {gameResult === "win" ? "WIN!" : "LOSE"}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plinko Board */}
      <div className="lg:col-span-2">
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Triangle className="h-5 w-5 text-primary" />
              Divine Drop Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg p-6 min-h-[400px]">
              {/* Ball Dropper */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-8 bg-gray-600 rounded-t-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-800 rounded"></div>
                </div>
                <div className="w-8 h-4 bg-gray-700 mx-auto"></div>
              </div>

              {/* Ball */}
              <div
                className="absolute w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-100 z-10"
                style={{
                  left: `${ballPosition.x}%`,
                  top: `${ballPosition.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />

              {/* Pegs */}
              <div className="absolute inset-0 p-6">
                {Array.from({ length: rows }, (_, row) => (
                  <div
                    key={row}
                    className="flex justify-center items-center"
                    style={{
                      position: "absolute",
                      top: `${20 + row * 8}%`,
                      left: "0",
                      right: "0",
                    }}
                  >
                    {Array.from({ length: row + 3 }, (_, peg) => (
                      <div
                        key={peg}
                        className="w-3 h-3 bg-white rounded-full mx-2"
                        style={{
                          marginLeft: `${(8 - row) * 1.5}%`,
                          marginRight: `${(8 - row) * 1.5}%`,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Multiplier Slots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                {multipliers.map((multiplier, index) => (
                  <div
                    key={index}
                    className={`
                      flex-1 max-w-16 h-12 flex items-center justify-center text-white font-bold rounded
                      ${multiplier >= 1.0 ? "bg-orange-500" : "bg-orange-600"}
                    `}
                  >
                    {multiplier}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
