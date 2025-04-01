import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Zap, Clock, Award, ChevronRight } from "lucide-react"
import FeaturedNFTs from "../app/components/featured-nfts"
import HeroSection from "../app/components/hero-section"
import TrendingCollections from "../app/components/trending-collections"
import TopCreators from "../app/components/top-creators"
import NewDropsCarousel from "../app/components/new-drops-carousel"
import Navbar from "./components/Navbar"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-mono">
      <Navbar/>
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <NewDropsCarousel />
          <HeroSection />

          <section className="py-12 md:py-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Featured NFTs</h2>
                <p className="text-zinc-400 mt-1">Discover the most sought-after digital collectibles</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="bg-zinc-900">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="art">Art</TabsTrigger>
                    <TabsTrigger value="collectibles">Collectibles</TabsTrigger>
                    <TabsTrigger value="music">Music</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <FeaturedNFTs />
          </section>

          <section className="bg-zinc-900/50 py-12 md:py-24">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Trending Collections</h2>
                <p className="text-zinc-400 mt-1">The hottest collections over the last 24 hours</p>
              </div>
              <Button
                variant="outline"
                className="hidden sm:flex gap-2 border-pink-400 text-pink-400 hover:bg-pink-400/10"
              >
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <TrendingCollections />
          </section>

          <section className="py-12 md:py-24">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Top Creators</h2>
                <p className="text-zinc-400 mt-1">The leading artists and creators in the NFT space</p>
              </div>
              <Button
                variant="outline"
                className="hidden sm:flex gap-2 border-pink-400 text-pink-400 hover:bg-pink-400/10"
              >
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <TopCreators />
          </section>

          <section className="bg-zinc-900/50 py-12 md:py-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why Choose Our Platform?</h2>
              <p className="text-zinc-400 text-lg">
                The most trusted decentralized marketplace for NFTs with cutting-edge features
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-700">
                <div className="size-12 rounded-lg bg-pink-400/10 flex items-center justify-center mb-4">
                  <Zap className="size-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-zinc-400">Transactions are processed instantly with minimal gas fees</p>
              </div>
              <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-700">
                <div className="size-12 rounded-lg bg-pink-400/10 flex items-center justify-center mb-4">
                  <TrendingUp className="size-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Market Insights</h3>
                <p className="text-zinc-400">Advanced analytics to help you make informed decisions</p>
              </div>
              <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-700">
                <div className="size-12 rounded-lg bg-pink-400/10 flex items-center justify-center mb-4">
                  <Clock className="size-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Trading</h3>
                <p className="text-zinc-400">Our decentralized platform never sleeps, trade anytime</p>
              </div>
              <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-700">
                <div className="size-12 rounded-lg bg-pink-400/10 flex items-center justify-center mb-4">
                  <Award className="size-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Creator Royalties</h3>
                <p className="text-zinc-400">Fair compensation for creators on secondary sales</p>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-24">
            <div className="bg-gradient-to-r from-pink-400/20 to-pink-500/5 rounded-2xl p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to start your NFT journey?</h2>
                  <p className="text-zinc-400 text-lg mb-6">
                    Join thousands of collectors and creators in the world's most vibrant NFT marketplace
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="sm:w-auto bg-pink-400 hover:bg-pink-500 text-white">
                      Get Started
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="sm:w-auto border-pink-400 text-pink-400 hover:bg-pink-400/10"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm"></div>
                  <div className="absolute inset-4 rounded-lg bg-zinc-800/50 backdrop-blur-md border border-zinc-700 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-zinc-400 mb-2">Preview your NFT collection</p>
                      <Button variant="outline" className="border-pink-400 text-pink-400 hover:bg-pink-400/10">
                        Upload Artwork
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-zinc-800 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">MetaBazaar</h3>
              <p className="text-zinc-400 mb-4">
                The premier decentralized marketplace for NFTs and digital collectibles, powered by Ethereum
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <span className="sr-only">Discord</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="12" r="1"></circle>
                    <circle cx="15" cy="12" r="1"></circle>
                    <path d="M7.5 7.5c3.5-1 5.5-1 9 0"></path>
                    <path d="M7 16.5c3.5 1 6.5 1 10 0"></path>
                    <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"></path>
                    <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.48-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Marketplace</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/marketplace" className="text-zinc-400 hover:text-white transition-colors">
                    All NFTs
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=art" className="text-zinc-400 hover:text-white transition-colors">
                    Art
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=collectibles" className="text-zinc-400 hover:text-white transition-colors">
                    Collectibles
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=music" className="text-zinc-400 hover:text-white transition-colors">
                    Music
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=photography" className="text-zinc-400 hover:text-white transition-colors">
                    Photography
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-zinc-400 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/discussion" className="text-zinc-400 hover:text-white transition-colors">
                    Discussions
                  </Link>
                </li>
                <li>
                  <Link href="/auction" className="text-zinc-400 hover:text-white transition-colors">
                    Auctions
                  </Link>
                </li>
                <li>
                  <Link href="/mint" className="text-zinc-400 hover:text-white transition-colors">
                    Mint NFT
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:rohitshahi581@gmail.com"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-zinc-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-zinc-400 hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-zinc-500">© {new Date().getFullYear()} MetaBazaar. All rights reserved.</p>
            <p className="text-sm text-zinc-500 mt-4 md:mt-0">Powered by Ethereum</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

