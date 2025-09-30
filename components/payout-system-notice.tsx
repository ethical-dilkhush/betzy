import { AlertTriangle, Server, Key } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PayoutSystemNotice() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          Payout System Status
        </CardTitle>
        <CardDescription className="text-amber-700">Current implementation status and requirements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Payouts Currently Disabled</AlertTitle>
          <AlertDescription className="text-red-700">
            The payout system is not yet implemented. Players can only lose bets until a proper server-side payout
            system is deployed with the house wallet's private key.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold text-amber-800">Required for Live Payouts:</h4>

          <div className="flex items-start gap-3">
            <Server className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Server-Side Implementation</p>
              <p className="text-sm text-amber-700">Create API endpoint to handle payout requests securely</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">House Wallet Private Key</p>
              <p className="text-sm text-amber-700">Store private key securely on server to sign payout transactions</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-amber-200">
          <p className="text-xs text-amber-600">
            This prevents fake wins and ensures all payouts are real blockchain transactions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
