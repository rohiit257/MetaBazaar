import Image from "next/image";
import GetIpfsUrlFromPinata from "@/app/utils";
import Link from "next/link";

export default function NFTTable({ items }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-4">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-lg font-semibold">NFT Collection</h2>
          <p className="mt-1 text-sm text-gray-700">
            Browse and explore the listed NFTs. Click on an NFT to see more details or make a purchase.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-700">Image</th>
                    <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-700">Name</th>
                    <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-700">Description</th>
                    <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-700">Price (ETH)</th>
                    <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-700">Token ID</th>
                    <th className="px-4 py-3.5 text-left text-sm font-normal text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {items.map((item) => (
                    <tr key={item.tokenId}>
                      {/* Image column */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <Image
                          src={GetIpfsUrlFromPinata(item.image)}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-[80px] w-[80px] object-cover rounded-md"
                        />
                      </td>

                      {/* Name column */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <Link href={`/nft/${item.tokenId}`}>
                          <span className="text-sm font-semibold text-gray-900 hover:text-sky-600 cursor-pointer">
                            {item.name}
                          </span>
                        </Link>
                      </td>

                      {/* Description column */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <p className="text-sm text-gray-700">
                          {item.description.length > 50
                            ? item.description.substring(0, 50) + "..."
                            : item.description}
                        </p>
                      </td>

                      {/* Price column */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900">{item.price} ETH</span>
                      </td>

                      {/* Token ID column */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                        #{item.tokenId}
                      </td>

                      {/* Actions column */}
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                        <Link href={`/nft/${item.tokenId}`}>
                          <span className="text-sky-600 hover:text-sky-800">View</span>
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
