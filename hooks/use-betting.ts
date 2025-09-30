"use client"

import { useState, useCallback } from "react"
import { getBettingContract, type BetResult } from "@/lib/betting-contract"
import { useWallet } from "./use-wallet"

export function useBetting() {
  const { walletState, refreshBalance } = useWallet()
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [lastBetResult, setLastBetResult] = useState<BetResult | null>(null)
  const [betHistory, setBetHistory] = useState<BetResult[]>([])

  const bettingContract = getBettingContract()

  const placeBet = useCallback(
    async (amount: string, choice: "heads" | "tails"): Promise<BetResult> => {
      if (!walletState.isConnected || !walletState.address) {
        throw new Error("Wallet not connected")
      }

      if (!walletState.balance) {
        throw new Error("Unable to get wallet balance")
      }

      // Validate bet amount
      const isValidAmount = await bettingContract.validateBetAmount(amount, walletState.balance)
      if (!isValidAmount) {
        throw new Error("Invalid bet amount")
      }

      setIsPlacingBet(true)
      try {
        const result = await bettingContract.placeBet(amount, choice, walletState.address)

        setLastBetResult(result)
        setBetHistory((prev) => [result, ...prev.slice(0, 9)]) // Keep last 10 bets

        // Refresh wallet balance after bet
        setTimeout(() => {
          refreshBalance()
        }, 1000)

        return result
      } catch (error) {
        console.error("Failed to place bet:", error)
        throw error
      } finally {
        setIsPlacingBet(false)
      }
    },
    [walletState, bettingContract, refreshBalance],
  )

  const getMinBetAmount = useCallback(() => {
    return bettingContract.getMinBetAmount()
  }, [bettingContract])

  const getMaxBetAmount = useCallback(() => {
    if (!walletState.balance) return "0"
    return bettingContract.getMaxBetAmount(walletState.balance)
  }, [walletState.balance, bettingContract])

  const validateBetAmount = useCallback(
    async (amount: string): Promise<boolean> => {
      if (!walletState.balance) return false
      return bettingContract.validateBetAmount(amount, walletState.balance)
    },
    [walletState.balance, bettingContract],
  )

  return {
    placeBet,
    isPlacingBet,
    lastBetResult,
    betHistory,
    getMinBetAmount,
    getMaxBetAmount,
    validateBetAmount,
  }
}
