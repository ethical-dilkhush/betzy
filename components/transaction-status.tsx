"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, RefreshCw } from "lucide-react"
import { getBettingContract } from "@/lib/betting-contract"

interface TransactionStatusProps {
  txHash: string
  onStatusChange?: (status: "pending" | "confirmed" | "failed") => void
}

export function TransactionStatus({ txHash, onStatusChange }: TransactionStatusProps) {
  const [status, setStatus] = useState<"pending" | "confirmed" | "failed">("pending")
  const [isChecking, setIsChecking] = useState(false)

  const bettingContract = getBettingContract()

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const newStatus = await bettingContract.getTransactionStatus(txHash)
      setStatus(newStatus)
      onStatusChange?.(newStatus)
    } catch (error) {
      console.error("Failed to check transaction status:", error)
      setStatus("failed")
      onStatusChange?.("failed")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Check status immediately
    checkStatus()

    // Set up polling for pending transactions
    if (status === "pending") {
      const interval = setInterval(checkStatus, 5000) // Check every 5 seconds
      return () => clearInterval(interval)
    }
  }, [txHash, status])

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "warning"
      case "confirmed":
        return "success"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Pending"
      case "confirmed":
        return "Confirmed"
      case "failed":
        return "Failed"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Transaction Status
          <Badge variant={getStatusColor() as any}>{getStatusText()}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Transaction Hash:</div>
          <div className="font-mono text-sm break-all bg-muted p-2 rounded">{txHash}</div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={isChecking}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://explorer.plasma.to/tx/${txHash}`, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
