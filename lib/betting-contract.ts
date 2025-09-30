"use client"

import { getPlasmaClient } from "./plasma-client"
import { getHouseWallet } from "./house-wallet"
import { getGameCounter } from "./game-counter"

export interface BetResult {
  won: boolean
  choice: "heads" | "tails"
  result: "heads" | "tails"
  amount: string
  payout: string
  txHash: string
  seed: string
  blockHash: string
}

export class BettingContract {
  private plasmaClient = getPlasmaClient()
  private houseWallet = getHouseWallet()
  private gameCounter = getGameCounter()

  async placeBet(amount: string, choice: "heads" | "tails", playerAddress: string): Promise<BetResult> {
    try {
      console.log("[v0] Placing bet:", { amount, choice, playerAddress })

      if (playerAddress.toLowerCase() === this.houseWallet.getHouseAddress().toLowerCase()) {
        throw new Error("House wallet cannot place bets. Please use a different wallet address.")
      }

      // Initialize client with player address
      await this.plasmaClient.initialize(playerAddress)

      // Increment game counter and determine outcome
      const gameNumber = this.gameCounter.incrementGameCount()
      const shouldWin = this.gameCounter.shouldPlayerWin(gameNumber)

      // Generate seed for display purposes (not used for outcome)
      const seed = this.plasmaClient.generateRandomSeed()
      console.log("[v0] Generated seed:", seed)

      // Get current block hash for display purposes
      const blockHash = await this.plasmaClient.getCurrentBlockHash()
      console.log("[v0] Block hash:", blockHash)

      // If player should win, make their choice correct
      // If player should lose, make their choice incorrect
      let result: "heads" | "tails"
      if (shouldWin) {
        result = choice // Player's choice is correct
      } else {
        result = choice === "heads" ? "tails" : "heads" // Player's choice is wrong
      }

      const won = choice === result

      console.log("[v0] Game result:", { gameNumber, result, won, pattern: shouldWin ? "WIN" : "LOSE" })

      // Calculate payout (2x bet amount if won, 0 if lost)
      const betAmount = Number.parseFloat(amount)
      const payout = won ? (betAmount * 2).toString() : "0"

      const txHash = await this.executeHouseTransaction(amount, won, playerAddress)

      return {
        won,
        choice,
        result,
        amount,
        payout,
        txHash,
        seed,
        blockHash,
      }
    } catch (error) {
      console.error("[v0] Failed to place bet:", error)
      throw error
    }
  }

  private async executeHouseTransaction(amount: string, won: boolean, playerAddress: string): Promise<string> {
    try {
      console.log("[v0] Collecting bet from player first...")
      const betCollectionTxHash = await this.houseWallet.collectBet(playerAddress, amount)
      console.log("[v0] Bet collected:", betCollectionTxHash)

      if (won) {
        console.log("[v0] Player won! Processing payout...")
        const payoutAmount = (Number.parseFloat(amount) * 2).toString()

        // Validate house has enough funds
        const hasEnoughFunds = await this.houseWallet.validateHouseFunds(payoutAmount)
        if (!hasEnoughFunds) {
          throw new Error("Insufficient house funds for payout")
        }

        // Send payout to player
        const payoutTxHash = await this.houseWallet.sendPayout(playerAddress, payoutAmount)
        console.log("[v0] Payout transaction:", payoutTxHash)

        return payoutTxHash
      } else {
        // Player lost - bet already collected
        console.log("[v0] Player lost! Bet already collected.")

        return betCollectionTxHash
      }
    } catch (error) {
      console.error("[v0] House transaction failed:", error)
      throw new Error(`Transaction failed: ${error.message}`)
    }
  }

  async getTransactionStatus(txHash: string): Promise<"pending" | "confirmed" | "failed"> {
    try {
      console.log("[v0] Checking transaction status:", txHash)

      // Check if it's a real transaction hash
      if (!txHash.startsWith("0x") || txHash.length !== 66) {
        return "failed"
      }

      // Get transaction receipt from blockchain
      const receipt = await this.plasmaClient.getTransactionReceipt(txHash)

      if (receipt === null) {
        return "pending"
      } else if (receipt.status === "0x1") {
        return "confirmed"
      } else {
        return "failed"
      }
    } catch (error) {
      console.error("[v0] Failed to get transaction status:", error)
      return "failed"
    }
  }

  async validateBetAmount(amount: string, playerBalance: string): Promise<boolean> {
    const betAmount = Number.parseFloat(amount)
    const balance = Number.parseFloat(playerBalance)

    // Minimum bet: 0.001 XPL
    // Maximum bet: 50% of balance or 100 XPL, whichever is lower
    const minBet = 0.001
    const maxBet = Math.min(balance * 0.5, 100)

    return betAmount >= minBet && betAmount <= maxBet && betAmount <= balance
  }

  getMinBetAmount(): string {
    return "0.001"
  }

  getMaxBetAmount(balance: string): string {
    const balanceNum = Number.parseFloat(balance)
    return Math.min(balanceNum * 0.5, 100).toString()
  }

  getGameStats(): {
    currentGame: number
    nextOutcome: "WIN" | "LOSE"
    upcomingPattern: Array<{ gameNumber: number; outcome: "WIN" | "LOSE" }>
  } {
    const currentGame = this.gameCounter.getGameCount()
    const nextGameNumber = currentGame + 1
    const nextOutcome = this.gameCounter.shouldPlayerWin(nextGameNumber) ? "WIN" : "LOSE"
    const upcomingPattern = this.gameCounter.getUpcomingPattern(5)

    return {
      currentGame,
      nextOutcome,
      upcomingPattern,
    }
  }

  resetGameCounter(): void {
    this.gameCounter.resetCounter()
  }
}

// Singleton instance
let bettingContract: BettingContract | null = null

export function getBettingContract(): BettingContract {
  if (!bettingContract) {
    bettingContract = new BettingContract()
  }
  return bettingContract
}
