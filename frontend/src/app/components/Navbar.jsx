"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import { WalletContext } from "@/context/wallet";
import { BrowserProvider } from "ethers";
import { FlipWords } from "./ui/flip-words";
import { toast } from "sonner";
import {
  Menu,
  X,
  Home,
  Store,
  ImagePlus,
  User,
  Gavel,
  ArrowRight,
  ChevronDown,
  Wallet,
  BarChart2,
  Settings,
  MessageSquare,
  LogOut,
  ChevronRight,
  ArrowUpRight,
  Network
} from "lucide-react";

const Navbar = ({ className }) => {
  const {
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
    signer,
    setSigner,
    userName,
  } = useContext(WalletContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please Install MetaMask To Continue");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);
      const accounts = await provider.send("eth_requestAccounts", []);
      setIsConnected(true);
      setUserAddress(accounts[0]);
      toast.success("MetaMask Wallet Connected");
      const network = await provider.getNetwork();
      const chainID = network.chainId;
      const sepoliaNetworkId = 11155111;

      if (chainID !== sepoliaNetworkId) {
        toast.warning("Switch to Polygon network to continue");
      }
    } catch (error) {
      console.log("Connection error", error);
      toast.error("Failed to connect wallet");
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const truncateAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  };

  return (
    <div className={`sticky top-0 z-50 w-full bg-black/40 backdrop-blur-md border-b border-zinc-800/30 ${className}`}>
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        {/* Left Side - Hamburger Menu and Logo */}
        <div className="flex items-center space-x-6">
          {/* Hamburger Menu for Mobile */}
          <button
            type="button"
            className="lg:hidden text-slate-300 hover:text-pink-400 focus:outline-none transition-colors"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Logo */}
          <span className="text-base font-bold text-slate-300 font-mono tracking-wider">
            <FlipWords words={["METABAZAAR", "METABAZAAR"]} duration={1} />
          </span>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-sm font-mono text-slate-300 hover:text-pink-400 transition-colors">
              <Home className="w-4 h-4" />
              <span>HOME</span>
            </Link>
            <Link href="/marketplace" className="flex items-center space-x-2 text-sm font-mono text-slate-300 hover:text-pink-400 transition-colors">
              <Store className="w-4 h-4" />
              <span>MARKETPLACE</span>
            </Link>
            <Link href="/mint" className="flex items-center space-x-2 text-sm font-mono text-slate-300 hover:text-pink-400 transition-colors">
              <ImagePlus className="w-4 h-4" />
              <span>MINT</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-2 text-sm font-mono text-slate-300 hover:text-pink-400 transition-colors">
              <User className="w-4 h-4" />
              <span>PROFILE</span>
            </Link>
            <Link href="/auction" className="flex items-center space-x-2 text-sm font-mono text-slate-300 hover:text-pink-400 transition-colors">
              <Gavel className="w-4 h-4" />
              <span>AUCTION</span>
            </Link>
          </div>
        </div>

        {/* Right Side (Wallet, FAQ and Trade buttons) */}
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <>
              <Link
                href="/trade"
                className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900/30 hover:bg-zinc-900/50 text-sky-400 border border-sky-500/20 rounded-lg transition-colors font-mono text-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="font-medium">TRADE NFT</span>
              </Link>
              <Link
                href="/faq"
                className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900/30 hover:bg-zinc-900/50 text-slate-300 border border-zinc-800/50 rounded-lg transition-colors font-mono text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">FAQ</span>
              </Link>
              <button
                type="button"
                className="relative flex items-center space-x-2 px-3 py-1.5 bg-zinc-900/30 hover:bg-zinc-900/50 text-pink-400 border border-pink-500/20 rounded-lg transition-colors font-mono text-sm"
                onClick={toggleDropdown}
              >
                <Wallet className="w-4 h-4" />
                <span className="font-medium">{truncateAddress(userAddress)}</span>
                <ChevronDown className="w-4 h-4" />
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900/80 backdrop-blur-lg border border-zinc-800/50 rounded-lg shadow-lg py-2">
                    <ul className="text-sm font-mono">
                      <li>
                        <Link href="/leaderboard" className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 transition-colors">
                          <BarChart2 className="w-4 h-4" />
                          <span>LEADERBOARD</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/settings" className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 transition-colors">
                          <Settings className="w-4 h-4" />
                          <span>SETTINGS</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/discussion" className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span>DISCUSSIONS</span>
                        </Link>
                      </li>
                      <li className="border-t border-zinc-800/50 my-2" />
                      <li>
                        <button className="flex items-center space-x-2 w-full px-4 py-2 text-slate-300 hover:bg-zinc-800/50 hover:text-red-400 transition-colors">
                          <LogOut className="w-4 h-4" />
                          <span>DISCONNECT</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/faq"
                className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900/30 hover:bg-zinc-900/50 text-slate-300 border border-zinc-800/50 rounded-lg transition-colors font-mono text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">FAQ</span>
              </Link>
              <button
                type="button"
                onClick={connectWallet}
                className="flex items-center space-x-2 px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30 rounded-lg transition-colors font-mono text-sm"
              >
                <Wallet className="w-4 h-4" />
                <span className="font-medium">CONNECT WALLET</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-800/50">
          <div className="px-4 py-2 space-y-1">
            {/* Navigation Links */}
            <Link href="/" className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 rounded-lg transition-colors">
              <Home className="w-5 h-5" />
              <span>HOME</span>
            </Link>
            <Link href="/marketplace" className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 rounded-lg transition-colors">
              <Store className="w-5 h-5" />
              <span>MARKETPLACE</span>
            </Link>
            <Link href="/mint" className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 rounded-lg transition-colors">
              <ImagePlus className="w-5 h-5" />
              <span>MINT</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 rounded-lg transition-colors">
              <User className="w-5 h-5" />
              <span>PROFILE</span>
            </Link>
            <Link href="/auction" className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 rounded-lg transition-colors">
              <Gavel className="w-5 h-5" />
              <span>AUCTION</span>
            </Link>
            <Link href="/faq" className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span>FAQ</span>
            </Link>

            {/* Trade NFT Button */}
            {isConnected && (
              <Link
                href="/trade"
                className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-sky-400 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <ArrowUpRight className="w-5 h-5" />
                <span>TRADE NFT</span>
              </Link>
            )}

            {/* Wallet Address or Connect Wallet Button */}
            {isConnected ? (
              <div className="px-3 py-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-mono text-pink-400 hover:bg-zinc-800/50 rounded-lg transition-colors"
                  onClick={toggleDropdown}
                >
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-5 h-5" />
                    <span>{truncateAddress(userAddress)}</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dropdown Menu for Wallet Address */}
                {isDropdownOpen && (
                  <div className="mt-1 ml-4 space-y-1">
                    <Link href="/leaderboard" className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 rounded-lg transition-colors">
                      <BarChart2 className="w-5 h-5" />
                      <span>LEADERBOARD</span>
                    </Link>
                    <Link href="/settings" className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 rounded-lg transition-colors">
                      <Settings className="w-5 h-5" />
                      <span>SETTINGS</span>
                    </Link>
                    <Link href="/discussion" className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-pink-400 rounded-lg transition-colors">
                      <MessageSquare className="w-5 h-5" />
                      <span>DISCUSSIONS</span>
                    </Link>
                    <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-mono text-slate-300 hover:bg-zinc-800/50 hover:text-red-400 rounded-lg transition-colors">
                      <LogOut className="w-5 h-5" />
                      <span>DISCONNECT</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-mono text-pink-400 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <Wallet className="w-5 h-5" />
                <span>CONNECT WALLET</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;