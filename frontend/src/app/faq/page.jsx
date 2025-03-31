"use client"

import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  HelpCircle, 
  Wallet, 
  Coins, 
  Shield, 
  ImageIcon, 
  Users, 
  Lock, 
  ArrowRight,
  Sparkles,
  Zap,
  BarChart2
} from "lucide-react"

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-zinc-400">
              Find answers to common questions about our NFT marketplace
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-zinc-800">
              <AccordionTrigger className="text-slate-200 hover:text-pink-400">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-pink-400" />
                  How do I connect my wallet?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                To connect your wallet, click the "Connect Wallet" button in the top right corner. 
                We support MetaMask and other popular Web3 wallets. Make sure you have a wallet installed 
                and are on a supported network.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-zinc-800">
              <AccordionTrigger className="text-slate-200 hover:text-pink-400">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-400" />
                  How do I create and list an NFT?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                To create an NFT, go to the "Mint NFT" page and upload your digital artwork. 
                Fill in the details like name, description, and price. Once minted, your NFT will 
                be automatically listed on the marketplace. You can also list existing NFTs from your wallet.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-zinc-800">
              <AccordionTrigger className="text-slate-200 hover:text-pink-400">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-pink-400" />
                  What are the fees for buying and selling NFTs?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                Our marketplace charges a small listing fee and royalty fee on sales. The listing fee 
                is applied when you list an NFT for sale, and the royalty fee is taken from the final 
                sale price. These fees help maintain the platform and support our community.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-zinc-800">
              <AccordionTrigger className="text-slate-200 hover:text-pink-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-pink-400" />
                  How secure is the marketplace?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                Our marketplace is built on blockchain technology, ensuring transparency and security. 
                All transactions are verified on the blockchain, and we use industry-standard security 
                practices to protect user data and assets.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-zinc-800">
              <AccordionTrigger className="text-slate-200 hover:text-pink-400">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-400" />
                  What makes a collection verified?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                Verified collections are those that have been authenticated by our team. 
                We verify the authenticity of collections based on various factors including 
                creator reputation, collection quality, and community engagement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-zinc-800">
              <AccordionTrigger className="text-slate-200 hover:text-pink-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-pink-400" />
                  How do I protect my NFTs?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                Your NFTs are secured by your wallet's private keys. Never share your private keys 
                or seed phrase with anyone. We recommend using hardware wallets for additional security 
                and enabling two-factor authentication where available.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border-zinc-800">
              <AccordionTrigger className="text-slate-200 hover:text-pink-400">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-pink-400" />
                  How do I track my NFT's value?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                You can track your NFT's value through our marketplace's analytics tools. 
                We provide price history, trading volume, and market trends for each NFT. 
                You can also set up price alerts for your NFTs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border-zinc-800">
              <AccordionTrigger className="text-slate-200 hover:text-pink-400">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pink-400" />
                  What happens if a transaction fails?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                If a transaction fails, no funds will be transferred. The transaction will be 
                reverted on the blockchain. You can try the transaction again or contact our 
                support team for assistance.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-zinc-400 mb-4">
              Still have questions? We're here to help!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
