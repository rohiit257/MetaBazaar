import Image from "next/image";
import GetIpfsUrlFromPinata from "@/app/utils";
import Link from "next/link";
import { Coins, Hash, ArrowRight } from "lucide-react";

export default function NFTCard({ item }) {
  const IPFSUrl = GetIpfsUrlFromPinata(item.image);

  const limitedDescription =
    item.description.length > 100
      ? item.description.substring(0, 100) + "..."
      : item.description;

  return (
    <Link href={`/nft/${item.tokenId}`} className="group block w-[300px] rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 hover:border-pink-500/50 hover:bg-zinc-900/80 transition-all duration-300 shadow-lg hover:shadow-pink-500/20">
      <div className="relative overflow-hidden rounded-t-xl">
        <Image
          src={IPFSUrl}
          alt={item.name}
          width={300}
          height={200}
          className="h-[200px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ArrowRight className="w-6 h-6 text-pink-400" />
        </div>
      </div>
      <div className="p-4">
        <h1 className="text-lg font-bold uppercase text-slate-200 font-space-mono tracking-wider">{item.name}</h1>
        <p className="mt-3 text-sm text-slate-400 font-space-mono line-clamp-2">{limitedDescription}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <Coins className="w-3 h-3" />
              <span>Price</span>
            </div>
            <span className="text-lg font-bold text-pink-400">{item.price} ETH</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <Hash className="w-3 h-3" />
              <span>Token ID</span>
            </div>
            <span className="text-sm font-semibold text-slate-300">#{item.tokenId}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
