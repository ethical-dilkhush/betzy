import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"
import { sendPayout } from "@/lib/server-payout"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerAddress, amount } = body

    // Validate inputs
    if (!playerAddress || !amount) {
      return NextResponse.json({ message: "Missing required fields: playerAddress and amount" }, { status: 400 })
    }

    // Get house wallet configuration from server-side environment variables
    const houseAddress = process.env.NEXT_PUBLIC_HOUSE_WALLET_ADDRESS
    const housePrivateKey = process.env.HOUSE_WALLET_PRIVATE_KEY

    if (!houseAddress || !housePrivateKey) {
      console.error("[v0] House wallet not configured on server")
      return NextResponse.json(
        { message: "House wallet not configured. Please contact administrator." },
        { status: 500 },
      )
    }

    // Validate Ethereum address format
    if (!ethers.isAddress(playerAddress)) {
      return NextResponse.json({ message: "Invalid player address format" }, { status: 400 })
    }

    console.log("[v0] Processing payout:", { playerAddress, amount })

    const txHash = await sendPayout(housePrivateKey, houseAddress, playerAddress, amount)

    return NextResponse.json({
      txHash,
      message: "Payout sent successfully",
    })
  } catch (error: any) {
    console.error("[v0] Payout failed:", error?.message || "Unknown error")
    return NextResponse.json({ message: error?.message || "Failed to process payout" }, { status: 500 })
  }
}
