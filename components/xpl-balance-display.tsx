"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, TrendingUp, TrendingDown, Coins, DollarSign } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { XPLToken } from "@/lib/xpl-token"
import { cn } from "@/lib/utils"

export function XPLBalanceDisplay() {
  const { walletState, refreshBalance } = useWallet()
  const [usdValue, setUsdValue] = useState<string>("0.00")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [priceChange, setPriceChange] = useState<number>(0) // Mock price change

  useEffect(() => {
    const updateUSDValue = async () => {
      if (walletState.balance) {
        try {
          const usd = await XPLToken.toUSD(walletState.balance)
          setUsdValue(usd)
        } catch (error) {
          console.error("Failed to get USD value:", error)
        }
      }
    }

    updateUSDValue()

    // Mock price change (in real app, this would come from price feed)
    setPriceChange(Math.random() * 10 - 5) // Random between -5% and +5%
  }, [walletState.balance])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshBalance()
    } finally {
      setIsRefreshing(false)
    }
  }

  const bettingLimits = walletState.balance ? XPLToken.getBettingLimits(walletState.balance) : { min: "0", max: "0" }

  if (!walletState.isConnected) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            XPL Balance
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Balance */}
        <div className="text-center">
          <div className="text-3xl font-bold">{XPLToken.formatAmount(walletState.balance || "0")}</div>
          <div className="text-lg text-muted-foreground">XPL</div>
        </div>

        {/* USD Value */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-semibold">${usdValue}</span>
            <Badge variant={priceChange >= 0 ? "default" : "destructive"} className="text-xs">
              {priceChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(priceChange).toFixed(1)}%
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">≈ $0.25 per XPL</div>
        </div>

        <Separator />

        {/* Betting Limits */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Betting Limits</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Min Bet:</span>
              <div className="font-semibold">{bettingLimits.min} XPL</div>
            </div>
            <div>
              <span className="text-muted-foreground">Max Bet:</span>
              <div className="font-semibold">{XPLToken.formatAmount(bettingLimits.max)} XPL</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-muted-foreground">Available</div>
            <div className="font-semibold">{XPLToken.formatAmount(walletState.balance || "0", 2)} XPL</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-muted-foreground">Network</div>
            <div className="font-semibold">Plasma</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
