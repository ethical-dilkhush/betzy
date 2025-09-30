"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { PLASMA_NETWORK, type WalletState } from "@/lib/wallet-config"

declare global {
  interface Window {
    ethereum?: any
    okxwallet?: any
    rabby?: any
  }
}

interface WalletContextType {
  walletState: WalletState
  connectWallet: (walletId: string) => Promise<void>
  disconnectWallet: () => void
  refreshBalance: () => Promise<void>
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isCorrectNetwork: false,
  })
  const [isConnecting, setIsConnecting] = useState(false)

  const getProvider = useCallback((walletId: string) => {
    switch (walletId) {
      case "metamask":
        return window.ethereum
      case "okx":
        return window.okxwallet || window.ethereum
      case "rabby":
        return window.rabby || window.ethereum
      default:
        return window.ethereum
    }
  }, [])

  const connectWallet = useCallback(
    async (walletId: string) => {
      setIsConnecting(true)
      try {
        console.log("[v0] Connecting to wallet:", walletId)
        const provider = getProvider(walletId)
        if (!provider) {
          throw new Error(`${walletId} wallet not found`)
        }

        const accounts = await provider.request({
          method: "eth_requestAccounts",
        })

        if (accounts.length === 0) {
          throw new Error("No accounts found")
        }

        const address = accounts[0]
        console.log("[v0] Connected address:", address)

        const chainId = await provider.request({ method: "eth_chainId" })
        console.log("[v0] Current chain ID:", chainId)

        if (chainId !== PLASMA_NETWORK.chainId) {
          console.log("[v0] Switching to Plasma network...")
          try {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: PLASMA_NETWORK.chainId }],
            })
            console.log("[v0] Successfully switched to Plasma network")
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              console.log("[v0] Adding Plasma network to wallet...")
              await provider.request({
                method: "wallet_addEthereumChain",
                params: [PLASMA_NETWORK],
              })
              console.log("[v0] Successfully added Plasma network")
            } else {
              throw switchError
            }
          }
        }

        const balance = await provider.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })

        const balanceInXPL = (Number.parseInt(balance, 16) / 1e18).toFixed(4)
        console.log("[v0] Wallet balance:", balanceInXPL, "XPL")

        setWalletState({
          isConnected: true,
          address,
          balance: balanceInXPL,
          chainId: PLASMA_NETWORK.chainId,
          isCorrectNetwork: true,
        })

        localStorage.setItem("connectedWallet", walletId)
        localStorage.setItem("walletAddress", address)

        console.log("[v0] Wallet connection successful")
      } catch (error) {
        console.error("[v0] Failed to connect wallet:", error)
        throw error
      } finally {
        setIsConnecting(false)
      }
    },
    [getProvider],
  )

  const disconnectWallet = useCallback(() => {
    console.log("[v0] Disconnecting wallet")
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isCorrectNetwork: false,
    })
    localStorage.removeItem("connectedWallet")
    localStorage.removeItem("walletAddress")
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!walletState.isConnected || !walletState.address) return

    try {
      const provider = window.ethereum
      const balance = await provider.request({
        method: "eth_getBalance",
        params: [walletState.address, "latest"],
      })
      const balanceInXPL = (Number.parseInt(balance, 16) / 1e18).toFixed(4)

      setWalletState((prev) => ({ ...prev, balance: balanceInXPL }))
    } catch (error) {
      console.error("Failed to refresh balance:", error)
    }
  }, [walletState.isConnected, walletState.address])

  // Auto-connect on page load
  useEffect(() => {
    const autoConnectWallet = async () => {
      const connectedWallet = localStorage.getItem("connectedWallet")
      const walletAddress = localStorage.getItem("walletAddress")

      if (connectedWallet && walletAddress && window.ethereum) {
        try {
          console.log("[v0] Auto-connecting wallet:", connectedWallet)
          const provider = getProvider(connectedWallet)
          if (!provider) {
            console.log("[v0] Provider not found, clearing localStorage")
            localStorage.removeItem("connectedWallet")
            localStorage.removeItem("walletAddress")
            return
          }

          const accounts = await provider.request({ method: "eth_accounts" })
          if (accounts.length === 0) {
            console.log("[v0] No accounts found, clearing localStorage")
            localStorage.removeItem("connectedWallet")
            localStorage.removeItem("walletAddress")
            return
          }

          const address = accounts[0]
          if (address.toLowerCase() !== walletAddress.toLowerCase()) {
            console.log("[v0] Account mismatch, clearing localStorage")
            localStorage.removeItem("connectedWallet")
            localStorage.removeItem("walletAddress")
            return
          }

          const chainId = await provider.request({ method: "eth_chainId" })

          if (chainId !== PLASMA_NETWORK.chainId) {
            try {
              await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: PLASMA_NETWORK.chainId }],
              })
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                await provider.request({
                  method: "wallet_addEthereumChain",
                  params: [PLASMA_NETWORK],
                })
              } else {
                throw switchError
              }
            }
          }

          const balance = await provider.request({
            method: "eth_getBalance",
            params: [address, "latest"],
          })
          const balanceInXPL = (Number.parseInt(balance, 16) / 1e18).toFixed(4)

          setWalletState({
            isConnected: true,
            address,
            balance: balanceInXPL,
            chainId: PLASMA_NETWORK.chainId,
            isCorrectNetwork: true,
          })

          console.log("[v0] Auto-connection successful")
        } catch (error) {
          console.error("[v0] Auto-connection failed:", error)
          localStorage.removeItem("connectedWallet")
          localStorage.removeItem("walletAddress")
        }
      }
    }

    autoConnectWallet()

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("[v0] Accounts changed:", accounts)
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (walletState.isConnected && accounts[0].toLowerCase() !== walletState.address?.toLowerCase()) {
        disconnectWallet()
      }
    }

    const handleChainChanged = (chainId: string) => {
      console.log("[v0] Chain changed:", chainId)
      setWalletState((prev) => ({
        ...prev,
        chainId,
        isCorrectNetwork: chainId === PLASMA_NETWORK.chainId,
      }))
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [getProvider, disconnectWallet, walletState.isConnected, walletState.address])

  return (
    <WalletContext.Provider value={{ walletState, connectWallet, disconnectWallet, refreshBalance, isConnecting }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
