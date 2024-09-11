"use client";

import { useContext } from "react";
import Link from "next/link";
import { WalletContext } from "@/context/wallet";
import { BrowserProvider } from "ethers";
import MINT from "../mint/page";
import { FlipWords } from "./ui/flip-words";

const Navbar = ({ className }) => {
  const {
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
    signer,
    setSigner,
  } = useContext(WalletContext);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please Install MetaMask To Continue");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);
      const accounts = await provider.send("eth_requestAccounts", []);
      setIsConnected(true);
      setUserAddress(accounts[0]);
      const network = await provider.getNetwork();
      const chainID = network.chainId;
      const sepoliaNetworkId = "11155111"; // Corrected to be a number

      if (chainID != sepoliaNetworkId) {
        alert("Switch to Sepolia network to continue");
      }
    } catch (error) {
      console.log("Connection error", error);
    }
  };

  // Function to truncate wallet address
  const truncateAddress = (address) => {
    return address ? `${address.slice(0, 8)}...` : "";
  };

  return (
    <div
      className={`sticky top-0 z-50 w-full bg-black shadow-md ${className} border-b border-zinc-800`}
    >
      <div className="mt-3 mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div className="inline-flex items-center space-x-2">
          <span>
          </span>
          <span className="text-lg font-bold text-slate-300 font-space-mono tracking-wide">
            <FlipWords words={["METABAZAAR","METABAZAAR"]} duration={1} />
          </span>
        </div>
        <div className="hidden lg:block">
          <ul className="inline-flex space-x-8">
          <li>
              <Link
                href="/"
                className="text-base font-semibold text-sky-200 hover:text-sky-300 font-space-mono tracking-wide"
              >
                HOME
              </Link>
            </li>
            <li>
              <Link
                href="/marketplace"
                className="text-base font-semibold text-sky-200 hover:text-sky-300 font-space-mono tracking-wide"
              >
                MARKETPLACE
              </Link>
            </li>
            <li>
              <Link
                href=".\mint"
                className="text-base font-semibold text-pink-400 hover:text-sky-300 font-space-mono tracking-wide"
              >
                MINT
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className="text-base font-semibold text-slate-300 hover:text-pink-400 font-space-mono tracking-wide"
              >
                PROFILE
              </Link>
            </li>
          </ul>
        </div>
        <div className="hidden lg:block">
          {isConnected ? (
            <button
              type="button"
              className="rounded-md bg-zinc-900 px-3 mb-2 py-2 text-sm font-semibold text-pink-400 shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black font-space-mono tracking-wide "
            >
              {truncateAddress(userAddress)}
            </button>
          ) : (
            <button
              type="button"
              onClick={connectWallet}
              className="rounded-md bg-sky-200 px-3 mb-2 py-2 text-sm font-semibold text-black shadow-sm hover:bg-sky-400/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black font-space-mono tracking-wide"
            >
              CONNECT WALLET
            </button>
          )}
        </div>
        <div className="lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 cursor-pointer"
          >
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
