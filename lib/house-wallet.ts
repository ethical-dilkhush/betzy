"use client"

import { getPlasmaClient } from "./plasma-client"

export interface HouseWalletConfig {
  address: string
  privateKey?: string // Only used server-side for automated payouts
}

export class HouseWallet {
  private plasmaClient = getPlasmaClient()
  private houseAddress: string

  constructor() {
    this.houseAddress = process.env.NEXT_PUBLIC_HOUSE_WALLET_ADDRESS || ""

    // Validate house address
    if (!this.houseAddress || this.houseAddress.length === 0) {
      console.warn(
        "[v0] House wallet address not configured. Set NEXT_PUBLIC_HOUSE_WALLET_ADDRESS environment variable.",
      )
    } else if (!this.isValidAddress(this.houseAddress)) {
      console.error("[v0] Invalid house wallet address format:", this.houseAddress)
    }
  }

  private isValidAddress(address: string): boolean {
    // Basic Ethereum address validation (42 characters, starts with 0x)
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  getHouseAddress(): string {
    return this.houseAddress
  }

  async getHouseBalance(): Promise<string> {
    try {
      if (!this.houseAddress || this.houseAddress.length === 0) {
        console.warn("[v0] House wallet address not configured")
        return "0"
      }

      if (!this.isValidAddress(this.houseAddress)) {
        console.error("[v0] Invalid house wallet address format:", this.houseAddress)
        return "0"
      }

      console.log("[v0] Getting house wallet balance...")
      const balance = await this.plasmaClient.getBalance(this.houseAddress)
      console.log("[v0] House wallet balance:", balance, "XPL")
      return balance
    } catch (error) {
      console.error("[v0] Failed to get house balance:", error)
      return "0"
    }
  }

  async collectBet(playerAddress: string, amount: string): Promise<string> {
    try {
      console.log("[v0] Collecting bet from player:", { playerAddress, amount })

      // Initialize client with player address (they need to sign the transaction)
      await this.plasmaClient.initialize(playerAddress)

      // Send bet amount from player to house wallet
      const txHash = await this.plasmaClient.sendTransaction(
        this.houseAddress,
        amount,
        "0x", // Simple transfer, no additional data
      )

      console.log("[v0] Bet collected, transaction hash:", txHash)

      // Wait for transaction confirmation
      await this.plasmaClient.waitForTransaction(txHash)
      console.log("[v0] Bet collection confirmed")

      return txHash
    } catch (error: any) {
      console.error("[v0] Failed to collect bet:", error)
      throw new Error(`Failed to collect bet: ${error.message}`)
    }
  }

  async sendPayout(playerAddress: string, amount: string): Promise<string> {
    try {
      console.log("[v0] Sending payout to player:", { playerAddress, amount })

      // Call server action to handle payout securely
      const response = await fetch("/api/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerAddress,
          amount,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to send payout")
      }

      const { txHash } = await response.json()
      console.log("[v0] Payout sent, transaction hash:", txHash)

      // Wait for transaction confirmation
      await this.plasmaClient.waitForTransaction(txHash)
      console.log("[v0] Payout confirmed")

      return txHash
    } catch (error: any) {
      console.error("[v0] Failed to send payout:", error)
      throw new Error(`Failed to send payout: ${error.message}`)
    }
  }

  async validateHouseFunds(payoutAmount: string): Promise<boolean> {
    try {
      const houseBalance = await this.getHouseBalance()
      const payout = Number.parseFloat(payoutAmount)
      const balance = Number.parseFloat(houseBalance)

      // Ensure house has enough funds plus a safety buffer (10%)
      const requiredBalance = payout * 1.1
      const hasEnoughFunds = balance >= requiredBalance

      console.log("[v0] House funds validation:", {
        houseBalance: balance,
        payoutAmount: payout,
        requiredBalance,
        hasEnoughFunds,
      })

      return hasEnoughFunds
    } catch (error) {
      console.error("[v0] Failed to validate house funds:", error)
      return false
    }
  }

  async getTransactionHistory(): Promise<any[]> {
    try {
      // In production, this would query the blockchain for all transactions
      // involving the house wallet address
      console.log("[v0] Getting house wallet transaction history...")

      // For now, return empty array - in production you'd implement:
      // 1. Query blockchain for all transactions to/from house address
      // 2. Parse and categorize as bets collected or payouts sent
      // 3. Return formatted transaction history

      return []
    } catch (error) {
      console.error("[v0] Failed to get transaction history:", error)
      return []
    }
  }

  isConfigured(): boolean {
    return !!(this.houseAddress && this.houseAddress.length > 0 && this.isValidAddress(this.houseAddress))
  }
}

// Singleton instance
let houseWallet: HouseWallet | null = null

export function getHouseWallet(): HouseWallet {
  if (!houseWallet) {
    houseWallet = new HouseWallet()
  }
  return houseWallet
}
