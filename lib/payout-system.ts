"use client"

import { getPlasmaClient } from "./plasma-client"
import { XPLToken, XPLTransactionManager, type XPLTransaction } from "./xpl-token"
import type { BetResult } from "./betting-contract"

export interface PayoutResult {
  success: boolean
  txHash?: string
  amount: string
  error?: string
  gasUsed?: string
  gasPrice?: string
}

export class PayoutSystem {
  private plasmaClient = getPlasmaClient()

  async processPayout(betResult: BetResult, playerAddress: string): Promise<PayoutResult> {
    try {
      // Initialize client
      await this.plasmaClient.initialize(playerAddress)

      if (betResult.won) {
        // Process winning payout
        return await this.processWinningPayout(betResult, playerAddress)
      } else {
        // Process losing bet (deduct from balance)
        return await this.processLosingBet(betResult, playerAddress)
      }
    } catch (error: any) {
      console.error("Payout processing failed:", error)
      return {
        success: false,
        amount: betResult.amount,
        error: error.message || "Payout failed",
      }
    }
  }

  private async processWinningPayout(betResult: BetResult, playerAddress: string): Promise<PayoutResult> {
    try {
      // In a real implementation, this would interact with a smart contract
      // For demo purposes, we simulate the payout transaction

      const payoutAmount = betResult.payout
      const txHash = betResult.txHash

      // Record the winning transaction
      const transaction: XPLTransaction = {
        hash: txHash,
        type: "win",
        amount: payoutAmount,
        timestamp: Date.now(),
        status: "confirmed",
      }

      XPLTransactionManager.saveTransaction(transaction)

      // Simulate balance update (in real app, this would come from blockchain)
      this.simulateBalanceUpdate(playerAddress, payoutAmount, "add")

      return {
        success: true,
        txHash,
        amount: payoutAmount,
      }
    } catch (error: any) {
      return {
        success: false,
        amount: betResult.payout,
        error: error.message || "Failed to process winning payout",
      }
    }
  }

  private async processLosingBet(betResult: BetResult, playerAddress: string): Promise<PayoutResult> {
    try {
      const betAmount = betResult.amount
      const txHash = betResult.txHash

      // Record the losing transaction
      const transaction: XPLTransaction = {
        hash: txHash,
        type: "loss",
        amount: betAmount,
        timestamp: Date.now(),
        status: "confirmed",
      }

      XPLTransactionManager.saveTransaction(transaction)

      // Simulate balance update (in real app, this would come from blockchain)
      this.simulateBalanceUpdate(playerAddress, betAmount, "subtract")

      return {
        success: true,
        txHash,
        amount: betAmount,
      }
    } catch (error: any) {
      return {
        success: false,
        amount: betResult.amount,
        error: error.message || "Failed to process losing bet",
      }
    }
  }

  private simulateBalanceUpdate(address: string, amount: string, operation: "add" | "subtract") {
    // In a real implementation, this would be handled by the blockchain
    // For demo purposes, we'll trigger a balance refresh
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("balanceUpdate", { detail: { address, amount, operation } }))
    }, 1000)
  }

  async validatePayout(betResult: BetResult, playerBalance: string): Promise<boolean> {
    try {
      const betAmount = Number.parseFloat(betResult.amount)
      const balance = Number.parseFloat(playerBalance)

      // Check if player has sufficient balance for the bet
      if (betAmount > balance) {
        return false
      }

      // Validate bet amount is within limits
      if (!XPLToken.validateMinBet(betResult.amount)) {
        return false
      }

      if (!XPLToken.validateMaxBet(betResult.amount, playerBalance)) {
        return false
      }

      return true
    } catch (error) {
      console.error("Payout validation failed:", error)
      return false
    }
  }

  async estimatePayoutGas(betResult: BetResult): Promise<string> {
    try {
      // In a real implementation, this would estimate gas for smart contract interaction
      // For demo purposes, return a fixed estimate
      return "0.001" // 0.001 XPL gas fee
    } catch (error) {
      console.error("Gas estimation failed:", error)
      return "0.001"
    }
  }

  calculateNetPayout(betResult: BetResult, gasFee: string): string {
    if (!betResult.won) {
      return "0"
    }

    const payout = Number.parseFloat(betResult.payout)
    const gas = Number.parseFloat(gasFee)
    const netPayout = Math.max(0, payout - gas)

    return netPayout.toString()
  }
}

// Singleton instance
let payoutSystem: PayoutSystem | null = null

export function getPayoutSystem(): PayoutSystem {
  if (!payoutSystem) {
    payoutSystem = new PayoutSystem()
  }
  return payoutSystem
}

// Payout notification system
export interface PayoutNotification {
  type: "win" | "loss"
  amount: string
  txHash: string
  timestamp: number
}

export class PayoutNotificationManager {
  private static notifications: PayoutNotification[] = []
  private static listeners: ((notification: PayoutNotification) => void)[] = []

  static addNotification(notification: PayoutNotification) {
    this.notifications.unshift(notification)
    this.notifications = this.notifications.slice(0, 10) // Keep last 10

    // Notify all listeners
    this.listeners.forEach((listener) => listener(notification))
  }

  static subscribe(listener: (notification: PayoutNotification) => void) {
    this.listeners.push(listener)

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  static getNotifications(): PayoutNotification[] {
    return [...this.notifications]
  }

  static clearNotifications() {
    this.notifications = []
  }
}
