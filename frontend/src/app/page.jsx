"use client";

import { HeroScrollDemo } from "./components/Hero";
import { CarouselDemo } from "./components/HomepageCarousel";
import Navbar from "./components/Navbar";
import { useContext } from "react";
import { WalletContext } from "@/context/wallet";
import {
  Users,
  Coins,
  TrendingUp,
  ImagePlus,
  ArrowRight,
  Sparkles,
  Star,
  Award,
  Zap,
  ArrowUpRight,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isConnected } = useContext(WalletContext);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-transparent to-transparent" />
        <div className="relative w-full flex flex-col items-center justify-center">
          <HeroScrollDemo />
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-xl p-6 flex items-center space-x-4">
            <div className="p-3 bg-pink-500/20 rounded-lg">
              <Users className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-200">10K+</h3>
              <p className="text-sm text-slate-400">Active Users</p>
            </div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-xl p-6 flex items-center space-x-4">
            <div className="p-3 bg-sky-500/20 rounded-lg">
              <Coins className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-200">500+</h3>
              <p className="text-sm text-slate-400">NFTs Listed</p>
            </div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-xl p-6 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-200">100+</h3>
              <p className="text-sm text-slate-400">Daily Trades</p>
            </div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-xl p-6 flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <ImagePlus className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-200">50+</h3>
              <p className="text-sm text-slate-400">Artists</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured NFTs Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h2 className="text-2xl font-bold text-slate-200">Featured NFTs</h2>
          </div>
          <Link 
            href="/marketplace" 
            className="flex items-center space-x-2 text-pink-400 hover:text-pink-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="w-full overflow-hidden">
          <CarouselDemo />
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-200 mb-4">Why Choose MetaBazaar</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience the future of digital art trading with our secure, transparent, and user-friendly platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-xl p-6">
            <div className="p-3 bg-pink-500/20 rounded-lg w-fit mb-4">
              <Star className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Curated Collection</h3>
            <p className="text-slate-400">Carefully selected NFTs from talented artists worldwide.</p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-xl p-6">
            <div className="p-3 bg-sky-500/20 rounded-lg w-fit mb-4">
              <Award className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Verified Artists</h3>
            <p className="text-slate-400">All artists are verified to ensure authenticity and quality.</p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-xl p-6">
            <div className="p-3 bg-emerald-500/20 rounded-lg w-fit mb-4">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Fast Transactions</h3>
            <p className="text-slate-400">Quick and secure transactions powered by blockchain technology.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-lg border border-pink-500/20 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-200 mb-4">Ready to Start Your NFT Journey?</h2>
              <p className="text-slate-400 max-w-xl">
                Join thousands of artists and collectors in the world's most vibrant NFT marketplace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/mint"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span>Mint NFT</span>
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-slate-200 rounded-lg transition-colors"
              >
                <ArrowUpRight className="w-5 h-5" />
                <span>Explore Market</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}