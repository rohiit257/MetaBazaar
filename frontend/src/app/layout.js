import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/context/wallet";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
});

export const metadata = {
  title: "MetaBazaar",
  description:
    "MetaBazaar is a feature-rich NFT marketplace built to provide a seamless and engaging experience for NFT enthusiasts. The platform offers robust features including NFT minting, a marketplace with search functionality, and user profiles. It also integrates with MetaMask for wallet connectivity and utilizes IPFS for image storage. ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <WalletContextProvider>
        <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </body>
      </WalletContextProvider>
    </html>
  );
}
