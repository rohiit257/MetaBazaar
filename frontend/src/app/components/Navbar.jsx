"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import { WalletContext } from "@/context/wallet";
import { BrowserProvider } from "ethers";
import { FlipWords } from "./ui/flip-words";
import { LinkPreview } from "./ui/link-preview";
import { toast } from "sonner";


const Navbar = ({ className }) => {
  const {
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
    signer,
    setSigner,
  } = useContext(WalletContext);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast("Please Install MetaMask To Continue");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);
      const accounts = await provider.send("eth_requestAccounts", []);
      setIsConnected(true);
      setUserAddress(accounts[0]);
      toast("MetaMask Wallet Connected");
      const network = await provider.getNetwork();
      const chainID = network.chainId;
      const sepoliaNetworkId = 11155111;

      if (chainID !== sepoliaNetworkId) {
        toast("Switch to Polygon network to continue");
      }
    } catch (error) {
      console.log("Connection error", error);
    }
  };
  

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const truncateAddress = (address) => {
    return address ? `${address.slice(0, 8)}...` : "";
  };

  return (
    <div className={`sticky top-0 z-50 w-full bg-black border border-zinc-950 ${className}`}>
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        {/* Left Side */}
        <div className="flex items-center space-x-6">
          <span className="text-lg font-bold text-slate-300 font-space-mono tracking-wide">
            <FlipWords words={["METABAZAAR", "METABAZAAR"]} duration={1} />
          </span>
          {/* Vertical line break */}
          <div className="border-l border-slate-300 h-6 mx-3" />
          <div className="hidden lg:flex space-x-6">
            <Link href="/" className="text-sm font-semibold text-slate-300 hover:text-pink-300 font-space-mono tracking-wide">
              HOME
            </Link>
            <Link href="/marketplace" className="text-sm font-semibold text-slate-300 hover:text-pink-300 font-space-mono tracking-wide">
              MARKETPLACE
            </Link>
            <Link href="/mint" className="text-sm font-semibold text-slate-300 hover:text-pink-300 font-space-mono tracking-wide">
              MINT
            </Link>
            <Link href="/profile" className="text-sm font-semibold text-slate-300 hover:text-pink-300 font-space-mono tracking-wide">
              PROFILE
            </Link>
          </div>
        </div>

        {/* Middle (Search bar) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <input
            type="text"
            placeholder="Search NFTs..."
            className="w-80 bg-transparent border border-zinc-900 text-slate-300 rounded-md py-2 px-4 font-space-mono focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Right Side (Wallet and Trade buttons) */}
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <>
              <Link
                href="/trade"
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-sky-200 shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black font-space-mono tracking-wide"
              >
                TRADE NFT
              </Link>
              <button
                type="button"
                className="relative rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-pink-400 shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black font-space-mono tracking-wide"
                onClick={toggleDropdown}
              >
                {truncateAddress(userAddress)}
                <svg
                  className="w-2.5 h-2.5 ms-3 inline"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-zinc-900 divide-y divide-gray-100 rounded-lg shadow z-10 dark:bg-zinc-900 dark:divide-gray-600">
                    <ul className="py-2 text-sm text-gray-700 dark:text-slate-300">
                      <li>
                        <Link href="/leaderboard" className="block px-4 py-2 hover:bg-zinc-950 dark:hover:bg-zinc-950 dark:hover:text-white">
                          LEADERBOARD
                        </Link>
                      </li>
                      <li>
                        <Link href="/settings" className="block px-4 py-2 hover:bg-zinc-950 dark:hover:bg-zinc-950 dark:hover:text-white">
                          <LinkPreview url="https://sepolia.etherscan.io/address/0x5c0Eeb32043e0F42Ea0C0e15A32cE1d34db564E9">
                            TRANSACTIONS
                          </LinkPreview>
                        </Link>
                      </li>
                      <li>
                        <Link href="/discussion" className="block px-4 py-2 hover:bg-zinc-950 dark:hover:bg-zinc-950 dark:hover:text-white">
                          DISCUSSIONS
                        </Link>
                      </li>
                    </ul>
                    <div className="py-2">
                      <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-zinc-950 dark:hover:bg-zinc-950 dark:text-gray-200 dark:hover:text-white">
                        Separated link
                      </Link>
                    </div>
                  </div>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={connectWallet}
              className="rounded-md bg-sky-200 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-sky-400/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black font-space-mono tracking-wide"
            >
              CONNECT WALLET
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
