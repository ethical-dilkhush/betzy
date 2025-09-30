import { ethers } from "ethers"
import { PLASMA_NETWORK } from "./wallet-config"

async function rpcCall(method: string, params: any[]): Promise<any> {
  const response = await fetch(PLASMA_NETWORK.rpcUrls[0], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(`RPC Error: ${data.error.message || JSON.stringify(data.error)}`)
  }

  return data.result
}

export async function sendPayout(
  privateKey: string,
  fromAddress: string,
  toAddress: string,
  amount: string,
): Promise<string> {
  try {
    console.log("[v0] Server payout - Starting raw RPC transaction")

    const wallet = new ethers.Wallet(privateKey)

    // Verify the wallet address matches
    if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
      throw new Error("Private key does not match house wallet address")
    }

    console.log("[v0] Server payout - Preparing transaction")
    const valueInWei = ethers.parseEther(amount)

    let gasPrice: string
    try {
      gasPrice = await rpcCall("eth_gasPrice", [])
      console.log("[v0] Server payout - Gas price from RPC:", gasPrice)
    } catch (error) {
      console.log("[v0] Server payout - Using fallback gas price")
      gasPrice = "0x" + ethers.parseUnits("2.5", "gwei").toString(16)
    }

    let nonce: string
    try {
      nonce = await rpcCall("eth_getTransactionCount", [fromAddress, "pending"])
      console.log("[v0] Server payout - Nonce from RPC:", nonce)
    } catch (error) {
      console.log("[v0] Server payout - Failed to get nonce, using 0")
      nonce = "0x0"
    }

    const transaction = {
      to: toAddress,
      value: "0x" + valueInWei.toString(16),
      gasPrice: gasPrice,
      gasLimit: "0x5208", // 21000 in hex
      nonce: nonce,
      chainId: Number.parseInt(PLASMA_NETWORK.chainId, 16),
      data: "0x",
    }

    console.log("[v0] Server payout - Transaction details:", {
      to: transaction.to,
      value: ethers.formatEther(BigInt(transaction.value)),
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit,
      nonce: transaction.nonce,
      chainId: transaction.chainId,
    })

    console.log("[v0] Server payout - Signing transaction")
    const signedTx = await wallet.signTransaction(transaction)
    console.log("[v0] Server payout - Transaction signed")

    console.log("[v0] Server payout - Broadcasting transaction")
    const txHash = await rpcCall("eth_sendRawTransaction", [signedTx])
    console.log("[v0] Server payout - Transaction sent:", txHash)

    return txHash
  } catch (error) {
    console.error("[v0] Server payout - Failed:", error)
    throw error
  }
}
