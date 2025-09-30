"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Home, Palette } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { CoinFlipGame } from "@/components/coin-flip-game"
import { CardGame } from "@/components/card-game"
import { DiceGame } from "@/components/dice-game"
import { LimboGame } from "@/components/limbo-game"
import { PlinkoGame } from "@/components/plinko-game"

interface GameContentProps {
  activeGame: string
}

export function GameContent({ activeGame }: GameContentProps) {
  const { walletState } = useWallet()

  if (activeGame === "home") {
    return (
      <div className="flex-1 main-gradient flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Home className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Home</span>
            </div>
            <CardTitle className="text-3xl mb-2">Welcome to Bet On Betzy</CardTitle>
            <CardDescription className="text-lg">
              Experience divine gaming with celestial rewards on the Plasma Network
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Choose a divine game from the sidebar to begin your betzy journey.
              </p>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Powered by XPL Tokens
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeGame === "divine-colors") {
    return (
      <div className="flex-1 main-gradient p-8">
        <div className="max-w-4xl mx-auto">
          {/* Game Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Home</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-balance">
              <Palette className="inline h-8 w-8 mr-2 text-primary" />
              Colours Game
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Pick your favourite colour and test your luck on One Bets!
            </p>
          </div>

          {/* Game Content */}
          {!walletState.isConnected ? (
            <Card className="max-w-2xl mx-auto bg-card/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="mb-6">
                  <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground mb-2">
                    Please connect your Phantom wallet to start playing colours on One Bets.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the "Connect Wallet" button in the top right corner.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CardGame />
          )}
        </div>
      </div>
    )
  }

  if (activeGame === "heavenly-flip") {
    return (
      <div className="flex-1 main-gradient p-8">
        <div className="max-w-4xl mx-auto">
          {/* Game Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Home</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-balance">
              <Palette className="inline h-8 w-8 mr-2 text-primary" />
              Betzy Flip
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">Classic coin flip with celestial rewards!</p>
          </div>

          {/* Game Content */}
          {!walletState.isConnected ? (
            <Card className="max-w-2xl mx-auto bg-card/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="mb-6">
                  <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground mb-2">
                    Please connect your wallet to start playing Betzy Flip.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the "Connect Wallet" button in the top right corner.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CoinFlipGame />
          )}
        </div>
      </div>
    )
  }

  if (activeGame === "divine-dice") {
    return (
      <div className="flex-1 main-gradient p-8">
        <div className="max-w-4xl mx-auto">
          {/* Game Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Home</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-balance">
              <Palette className="inline h-8 w-8 mr-2 text-primary" />
              Divine Dice
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Roll the celestial dice and predict the divine sum!
            </p>
          </div>

          {/* Game Content */}
          {!walletState.isConnected ? (
            <Card className="max-w-2xl mx-auto bg-card/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="mb-6">
                  <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground mb-2">Please connect your wallet to start playing Divine Dice.</p>
                  <p className="text-sm text-muted-foreground">
                    Click the "Connect Wallet" button in the top right corner.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DiceGame />
          )}
        </div>
      </div>
    )
  }

  if (activeGame === "celestial-limbo") {
    return (
      <div className="flex-1 main-gradient p-8">
        <div className="max-w-6xl mx-auto">
          {/* Game Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Home</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-balance">
              <Palette className="inline h-8 w-8 mr-2 text-primary" />
              Celestial Limbo
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Reach for Betzy! Set your target and watch the multiplier climb!
            </p>
          </div>

          {/* Game Content */}
          {!walletState.isConnected ? (
            <Card className="max-w-2xl mx-auto bg-card/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="mb-6">
                  <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground mb-2">
                    Please connect your wallet to start playing Celestial Limbo.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the "Connect Wallet" button in the top right corner.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <LimboGame />
          )}
        </div>
      </div>
    )
  }

  if (activeGame === "plinko") {
    return (
      <div className="flex-1 main-gradient p-8">
        <div className="max-w-6xl mx-auto">
          {/* Game Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Home</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-balance">
              <Palette className="inline h-8 w-8 mr-2 text-primary" />
              Plinko
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Drop the ball and watch it bounce through the pegs to divine rewards!
            </p>
          </div>

          {/* Game Content */}
          {!walletState.isConnected ? (
            <Card className="max-w-2xl mx-auto bg-card/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="mb-6">
                  <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground mb-2">Please connect your wallet to start playing Plinko.</p>
                  <p className="text-sm text-muted-foreground">
                    Click the "Connect Wallet" button in the top right corner.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PlinkoGame />
          )}
        </div>
      </div>
    )
  }

  // Default for other games
  return (
    <div className="flex-1 main-gradient flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Coming Soon</CardTitle>
          <CardDescription className="text-lg">
            This divine game is being crafted in Betzy. Stay tuned!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Under Development
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
