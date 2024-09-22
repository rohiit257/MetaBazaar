'use client'
import Image from "next/image";
import GetIpfsUrlFromPinata from "@/app/utils";
import Link from "next/link";

export default function NFTTable({ items }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-2 py-4 font-space-mono"> {/* Adjusted left-right padding */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-lg font-semibold">NFT Collection</h2>
          <p className="mt-1 text-sm text-gray-700">
            Browse and explore the listed NFTs. Click on an NFT to see more details or make a purchase.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col">
        <div className="-mx-2 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"> {/* Reduced left-right margins */}
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-black md:rounded-lg">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-950">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Collections</th>
                    <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Name</th>
                    <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Description</th>
                    <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Price (ETH)</th>
                    <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Token ID</th>
                    <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className=" divide-zinc-800 bg-zinc-950">
                  {items.map((item) => (
                    <tr key={item.tokenId}>
                      {/* Image column */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="relative group">
                          <Image
                            src={GetIpfsUrlFromPinata(item.image)}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="h-[80px] w-[80px] object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-125" // Added zoom effect on hover
                          />
                        </div>
                      </td>

                      {/* Name column */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <Link href={`/nft/${item.tokenId}`}>
                          <span className="text-sm font-semibold text-slate-300 hover:text-pink-400 cursor-pointer">
                            {item.name}
                          </span>
                        </Link>
                      </td>

                      {/* Description column */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <p className="text-sm text-slate-300">
                          {item.description.length > 50
                            ? item.description.substring(0, 50) + "..."
                            : item.description}
                        </p>
                      </td>

                      {/* Price column */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm font-semibold text-green-400">{item.price} ETH</span>
                      </td>

                      {/* Token ID column */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-300">
                        #{item.tokenId}
                      </td>

                      {/* Actions column */}
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                        <Link href={`/nft/${item.tokenId}`}>
                          <span className="text-pink-400 hover:text-slate-300">View</span>
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
    </section>
  );
}
