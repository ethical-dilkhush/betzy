"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, Coins, ExternalLink, Copy } from "lucide-react"
import { XPLToken } from "@/lib/xpl-token"
import { useToast } from "@/hooks/use-toast"
import type { BetResult } from "@/lib/betting-contract"
import { cn } from "@/lib/utils"

interface GameResultModalProps {
  result: BetResult | null
  isOpen: boolean
  onClose: () => void
  onPlayAgain: () => void
}

export function GameResultModal({ result, isOpen, onClose, onPlayAgain }: GameResultModalProps) {
  const { toast } = useToast()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen && result?.won) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [isOpen, result?.won])

  const copyTxHash = () => {
    if (result?.txHash) {
      navigator.clipboard.writeText(result.txHash)
      toast({
        title: "Transaction Hash Copied",
        description: "Transaction hash copied to clipboard",
      })
    }
  }

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  if (!result) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div
              className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center",
                result.won ? "bg-success/10" : "bg-destructive/10",
              )}
            >
              {result.won ? (
                <TrendingUp className="h-8 w-8 text-success" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {result.won ? "Congratulations!" : "Better Luck Next Time!"}
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            {result.won
              ? `You won ${XPLToken.formatAmount(result.payout)} XPL!`
              : `You lost ${XPLToken.formatAmount(result.amount)} XPL.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Result Summary */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Your Choice:</span>
                <div className="font-semibold capitalize flex items-center gap-2">
                  {result.choice}
                  <Badge variant="outline" className="text-xs">
                    {result.choice === "heads" ? "H" : "T"}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Result:</span>
                <div className="font-semibold capitalize flex items-center gap-2">
                  {result.result}
                  <Badge variant="outline" className="text-xs">
                    {result.result === "heads" ? "H" : "T"}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Bet Amount:</span>
                <div className="font-semibold">{XPLToken.formatAmount(result.amount)} XPL</div>
              </div>
              <div>
                <span className="text-muted-foreground">{result.won ? "Payout:" : "Lost:"}</span>
                <div className={cn("font-semibold", result.won ? "text-success" : "text-destructive")}>
                  {result.won ? "+" : "-"}
                  {XPLToken.formatAmount(result.won ? result.payout : result.amount)} XPL
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Transaction Details</div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Transaction Hash</div>
                <div className="font-mono text-sm">{formatTxHash(result.txHash)}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copyTxHash}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a href={`https://explorer.plasma.to/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Close
            </Button>
            <Button onClick={onPlayAgain} className="flex-1">
              <Coins className="h-4 w-4 mr-2" />
              Play Again
            </Button>
          </div>
        </div>

        {/* Confetti Effect for Wins */}
        {showConfetti && result.won && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 200 - 100}px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
