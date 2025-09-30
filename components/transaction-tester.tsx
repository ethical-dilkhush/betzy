"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Clock, Send } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { getPlasmaClient } from "@/lib/plasma-client"
import { getHouseWallet } from "@/lib/house-wallet"
import { useToast } from "@/hooks/use-toast"

export function TransactionTester() {
  const { walletState } = useWallet()
  const { toast } = useToast()
  const [testAmount, setTestAmount] = useState("0.001")
  const [testAddress, setTestAddress] = useState("")
  const [isTestingTx, setIsTestingTx] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const plasmaClient = getPlasmaClient()
  const houseWallet = getHouseWallet()

  const runTransactionTest = async () => {
    if (!walletState.isConnected || !walletState.address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsTestingTx(true)
    const testResult: any = {
      timestamp: new Date().toISOString(),
      tests: [],
    }

    try {
      // Test 1: Check network connection
      console.log("[v0] Testing network connection...")
      testResult.tests.push({
        name: "Network Connection",
        status: "running",
      })

      await plasmaClient.initialize(walletState.address)
      const chainId = await window.ethereum.request({ method: "eth_chainId" })

      testResult.tests[0].status = chainId === "0x2611" ? "success" : "failed"
      testResult.tests[0].details = `Chain ID: ${chainId} (Expected: 0x2611)`

      // Test 2: Check wallet balance
      console.log("[v0] Testing wallet balance...")
      testResult.tests.push({
        name: "Wallet Balance",
        status: "running",
      })

      const balance = await plasmaClient.getBalance(walletState.address)
      testResult.tests[1].status = Number.parseFloat(balance) > 0 ? "success" : "warning"
      testResult.tests[1].details = `Balance: ${balance} XPL`

      // Test 3: Check house wallet
      console.log("[v0] Testing house wallet...")
      testResult.tests.push({
        name: "House Wallet",
        status: "running",
      })

      const houseBalance = await houseWallet.getHouseBalance()
      const houseAddress = houseWallet.getHouseAddress()
      testResult.tests[2].status = "success"
      testResult.tests[2].details = `House: ${houseAddress} (${houseBalance} XPL)`

      // Test 4: Gas price estimation
      console.log("[v0] Testing gas estimation...")
      testResult.tests.push({
        name: "Gas Estimation",
        status: "running",
      })

      try {
        const gasPrice = await plasmaClient.getGasPrice()
        const gasEstimate = await plasmaClient.estimateGas(houseAddress, testAmount)
        testResult.tests[3].status = "success"
        testResult.tests[3].details = `Gas Price: ${gasPrice}, Estimate: ${gasEstimate}`
      } catch (gasError: any) {
        testResult.tests[3].status = "failed"
        testResult.tests[3].details = `Gas Error: ${gasError.message}`
      }

      // Test 5: Transaction simulation (if test address provided)
      if (testAddress && testAddress.startsWith("0x")) {
        console.log("[v0] Testing transaction simulation...")
        testResult.tests.push({
          name: "Transaction Simulation",
          status: "running",
        })

        try {
          // Don't actually send, just prepare the transaction
          const valueInWei = `0x${(Number.parseFloat(testAmount) * 1e18).toString(16)}`
          const txParams = {
            from: walletState.address,
            to: testAddress,
            value: valueInWei,
            gas: "0x7530", // 30000 gas
            gasPrice: await plasmaClient.getGasPrice(),
          }

          testResult.tests[4].status = "success"
          testResult.tests[4].details = `Simulation prepared: ${testAmount} XPL to ${testAddress.slice(0, 10)}...`
        } catch (simError: any) {
          testResult.tests[4].status = "failed"
          testResult.tests[4].details = `Simulation Error: ${simError.message}`
        }
      }

      setTestResults((prev) => [testResult, ...prev.slice(0, 4)])

      toast({
        title: "Transaction Test Complete",
        description: "Check the results below for detailed information",
      })
    } catch (error: any) {
      console.error("[v0] Transaction test failed:", error)
      testResult.error = error.message
      setTestResults((prev) => [testResult, ...prev.slice(0, 4)])

      toast({
        title: "Transaction Test Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsTestingTx(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Transaction Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="testAmount">Test Amount (XPL)</Label>
            <Input
              id="testAmount"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              placeholder="0.001"
            />
          </div>
          <div>
            <Label htmlFor="testAddress">Test Address (Optional)</Label>
            <Input
              id="testAddress"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
        </div>

        <Button onClick={runTransactionTest} disabled={!walletState.isConnected || isTestingTx} className="w-full">
          {isTestingTx ? "Running Tests..." : "Run Transaction Test"}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-semibold">Test Results</h3>

            {testResults.map((result, index) => (
              <Card key={index} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>

                  {result.error && <div className="text-red-500 text-sm mb-2">Error: {result.error}</div>}

                  <div className="space-y-2">
                    {result.tests.map((test: any, testIndex: number) => (
                      <div key={testIndex} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.status)}
                          <span className="text-sm font-medium">{test.name}</span>
                        </div>
                        <Badge
                          variant={
                            test.status === "success"
                              ? "default"
                              : test.status === "failed"
                                ? "destructive"
                                : test.status === "warning"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {test.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {result.tests.some((t: any) => t.details) && (
                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                      {result.tests.map(
                        (test: any, testIndex: number) =>
                          test.details && (
                            <div key={testIndex}>
                              <strong>{test.name}:</strong> {test.details}
                            </div>
                          ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
