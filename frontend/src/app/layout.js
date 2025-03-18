import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/context/wallet";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MetaBazaar",
  description:
    "MetaBazaar is a feature-rich NFT marketplace built to provide a seamless and engaging experience for NFT enthusiasts. The platform offers robust features including NFT minting, a marketplace with search functionality, and user profiles. It also integrates with MetaMask for wallet connectivity and utilizes IPFS for image storage. ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <WalletContextProvider>
        <body className={inter.className}>
          {children}
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </body>
      </WalletContextProvider>
    </html>
  );
}
