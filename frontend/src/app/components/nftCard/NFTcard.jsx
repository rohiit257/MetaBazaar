import Image from "next/image";
import GetIpfsUrlFromPinata from "@/app/utils";
import Link from "next/link";

export default function NFTCard({ item }) {
  const IPFSUrl = GetIpfsUrlFromPinata(item.image);

  const limitedDescription =
    item.description.length > 100
      ? item.description.substring(0, 100) + "..."
      : item.description;

  return (
    <Link href={`/nft/${item.tokenId}`} className=" block w-[300px] rounded-md bg-zinc-900 border-zinc-900 hover:bg-zinc-800 transition-colors">
      <div className="relative ">
        <Image
          src={IPFSUrl}
          alt={item.name}
          width={300}
          height={200}
          className="h-[200px] w-full object-cover rounded-md "
        />
      </div>
      <div className="p-4">
        <h1 className="text-lg font-semibold uppercase text-slate-300 font-space-mono">{item.name}</h1>
        <p className="mt-3 text-sm text-slate-300 font-space-mono">{limitedDescription}</p>
        <div className="mt-4 flex items-center justify-between text-slate-300 font-space-mono">
          <span className="text-lg font-semibold">{item.price} ETH</span>
          <span className="text-sm">#{item.tokenId}</span>
        </div>
      </div>
    </Link>
  );
}
