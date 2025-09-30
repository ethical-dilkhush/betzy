"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Coins } from "lucide-react"
import { useBetting } from "@/hooks/use-betting"
import { useWallet } from "@/hooks/use-wallet"

export function GameStats() {
  const { betHistory } = useBetting()
  const { walletState } = useWallet()

  const totalBets = betHistory.length
  const totalWins = betHistory.filter((bet) => bet.won).length
  const totalLosses = totalBets - totalWins
  const winRate = totalBets > 0 ? ((totalWins / totalBets) * 100).toFixed(1) : "0"

  const totalWagered = betHistory.reduce((sum, bet) => sum + Number.parseFloat(bet.amount), 0)
  const totalWon = betHistory.filter((bet) => bet.won).reduce((sum, bet) => sum + Number.parseFloat(bet.payout), 0)
  const totalLost = betHistory.filter((bet) => !bet.won).reduce((sum, bet) => sum + Number.parseFloat(bet.amount), 0)
  const netProfit = totalWon - totalLost

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBets}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {totalWins}W
            </Badge>
            <Badge variant="outline" className="text-xs">
              {totalLosses}L
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{winRate}%</div>
          <p className="text-xs text-muted-foreground">Expected: 50%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Wagered</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWagered.toFixed(4)}</div>
          <p className="text-xs text-muted-foreground">XPL</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          {netProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-success" : "text-destructive"}`}>
            {netProfit >= 0 ? "+" : ""}
            {netProfit.toFixed(4)}
          </div>
          <p className="text-xs text-muted-foreground">XPL</p>
        </CardContent>
      </Card>
    </div>
  )
}
