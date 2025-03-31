'use client'
import Image from "next/image";
import GetIpfsUrlFromPinata from "@/app/utils";
import Link from "next/link";
import { Coins, Hash, ArrowRight, LayoutGrid, Table2, Search, Filter } from "lucide-react";

export default function NFTTable({ items }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-2 py-4 font-space-mono">
      {/* Table Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">NFT Collection</h2>
          <p className="mt-2 text-sm text-slate-400">
            Browse and explore the listed NFTs. Click on an NFT to see more details or make a purchase.
          </p>
        </div>
      </div>

      {/* Table for Desktop */}
      <div className="mt-6 hidden md:block">
        <div className="-mx-2 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-zinc-800/50 rounded-xl bg-zinc-900/50 backdrop-blur-sm shadow-lg">
              <table className="min-w-full divide-y divide-zinc-800/50">
                <thead className="bg-zinc-900/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">Collections</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">Price (ETH)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">Token ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {items.map((item) => (
                    <tr key={item.tokenId} className="hover:bg-zinc-900/80 transition-colors duration-200">
                      {/* Image column */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="relative group">
                          <Image
                            src={GetIpfsUrlFromPinata(item.image)}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="h-[80px] w-[80px] object-cover rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pink-500/20"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ArrowRight className="w-5 h-5 text-pink-400" />
                          </div>
                        </div>
                      </td>

                      {/* Name column */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link href={`/nft/${item.tokenId}`}>
                          <span className="text-sm font-semibold text-slate-200 hover:text-pink-400 transition-colors duration-200">
                            {item.name}
                          </span>
                        </Link>
                      </td>

                      {/* Description column */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="text-sm text-slate-400 max-w-xs truncate">
                          {item.description}
                        </p>
                      </td>

                      {/* Price column */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                            <Coins className="w-3 h-3" />
                            <span>Price</span>
                          </div>
                          <span className="text-sm font-bold text-pink-400">{item.price} ETH</span>
                        </div>
                      </td>

                      {/* Token ID column */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                            <Hash className="w-3 h-3" />
                            <span>Token ID</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-300">#{item.tokenId}</span>
                        </div>
                      </td>

                      {/* Actions column */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link href={`/nft/${item.tokenId}`}>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-colors duration-200">
                            <ArrowRight className="w-4 h-4 mr-1" />
                            View Details
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Card Layout for Mobile */}
      <div className="mt-6 md:hidden">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.tokenId} className="border border-zinc-800/50 rounded-xl p-4 bg-zinc-900/50 backdrop-blur-sm shadow-lg">
              {/* Image and Name */}
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <Image
                    src={GetIpfsUrlFromPinata(item.image)}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-[80px] w-[80px] object-cover rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pink-500/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowRight className="w-5 h-5 text-pink-400" />
                  </div>
                </div>
                <div>
                  <Link href={`/nft/${item.tokenId}`}>
                    <span className="text-sm font-semibold text-slate-200 hover:text-pink-400 transition-colors duration-200">
                      {item.name}
                    </span>
                  </Link>
                  <div className="mt-1 flex items-center space-x-1">
                    <Hash className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">Token ID</span>
                    <span className="text-sm font-semibold text-slate-300">#{item.tokenId}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <p className="text-sm text-slate-400 line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Price and Actions */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <Coins className="w-3 h-3" />
                    <span>Price</span>
                  </div>
                  <span className="text-sm font-bold text-pink-400">{item.price} ETH</span>
                </div>
                <Link href={`/nft/${item.tokenId}`}>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-colors duration-200">
                    <ArrowRight className="w-4 h-4 mr-1" />
                    View Details
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}