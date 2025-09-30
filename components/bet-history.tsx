"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useBetting } from "@/hooks/use-betting"
import { cn } from "@/lib/utils"

export function BetHistory() {
  const { betHistory } = useBetting()

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  if (betHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bet History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No bets placed yet</p>
            <p className="text-sm">Your betting history will appear here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bets</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {betHistory.map((bet, index) => (
              <div
                key={`${bet.txHash}-${index}`}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  bet.won ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20",
                )}
              >
                <div className="flex items-center gap-3">
                  {bet.won ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {bet.choice}
                      </Badge>
                      <span className="text-sm text-muted-foreground">→</span>
                      <Badge variant="outline" className="text-xs">
                        {bet.result}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatTxHash(bet.txHash)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("font-semibold", bet.won ? "text-success" : "text-destructive")}>
                    {bet.won ? "+" : "-"}
                    {bet.won ? bet.payout : bet.amount} XPL
                  </div>
                  <div className="text-xs text-muted-foreground">Bet: {bet.amount} XPL</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
