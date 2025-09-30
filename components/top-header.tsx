"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/use-wallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Info, LogOut, Store, TrendingUp, Award, Home, Wallet, FileText, Twitter } from "lucide-react"
import Image from "next/image"
import { SUPPORTED_WALLETS } from "@/lib/wallet-config"
import { useToast } from "@/hooks/use-toast"

export function TopHeader() {
  const { walletState, disconnectWallet, connectWallet, isConnecting } = useWallet()
  const router = useRouter()
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const { toast } = useToast()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  const handleXClick = () => {
    window.open("https://x.com/betzydotgames", "_blank")
  }

  const handleContractCopy = () => {
    const contractAddress = "0xBfA017c07f0A030c3b95a4588cFd61F15caD9b45" // Replace with actual contract address
    navigator.clipboard.writeText(contractAddress)
    toast({
      title: "Contract Address Copied",
      description: "Contract address has been copied to clipboard.",
    })
  }

  const handleConnect = async (walletId: string) => {
    try {
      await connectWallet(walletId)
      setIsConnectDialogOpen(false)
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Plasma Network",
      })
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 backdrop-blur-sm border border-cyan-400/60 shadow-2xl shadow-cyan-400/25 fixed top-0 left-0 right-0 z-50 sm:rounded-t-[80px] rounded-t-none">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-2 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg overflow-hidden border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/25">
              <Image
                src="/betz.webp"
                alt="Betzy Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-white font-bold text-lg md:text-xl hidden sm:block">BETZY</span>
          </div>

          {/* Center Section - User Profile & Win Display */}
          <div className="flex items-center gap-2 md:gap-6">
            {walletState.isConnected && walletState.address ? (
              <>

              {/* Total Win Display */}
              <Dialog open={isRewardsModalOpen} onOpenChange={setIsRewardsModalOpen}>
                <DialogContent className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-cyan-500/20 text-white w-[calc(100vw-2rem)] max-w-2xl mx-auto h-[90vh] sm:h-auto overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-400 flex items-center gap-2">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="break-words">Betzy Rewards Program</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-bold text-green-400 mb-2">🎯 Stake & Win Program</h3>
                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                        Stake your Betzy tokens to unlock exclusive rewards and increase your winning chances! 
                        The more you stake, the higher your probability of winning games.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="text-base sm:text-lg font-semibold text-cyan-400">Staking Benefits</h4>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium text-white text-sm sm:text-base">Higher Win Probability</p>
                              <p className="text-xs sm:text-sm text-gray-400">Up to 3x better odds for stakers</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium text-white text-sm sm:text-base">Daily Rewards</p>
                              <p className="text-xs sm:text-sm text-gray-400">Earn passive income from staking</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium text-white text-sm sm:text-base">VIP Access</p>
                              <p className="text-xs sm:text-sm text-gray-400">Exclusive games and tournaments</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium text-white text-sm sm:text-base">Reduced Fees</p>
                              <p className="text-sm text-gray-400">Lower transaction costs</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="text-base sm:text-lg font-semibold text-cyan-400">Reward Tiers</h4>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-2 sm:p-3">
                            <div className="flex justify-between items-center flex-wrap gap-1">
                              <span className="font-medium text-yellow-400 text-sm sm:text-base">Gold Tier</span>
                              <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">1000+ XPL</Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">3x win multiplier</p>
                          </div>
                          <div className="bg-slate-800/50 border border-gray-500/20 rounded-lg p-2 sm:p-3">
                            <div className="flex justify-between items-center flex-wrap gap-1">
                              <span className="font-medium text-gray-300 text-sm sm:text-base">Silver Tier</span>
                              <Badge className="bg-gray-500/20 text-gray-300 text-xs">500+ XPL</Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">2x win multiplier</p>
                          </div>
                          <div className="bg-slate-800/50 border border-orange-500/20 rounded-lg p-2 sm:p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-orange-400">Bronze Tier</span>
                              <Badge className="bg-orange-500/20 text-orange-300">100+ XPL</Badge>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">1.5x win multiplier</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-purple-400 mb-2">🚀 How to Start Staking</h4>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p>1. Connect your wallet to Betzy platform</p>
                        <p>2. Navigate to the staking section</p>
                        <p>3. Choose your staking amount and duration</p>
                        <p>4. Start earning rewards and boost your win chances!</p>
                  </div>
                  </div>

                    <div className="text-center">
                      <Button className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-white font-bold px-8 py-3 rounded-full shadow-lg">
                        Start Staking Now
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              </>
            ) : (
              <div className="flex items-center gap-2">
                
              </div>
            )}
          </div>

          {/* Right Section - Shop, Currency & Action Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Home Button - Always visible */}
            <Button 
              onClick={handleHomeClick}
              className="w-8 h-8 md:w-12 md:h-12 rounded-xl border-2 border-cyan-400 bg-blue-900/40 shadow-lg shadow-cyan-400/25 hover:border-cyan-300 hover:bg-blue-900/60 transition-all duration-300"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </Button>

            {/* X (Twitter) Social Button - Always visible */}
            <Button 
              onClick={handleXClick}
              className="w-8 h-8 md:w-12 md:h-12 rounded-xl border-2 border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-400/25 hover:border-blue-300 hover:bg-blue-500/30 transition-all duration-300"
            >
              <Twitter className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </Button>

            {/* Contract Address Button - Always visible */}
            <Dialog open={isContractModalOpen} onOpenChange={setIsContractModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-8 h-8 md:w-12 md:h-12 rounded-xl border-2 border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-400/25 hover:border-purple-300 hover:bg-purple-500/30 transition-all duration-300">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-cyan-500/20 text-white w-[calc(100vw-2rem)] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="break-words">Contract Address</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-300">Betzy Contract Address</label>
                    <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 overflow-hidden">
                      <span className="font-mono text-xs sm:text-sm break-all word-break-all">0xBfA017c07f0A030c3b95a4588cFd61F15caD9b45</span>
                      <Button
                        onClick={handleContractCopy}
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm w-full sm:w-auto"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    This is the main Betzy smart contract address on the Plasma Network.
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {walletState.isConnected && (
              <>
                {/* Shop Button */}
                <Dialog open={isRewardsModalOpen} onOpenChange={setIsRewardsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-8 h-8 md:w-12 md:h-12 rounded-xl border-2 border-green-400 bg-green-500/20 shadow-lg shadow-green-400/25 hover:border-green-300 hover:bg-green-500/30 transition-all duration-300">
                      <Store className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-cyan-500/20 text-white w-[calc(100vw-2rem)] max-w-2xl mx-auto h-[90vh] sm:h-auto overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-400 flex items-center gap-2">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="break-words">Betzy Rewards Program</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 sm:space-y-6">
                      <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4">
                        <h3 className="text-base sm:text-lg font-bold text-green-400 mb-2">🎯 Stake & Win Program</h3>
                        <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                          Stake your Betzy tokens to unlock exclusive rewards and increase your winning chances! 
                          The more you stake, the higher your probability of winning games.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-3 sm:space-y-4">
                          <h4 className="text-base sm:text-lg font-semibold text-cyan-400">Staking Benefits</h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="font-medium text-white text-sm sm:text-base">Higher Win Probability</p>
                                <p className="text-xs sm:text-sm text-gray-400">Up to 3x better odds for stakers</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="font-medium text-white text-sm sm:text-base">Daily Rewards</p>
                                <p className="text-xs sm:text-sm text-gray-400">Earn passive income from staking</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="font-medium text-white text-sm sm:text-base">VIP Access</p>
                                <p className="text-xs sm:text-sm text-gray-400">Exclusive games and tournaments</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="font-medium text-white text-sm sm:text-base">Reduced Fees</p>
                                <p className="text-xs sm:text-sm text-gray-400">Lower transaction costs</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <h4 className="text-base sm:text-lg font-semibold text-cyan-400">Reward Tiers</h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-2 sm:p-3">
                              <div className="flex justify-between items-center flex-wrap gap-1">
                                <span className="font-medium text-yellow-400 text-sm sm:text-base">Gold Tier</span>
                                <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">1000+ XPL</Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-400 mt-1">3x win multiplier</p>
                            </div>
                            <div className="bg-slate-800/50 border border-gray-500/20 rounded-lg p-2 sm:p-3">
                              <div className="flex justify-between items-center flex-wrap gap-1">
                                <span className="font-medium text-gray-300 text-sm sm:text-base">Silver Tier</span>
                                <Badge className="bg-gray-500/20 text-gray-300 text-xs">500+ XPL</Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-400 mt-1">2x win multiplier</p>
                            </div>
                            <div className="bg-slate-800/50 border border-orange-500/20 rounded-lg p-2 sm:p-3">
                              <div className="flex justify-between items-center flex-wrap gap-1">
                                <span className="font-medium text-orange-400 text-sm sm:text-base">Bronze Tier</span>
                                <Badge className="bg-orange-500/20 text-orange-300 text-xs">100+ XPL</Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-400 mt-1">1.5x win multiplier</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4">
                        <h4 className="text-base sm:text-lg font-semibold text-purple-400 mb-2 sm:mb-3">🚀 How to Start Staking</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">1</div>
                            <span className="text-xs sm:text-sm">Connect your wallet to Betzy platform</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">2</div>
                            <span className="text-xs sm:text-sm">Navigate to the staking section</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">3</div>
                            <span className="text-xs sm:text-sm">Choose your staking amount and duration</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">4</div>
                            <span className="text-xs sm:text-sm">Start earning rewards and boost your win chances!</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 text-sm sm:text-base">
                          Start Staking Now
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Info Button with Modal */}
                <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-8 h-8 md:w-12 md:h-12 rounded-xl border-2 border-cyan-400 bg-blue-900/40 shadow-lg shadow-cyan-400/25 hover:border-cyan-300 hover:bg-blue-900/60 transition-all duration-300">
                      <Info className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-cyan-500/20 text-white w-[calc(100vw-2rem)] max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-400">Wallet Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-300">Wallet Address</label>
                        <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20 overflow-hidden">
                          <span className="font-mono text-xs sm:text-sm break-all word-break-all">{walletState.address}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-300">Balance</label>
                        <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                          <span className="font-bold text-base sm:text-lg text-green-400">{walletState.balance} XPL</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-300">Network</label>
                        <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-400/50 text-xs sm:text-sm">
                            Plasma Network
                          </Badge>
                    </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-300">Chain ID</label>
                        <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                          <span className="font-mono text-xs sm:text-sm">{walletState.chainId}</span>
                    </div>
                  </div>
                </div>
                  </DialogContent>
                </Dialog>
                
                {/* Disconnect Button */}
                <Button 
                  onClick={handleDisconnect}
                  className="w-8 h-8 md:w-12 md:h-12 rounded-xl border-2 border-cyan-400 bg-blue-900/40 shadow-lg shadow-cyan-400/25 hover:border-cyan-300 hover:bg-blue-900/60 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </Button>
              </>
            )}

            {/* Wallet Connect Button - Only show when not connected */}
            {!walletState.isConnected && (
              <div className="bg-green-500/20 border-2 border-green-400 rounded-xl px-2 md:px-4 py-1 md:py-2 shadow-lg shadow-green-400/25">
                <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="pulse-glow text-xs md:text-sm">
                      <Wallet className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Connect Wallet</span>
                      <span className="sm:hidden">Connect</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-cyan-500/20 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg md:text-xl text-cyan-400">Connect Your Wallet</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 sm:space-y-3">
                      {SUPPORTED_WALLETS.map((wallet) => (
                        <Button
                          key={wallet.id}
                          variant="outline"
                          className="w-full justify-start h-10 sm:h-12 bg-transparent border-cyan-500/20 hover:bg-cyan-500/10"
                          onClick={() => handleConnect(wallet.id)}
                          disabled={isConnecting}
                        >
                          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{wallet.icon}</span>
                          <span className="text-sm sm:text-base">{wallet.name}</span>
                        </Button>
                      ))}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 text-center mt-3 sm:mt-4">
                      By connecting your wallet, you agree to our terms of service.
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
