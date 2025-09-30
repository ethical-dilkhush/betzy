export const PLASMA_NETWORK = {
  chainId: "0x2611", // 9745 in hex
  chainName: "Plasma Network",
  nativeCurrency: {
    name: "XPL",
    symbol: "XPL",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.plasma.to"], // Ensure RPC URL is exactly as specified by user
  blockExplorerUrls: ["https://explorer.plasma.to"],
}

export const SUPPORTED_WALLETS = [
  {
    name: "MetaMask",
    id: "metamask",
    icon: "🦊",
    connector: "injected",
  },
  {
    name: "OKX Wallet",
    id: "okx",
    icon: "⭕",
    connector: "injected",
  },
  {
    name: "Rabby Wallet",
    id: "rabby",
    icon: "🐰",
    connector: "injected",
  },
]

export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: string | null
  isCorrectNetwork: boolean
}
