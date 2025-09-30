"use client"

// Game counter to track the predetermined winning pattern
// Pattern: 1st player loses, 2nd player loses, 3rd player wins, repeat
export class GameCounter {
  private static readonly STORAGE_KEY = "betting_game_counter"

  // Get current game count from localStorage
  getGameCount(): number {
    if (typeof window === "undefined") return 0
    const stored = localStorage.getItem(GameCounter.STORAGE_KEY)
    return stored ? Number.parseInt(stored, 10) : 0
  }

  // Increment game count and return new count
  incrementGameCount(): number {
    const currentCount = this.getGameCount()
    const newCount = currentCount + 1

    if (typeof window !== "undefined") {
      localStorage.setItem(GameCounter.STORAGE_KEY, newCount.toString())
    }

    console.log(`[v0] Game count incremented to: ${newCount}`)
    return newCount
  }

  // Determine if current game should be a win based on pattern
  // Pattern: positions 3, 6, 9, 12, etc. are wins (every 3rd game)
  shouldPlayerWin(gameNumber: number): boolean {
    const shouldWin = gameNumber % 3 === 0
    console.log(`[v0] Game ${gameNumber}: Player should ${shouldWin ? "WIN" : "LOSE"}`)
    return shouldWin
  }

  // Reset counter (for testing purposes)
  resetCounter(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(GameCounter.STORAGE_KEY)
    }
    console.log("[v0] Game counter reset")
  }

  // Get next few game outcomes for display
  getUpcomingPattern(count = 5): Array<{ gameNumber: number; outcome: "WIN" | "LOSE" }> {
    const currentCount = this.getGameCount()
    const pattern = []

    for (let i = 1; i <= count; i++) {
      const gameNumber = currentCount + i
      const outcome = this.shouldPlayerWin(gameNumber) ? "WIN" : "LOSE"
      pattern.push({ gameNumber, outcome })
    }

    return pattern
  }
}

// Singleton instance
let gameCounter: GameCounter | null = null

export function getGameCounter(): GameCounter {
  if (!gameCounter) {
    gameCounter = new GameCounter()
  }
  return gameCounter
}
