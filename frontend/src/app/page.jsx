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
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full">
        <div className="relative w-full flex flex-col items-center justify-center">
          <HeroScrollDemo />
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 flex items-center space-x-6 transition-all duration-300 hover:border-pink-500/30 hover:bg-zinc-900/40">
            <div className="p-4 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
              <Users className="w-7 h-7 text-pink-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-200">10K+</h3>
              <p className="text-sm text-slate-400 mt-1">Active Users</p>
            </div>
          </div>
          <div className="group bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 flex items-center space-x-6 transition-all duration-300 hover:border-sky-500/30 hover:bg-zinc-900/40">
            <div className="p-4 bg-sky-500/10 rounded-xl group-hover:bg-sky-500/20 transition-colors">
              <Coins className="w-7 h-7 text-sky-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-200">500+</h3>
              <p className="text-sm text-slate-400 mt-1">NFTs Listed</p>
            </div>
          </div>
          <div className="group bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 flex items-center space-x-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-zinc-900/40">
            <div className="p-4 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-200">100+</h3>
              <p className="text-sm text-slate-400 mt-1">Daily Trades</p>
            </div>
          </div>
          <div className="group bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 flex items-center space-x-6 transition-all duration-300 hover:border-purple-500/30 hover:bg-zinc-900/40">
            <div className="p-4 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
              <ImagePlus className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-200">50+</h3>
              <p className="text-sm text-slate-400 mt-1">Artists</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured NFTs Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-200">Featured NFTs</h2>
          </div>
          <Link 
            href="/marketplace" 
            className="group flex items-center space-x-2 text-pink-400 hover:text-pink-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="w-full overflow-hidden">
          <CarouselDemo />
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-200 mb-4">Why Choose MetaBazaar</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Experience the future of digital art trading with our secure, transparent, and user-friendly platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 transition-all duration-300 hover:border-pink-500/30 hover:bg-zinc-900/40">
            <div className="p-4 bg-pink-500/10 rounded-xl w-fit mb-6 group-hover:bg-pink-500/20 transition-colors">
              <Star className="w-7 h-7 text-pink-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-200 mb-3">Curated Collection</h3>
            <p className="text-slate-400 text-lg">Carefully selected NFTs from talented artists worldwide.</p>
          </div>
          <div className="group bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 transition-all duration-300 hover:border-sky-500/30 hover:bg-zinc-900/40">
            <div className="p-4 bg-sky-500/10 rounded-xl w-fit mb-6 group-hover:bg-sky-500/20 transition-colors">
              <Award className="w-7 h-7 text-sky-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-200 mb-3">Verified Artists</h3>
            <p className="text-slate-400 text-lg">All artists are verified to ensure authenticity and quality.</p>
          </div>
          <div className="group bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 transition-all duration-300 hover:border-emerald-500/30 hover:bg-zinc-900/40">
            <div className="p-4 bg-emerald-500/10 rounded-xl w-fit mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <Zap className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-200 mb-3">Fast Transactions</h3>
            <p className="text-slate-400 text-lg">Quick and secure transactions powered by blockchain technology.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-12 md:p-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-2xl">
              <h2 className="text-4xl font-bold text-slate-200 mb-6">Ready to Start Your NFT Journey?</h2>
              <p className="text-slate-400 text-lg">
                Join thousands of artists and collectors in the world's most vibrant NFT marketplace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/mint"
                className="group flex items-center justify-center space-x-2 px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="font-medium">Mint NFT</span>
              </Link>
              <Link
                href="/marketplace"
                className="group flex items-center justify-center space-x-2 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-slate-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-zinc-800/20"
              >
                <ArrowUpRight className="w-5 h-5" />
                <span className="font-medium">Explore Market</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}