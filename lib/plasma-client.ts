"use client"

import { PLASMA_NETWORK } from "./wallet-config"
import { ethers } from "ethers"

export class PlasmaClient {
  private provider: any
  private signer: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.provider = window.ethereum
    }
  }

  async initialize(address: string) {
    this.signer = address
    console.log("[v0] Initializing PlasmaClient with address:", address)

    // Ensure we're on the correct network
    const chainId = await this.provider.request({ method: "eth_chainId" })
    console.log("[v0] Current chain ID:", chainId, "Expected:", PLASMA_NETWORK.chainId)

    if (chainId !== PLASMA_NETWORK.chainId) {
      throw new Error("Please switch to Plasma Network")
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      console.log("[v0] Getting balance for address:", address)
      const balance = await this.provider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      console.log("[v0] Raw balance:", balance)
      const balanceInXPL = (Number.parseInt(balance, 16) / 1e18).toFixed(4)
      console.log("[v0] Balance in XPL:", balanceInXPL)
      return balanceInXPL
    } catch (error) {
      console.error("[v0] Failed to get balance:", error)
      throw error
    }
  }

  async sendTransaction(to: string, value: string, data?: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected")
    }

    try {
      console.log("[v0] Sending transaction:", { to, value, from: this.signer })

      const valueInWei = `0x${(Number.parseFloat(value) * 1e18).toString(16)}`
      console.log("[v0] Value in wei:", valueInWei)

      // Get current gas price from network
      const gasPrice = await this.getGasPrice()
      console.log("[v0] Gas price:", gasPrice)

      // Estimate gas for the transaction
      const gasEstimate = await this.estimateGas(to, value, data)
      console.log("[v0] Gas estimate:", gasEstimate)

      const txParams = {
        from: this.signer,
        to,
        value: valueInWei,
        gas: gasEstimate,
        gasPrice,
        data: data || "0x",
      }

      console.log("[v0] Transaction params:", txParams)

      const txHash = await this.provider.request({
        method: "eth_sendTransaction",
        params: [txParams],
      })

      console.log("[v0] Transaction sent with hash:", txHash)
      return txHash
    } catch (error) {
      console.error("[v0] Transaction failed:", error)
      throw error
    }
  }

  async sendTransactionWithPrivateKey(
    privateKey: string,
    fromAddress: string,
    toAddress: string,
    value: string,
    data?: string,
  ): Promise<string> {
    try {
      console.log("[v0] Sending transaction with private key:", { fromAddress, toAddress, value })

      // Create provider for Plasma network
      const provider = new ethers.JsonRpcProvider(PLASMA_NETWORK.rpcUrls[0])

      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey, provider)

      // Verify the wallet address matches the expected house address
      if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error("Private key does not match house wallet address")
      }

      // Get current nonce
      const nonce = await provider.getTransactionCount(fromAddress, "pending")
      console.log("[v0] Current nonce:", nonce)

      // Get gas price
      const feeData = await provider.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits("2.5", "gwei")
      console.log("[v0] Gas price:", gasPrice.toString())

      // Prepare transaction
      const valueInWei = ethers.parseEther(value)
      const transaction = {
        to: toAddress,
        value: valueInWei,
        gasPrice: gasPrice,
        gasLimit: 21000, // Standard gas limit for simple transfers
        nonce: nonce,
        data: data || "0x",
      }

      console.log("[v0] Transaction details:", transaction)

      // Sign and send transaction
      const signedTx = await wallet.sendTransaction(transaction)
      console.log("[v0] Transaction sent:", signedTx.hash)

      return signedTx.hash
    } catch (error) {
      console.error("[v0] Failed to send transaction with private key:", error)
      throw error
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.request({
        method: "eth_gasPrice",
      })
      console.log("[v0] Network gas price:", gasPrice)
      return gasPrice
    } catch (error) {
      console.error("[v0] Failed to get gas price:", error)
      // Use a higher fallback gas price for Plasma network
      return "0x9502F900" // 2.5 gwei
    }
  }

  async estimateGas(to: string, value: string, data?: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected")
    }

    try {
      const valueInWei = `0x${(Number.parseFloat(value) * 1e18).toString(16)}`

      const gasEstimate = await this.provider.request({
        method: "eth_estimateGas",
        params: [
          {
            from: this.signer,
            to,
            value: valueInWei,
            data: data || "0x",
          },
        ],
      })

      console.log("[v0] Gas estimate from network:", gasEstimate)

      // Add 20% buffer to gas estimate
      const gasWithBuffer = Math.floor(Number.parseInt(gasEstimate, 16) * 1.2)
      const gasHex = `0x${gasWithBuffer.toString(16)}`
      console.log("[v0] Gas with buffer:", gasHex)

      return gasHex
    } catch (error) {
      console.error("[v0] Failed to estimate gas:", error)
      // Use higher default gas for complex transactions
      return "0x7530" // 30000 gas
    }
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    try {
      const receipt = await this.provider.request({
        method: "eth_getTransactionReceipt",
        params: [txHash],
      })
      return receipt
    } catch (error) {
      console.error("Failed to get transaction receipt:", error)
      throw error
    }
  }

  async waitForTransaction(txHash: string, timeout = 60000): Promise<any> {
    console.log("[v0] Waiting for transaction:", txHash)
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        const receipt = await this.getTransactionReceipt(txHash)
        if (receipt && receipt.blockNumber) {
          console.log("[v0] Transaction confirmed:", receipt)
          return receipt
        }
      } catch (error) {
        // Transaction not yet mined, continue waiting
        console.log("[v0] Transaction still pending...")
      }

      // Wait 3 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    throw new Error("Transaction timeout")
  }

  generateRandomSeed(): string {
    // Generate a cryptographically secure random seed for the coin flip
    const array = new Uint32Array(8)
    crypto.getRandomValues(array)
    return Array.from(array, (dec) => dec.toString(16).padStart(8, "0")).join("")
  }

  // Simple hash function for determining coin flip result
  hashSeed(seed: string, blockHash: string): boolean {
    // Combine seed with block hash for randomness
    const combined = seed + blockHash
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % 2 === 0 // true for heads, false for tails
  }

  async getCurrentBlockHash(): Promise<string> {
    try {
      const blockNumber = await this.provider.request({
        method: "eth_blockNumber",
      })

      const block = await this.provider.request({
        method: "eth_getBlockByNumber",
        params: [blockNumber, false],
      })

      return block.hash
    } catch (error) {
      console.error("Failed to get current block hash:", error)
      // Fallback to a pseudo-random hash
      return `0x${Date.now().toString(16).padStart(64, "0")}`
    }
  }
}

// Singleton instance
let plasmaClient: PlasmaClient | null = null

export function getPlasmaClient(): PlasmaClient {
  if (!plasmaClient) {
    plasmaClient = new PlasmaClient()
  }
  return plasmaClient
}
