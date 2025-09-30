"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBettingContract } from "@/lib/betting-contract"
import { useState, useEffect } from "react"

export function GamePatternDisplay() {
  const [gameStats, setGameStats] = useState<{
    currentGame: number
    nextOutcome: "WIN" | "LOSE"
    upcomingPattern: Array<{ gameNumber: number; outcome: "WIN" | "LOSE" }>
  } | null>(null)

  const bettingContract = getBettingContract()

  const refreshStats = () => {
    const stats = bettingContract.getGameStats()
    setGameStats(stats)
  }

  const resetCounter = () => {
    bettingContract.resetGameCounter()
    refreshStats()
  }

  useEffect(() => {
    refreshStats()
  }, [])

  if (!gameStats) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Game Pattern Status
          <Button variant="outline" size="sm" onClick={resetCounter} className="text-xs bg-transparent">
            Reset Counter
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Games Played:</span>
          <Badge variant="secondary">{gameStats.currentGame}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Next Game Outcome:</span>
          <Badge
            variant={gameStats.nextOutcome === "WIN" ? "default" : "destructive"}
            className={gameStats.nextOutcome === "WIN" ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {gameStats.nextOutcome}
          </Badge>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Upcoming Pattern:</h4>
          <div className="grid grid-cols-5 gap-2">
            {gameStats.upcomingPattern.map((game) => (
              <div key={game.gameNumber} className="text-center">
                <div className="text-xs text-muted-foreground">#{game.gameNumber}</div>
                <Badge
                  variant={game.outcome === "WIN" ? "default" : "destructive"}
                  className={`text-xs ${game.outcome === "WIN" ? "bg-green-500 hover:bg-green-600" : ""}`}
                >
                  {game.outcome}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <strong>Pattern:</strong> Every 3rd player wins (Lose → Lose → Win → Repeat)
        </div>
      </CardContent>
    </Card>
  )
}
