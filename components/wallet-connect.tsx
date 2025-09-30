"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Wallet, Copy, ExternalLink, LogOut } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { SUPPORTED_WALLETS } from "@/lib/wallet-config"
import { useToast } from "@/hooks/use-toast"

export function WalletConnect() {
  const { walletState, connectWallet, disconnectWallet, isConnecting } = useWallet()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleConnect = async (walletId: string) => {
    try {
      await connectWallet(walletId)
      setIsDialogOpen(false)
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Plasma Network",
      })
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (walletState.isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Wallet Connected</CardTitle>
            <Badge variant="secondary" className="bg-success text-success-foreground">
              Plasma Network
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-mono text-sm">{formatAddress(walletState.address!)}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a
                  href={`https://explorer.plasma.to/address/${walletState.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="font-semibold">{walletState.balance} XPL</p>
            </div>
          </div>

          <Button variant="outline" onClick={disconnectWallet} className="w-full bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="pulse-glow">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the Plasma Network and start betting with XPL tokens.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {SUPPORTED_WALLETS.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="w-full justify-start h-12 bg-transparent"
              onClick={() => handleConnect(wallet.id)}
              disabled={isConnecting}
            >
              <span className="text-2xl mr-3">{wallet.icon}</span>
              <span>{wallet.name}</span>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center mt-4">
          By connecting your wallet, you agree to our terms of service.
        </div>
      </DialogContent>
    </Dialog>
  )
}
