"use client"
import { Crown, Coins, Diamond, Dice1, TrendingUp, Zap, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SidebarNavigationProps {
  activeGame: string
  onGameSelect: (game: string) => void
}

const games = [
  {
    id: "divine-colors",
    name: "Divine Colors",
    icon: Diamond,
    status: "BLESSED",
    description: "Pick your favourite colour and test your luck!",
  },
  {
    id: "heavenly-flip",
    name: "Betzy Flip",
    icon: Coins,
    status: null,
    description: "Classic coin flip with celestial rewards",
  },
  {
    id: "divine-dice",
    name: "Divine Dice",
    icon: Dice1,
    status: null,
    description: "Roll the dice for betzy wins",
  },
  {
    id: "celestial-limbo",
    name: "Celestial Limbo",
    icon: TrendingUp,
    status: null,
    description: "How high can you go?",
  },
  {
    id: "plinko",
    name: "Plinko",
    icon: Zap,
    status: null,
    description: "Drop the ball and watch it bounce to victory",
  },
]

export function SidebarNavigation({ activeGame, onGameSelect }: SidebarNavigationProps) {
  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <Crown className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Bet On Betzy</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>✨</span>
              <span>Divine Gaming</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 p-4">
        {/* Home Button */}
        <Button
          variant="ghost"
          className="w-full justify-start mb-4 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => onGameSelect("home")}
        >
          <Home className="h-4 w-4 mr-3" />
          Home
        </Button>

        {/* Divine Games Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-2">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-sidebar-foreground">Divine Games</span>
            <span className="text-xs text-muted-foreground">✨</span>
          </div>

          <div className="space-y-1">
            {games.map((game) => (
              <Button
                key={game.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start p-3 h-auto text-left relative",
                  activeGame === game.id
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
                onClick={() => onGameSelect(game.id)}
              >
                <game.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{game.name}</span>
                    {game.status && (
                      <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground">
                        {game.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
