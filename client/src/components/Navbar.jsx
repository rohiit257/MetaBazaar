"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useContext } from "react";
import { WalletContext } from "@/context/wallet"; // Import WalletContext
import { BrowserProvider } from "ethers";

function Navbar() {

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
          alert("MetaMask Wallet Connected");
          const network = await provider.getNetwork();
          const chainID = network.chainId;
          const sepoliaNetworkId = 80002;
    
          if (chainID !== sepoliaNetworkId) {
            alert("Switch to Polygon network to continue");
          }
        } catch (error) {
          console.log("Connection error", error);
        }
      };
      
    
      const truncateAddress = (address) => {
        return address ? `${address.slice(0, 8)}...` : "";
      };

   
  return (
    <div className="flex justify-between items-center p-4">
      <Menubar>
        {/* Marketplace Section */}
        <MenubarMenu>
          <MenubarTrigger>Marketplace</MenubarTrigger>
          <MenubarContent>
            <MenubarItem asChild>
              <Link href="/marketplace">Listings</Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href="/trade">Trade</Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href="/discussions">Discussions</Link>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Mint Section */}
        <MenubarMenu>
          <MenubarTrigger>Mint</MenubarTrigger>
          <MenubarContent>
            <MenubarItem asChild>
              <Link href="/mint-nft">Mint NFT</Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href="/ai-mint">AI Mint</Link>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Profile Section */}
        <MenubarMenu>
          <MenubarTrigger>Profile</MenubarTrigger>
          <MenubarContent>
            <MenubarItem asChild>
              <Link href="/portfolio">Portfolio</Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href="/leaderboards">Leaderboards</Link>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Conditional rendering based on wallet connection */}
      <div className="ml-auto">
        {isConnected ? (
          <Button>{truncateAddress(userAddress)}</Button>
        
        ) : (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
