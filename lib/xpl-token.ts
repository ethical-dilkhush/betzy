"use client"

import { getPlasmaClient } from "./plasma-client"

// XPL Token utilities and formatting
export class XPLToken {
  static readonly DECIMALS = 18
  static readonly SYMBOL = "XPL"
  static readonly NAME = "Plasma Token"

  // Format XPL amount for display
  static formatAmount(amount: string | number, decimals = 4): string {
    const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
    return num.toFixed(decimals)
  }

  // Convert XPL to Wei (smallest unit)
  static toWei(amount: string | number): string {
    const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
    const wei = Math.floor(num * Math.pow(10, this.DECIMALS))
    return `0x${wei.toString(16)}`
  }

  // Convert Wei to XPL
  static fromWei(wei: string): string {
    const num = Number.parseInt(wei, 16)
    return (num / Math.pow(10, this.DECIMALS)).toString()
  }

  // Validate XPL amount format
  static isValidAmount(amount: string): boolean {
    const regex = /^\d*\.?\d*$/
    if (!regex.test(amount)) return false

    const num = Number.parseFloat(amount)
    return !Number.isNaN(num) && num >= 0 && num <= 1000000 // Max 1M XPL
  }

  // Get formatted balance with symbol
  static formatBalance(balance: string | null): string {
    if (!balance) return "0 XPL"
    return `${this.formatAmount(balance)} ${this.SYMBOL}`
  }

  // Calculate transaction fee estimate
  static async estimateTransactionFee(amount: string, to: string): Promise<string> {
    try {
      const plasmaClient = getPlasmaClient()
      const gasEstimate = await plasmaClient.estimateGas(to, amount)
      const gasPrice = await plasmaClient.getGasPrice()

      const gasEstimateNum = Number.parseInt(gasEstimate, 16)
      const gasPriceNum = Number.parseInt(gasPrice, 16)
      const feeWei = gasEstimateNum * gasPriceNum

      return this.fromWei(`0x${feeWei.toString(16)}`)
    } catch (error) {
      console.error("Failed to estimate transaction fee:", error)
      return "0.001" // Fallback fee estimate
    }
  }

  // Get XPL price in USD (mock implementation)
  static async getUSDPrice(): Promise<number> {
    // In a real implementation, this would fetch from a price API
    // For demo purposes, return a mock price
    return 0.25 // $0.25 per XPL
  }

  // Convert XPL amount to USD
  static async toUSD(xplAmount: string): Promise<string> {
    const price = await this.getUSDPrice()
    const amount = Number.parseFloat(xplAmount)
    return (amount * price).toFixed(2)
  }

  // Validate minimum bet amount
  static validateMinBet(amount: string): boolean {
    const num = Number.parseFloat(amount)
    return num >= 0.001 // Minimum 0.001 XPL
  }

  // Validate maximum bet amount based on balance
  static validateMaxBet(amount: string, balance: string): boolean {
    const betAmount = Number.parseFloat(amount)
    const balanceAmount = Number.parseFloat(balance)
    const maxBet = Math.min(balanceAmount * 0.5, 100) // 50% of balance or 100 XPL max

    return betAmount <= maxBet
  }

  // Get betting limits
  static getBettingLimits(balance: string): { min: string; max: string } {
    const balanceNum = Number.parseFloat(balance)
    return {
      min: "0.001",
      max: Math.min(balanceNum * 0.5, 100).toString(),
    }
  }
}

// XPL Token transaction history
export interface XPLTransaction {
  hash: string
  type: "bet" | "win" | "loss"
  amount: string
  timestamp: number
  status: "pending" | "confirmed" | "failed"
  gasUsed?: string
  gasPrice?: string
}

export class XPLTransactionManager {
  private static readonly STORAGE_KEY = "xpl_transactions"

  // Save transaction to local storage
  static saveTransaction(transaction: XPLTransaction): void {
    try {
      const transactions = this.getTransactions()
      transactions.unshift(transaction)

      // Keep only last 50 transactions
      const limitedTransactions = transactions.slice(0, 50)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedTransactions))
    } catch (error) {
      console.error("Failed to save transaction:", error)
    }
  }

  // Get all transactions from local storage
  static getTransactions(): XPLTransaction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to get transactions:", error)
      return []
    }
  }

  // Update transaction status
  static updateTransactionStatus(hash: string, status: XPLTransaction["status"]): void {
    try {
      const transactions = this.getTransactions()
      const index = transactions.findIndex((tx) => tx.hash === hash)

      if (index !== -1) {
        transactions[index].status = status
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions))
      }
    } catch (error) {
      console.error("Failed to update transaction status:", error)
    }
  }

  // Clear all transactions
  static clearTransactions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear transactions:", error)
    }
  }

  // Get transactions by type
  static getTransactionsByType(type: XPLTransaction["type"]): XPLTransaction[] {
    return this.getTransactions().filter((tx) => tx.type === type)
  }

  // Get total amount by type
  static getTotalAmountByType(type: XPLTransaction["type"]): string {
    const transactions = this.getTransactionsByType(type)
    const total = transactions.reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)
    return total.toString()
  }
}
