"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { PayoutNotificationManager, type PayoutNotification } from "@/lib/payout-system"
import { XPLToken } from "@/lib/xpl-token"
import { cn } from "@/lib/utils"

export function PayoutNotificationToast() {
  const [notifications, setNotifications] = useState<PayoutNotification[]>([])

  useEffect(() => {
    const unsubscribe = PayoutNotificationManager.subscribe((notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 2)]) // Show max 3 notifications

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.timestamp !== notification.timestamp))
      }, 5000)
    })

    return unsubscribe
  }, [])

  const removeNotification = (timestamp: number) => {
    setNotifications((prev) => prev.filter((n) => n.timestamp !== timestamp))
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Card
          key={notification.timestamp}
          className={cn(
            "w-80 shadow-lg border-2 animate-in slide-in-from-right-full",
            notification.type === "win" ? "border-success bg-success/5" : "border-destructive bg-destructive/5",
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {notification.type === "win" ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <div className="font-semibold">{notification.type === "win" ? "You Won!" : "You Lost!"}</div>
                  <div className={cn("text-sm", notification.type === "win" ? "text-success" : "text-destructive")}>
                    {notification.type === "win" ? "+" : "-"}
                    {XPLToken.formatAmount(notification.amount)} XPL
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {notification.txHash.slice(0, 8)}...
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://explorer.plasma.to/tx/${notification.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-6 px-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.timestamp)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
