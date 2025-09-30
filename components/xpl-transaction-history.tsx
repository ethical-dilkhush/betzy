"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Trash2, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { XPLTransactionManager, type XPLTransaction } from "@/lib/xpl-token"
import { cn } from "@/lib/utils"

export function XPLTransactionHistory() {
  const [transactions, setTransactions] = useState<XPLTransaction[]>([])

  useEffect(() => {
    const loadTransactions = () => {
      const txs = XPLTransactionManager.getTransactions()
      setTransactions(txs)
    }

    loadTransactions()

    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      loadTransactions()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const clearHistory = () => {
    XPLTransactionManager.clearTransactions()
    setTransactions([])
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`
  }

  const getTransactionIcon = (type: XPLTransaction["type"]) => {
    switch (type) {
      case "win":
        return <TrendingUp className="h-4 w-4 text-success" />
      case "loss":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      case "bet":
        return <Clock className="h-4 w-4 text-warning" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: XPLTransaction["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="text-xs">
            Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="text-xs">
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="text-xs">
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Unknown
          </Badge>
        )
    }
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your XPL transaction history will appear here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div key={`${tx.hash}-${index}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{tx.type}</span>
                        {getStatusBadge(tx.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">{formatTime(tx.timestamp)}</div>
                      <div className="text-xs text-muted-foreground font-mono">{formatTxHash(tx.hash)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "font-semibold",
                        tx.type === "win" ? "text-success" : tx.type === "loss" ? "text-destructive" : "text-warning",
                      )}
                    >
                      {tx.type === "win" ? "+" : "-"}
                      {tx.amount} XPL
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://explorer.plasma.to/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>
                {index < transactions.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
