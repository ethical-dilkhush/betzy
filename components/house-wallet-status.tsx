"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { getHouseWallet } from "@/lib/house-wallet"

export function HouseWalletStatus() {
  const [houseBalance, setHouseBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const houseWallet = getHouseWallet()

  useEffect(() => {
    loadHouseStatus()

    // Refresh every 30 seconds
    const interval = setInterval(loadHouseStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadHouseStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!houseWallet.isConfigured()) {
        setError("not_configured")
        setHouseBalance("0")
        return
      }

      const balance = await houseWallet.getHouseBalance()
      setHouseBalance(balance)
    } catch (err: any) {
      console.error("Failed to load house status:", err)
      setError("Failed to load house wallet status")
    } finally {
      setIsLoading(false)
    }
  }

  const balanceNum = Number.parseFloat(houseBalance)
  const isLowBalance = balanceNum < 100 // Alert if less than 100 XPL

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
      {/* <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
          <Wallet className="h-5 w-5" />
          House Wallet Status
        </CardTitle>
      </CardHeader> */}
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-amber-200 dark:bg-amber-800 rounded"></div>
          </div>
        ) : error === "not_configured" ? (
          <div className="space-y-3">
            {/* <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">House wallet not configured</span>
            </div> */}
            <div className="text-xs text-amber-600 dark:text-amber-400 space-y-2">
              <p>To enable house wallet features, add this environment variable:</p>
              <code className="block bg-amber-100 dark:bg-amber-900/30 p-2 rounded text-xs">
                NEXT_PUBLIC_HOUSE_WALLET_ADDRESS=0x...
              </code>
              <p className="text-xs">The app will work without it, but house wallet status won't be available.</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <>
            {/* <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Balance</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {Number.parseFloat(houseBalance).toLocaleString()} XPL
                </span>
                {isLowBalance && (
                  <Badge variant="destructive" className="text-xs">
                    Low
                  </Badge>
                )}
              </div>
            </div> */}

            {/* <div className="text-xs text-amber-600 dark:text-amber-400 font-mono">
              {houseWallet.getHouseAddress() || "Not configured"}
            </div> */}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">Bets Collected</div>
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">Active</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">Payouts Ready</div>
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    {balanceNum > 100 ? "Ready" : "Unlimited"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
