import React from 'react';
import Navbar from '../components/Navbar';
import { FlipWords } from '../components/ui/flip-words';

function Page() {
  return (
    <>
      <Navbar />
      <div className="relative w-full bg-zinc-950 font-space-mono overflow-hidden">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
          <div className="flex flex-col justify-center px-4 py-12 md:py-16 lg:col-span-7 lg:gap-x-6 lg:px-6 lg:py-24 xl:col-span-6">
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-300 md:text-4xl lg:text-6xl">
              Trade with Users Around the Globe <FlipWords words={['Fast', 'Seamless']} />
            </h1>
            <p className="mt-8 text-lg text-gray-700">
              Trade your NFTs with ease. Enter the details below to start trading.
            </p>
            <form action="" className="mt-8 flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="userId" className="text-sm font-medium text-gray-700">User ID</label>
                <input
                  className="flex w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  type="text"
                  placeholder="Enter your user ID"
                  id="userId"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="nftTokenId" className="text-sm font-medium text-gray-700">NFT Token ID</label>
                <input
                  className="flex w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  type="text"
                  placeholder="Enter NFT token ID"
                  id="nftTokenId"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="rounded-md bg-pink-400 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Trade NFT
                </button>
              </div>
            </form>
          </div>

          <div className="relative lg:col-span-5 lg:-mr-8 xl:col-span-6">
            <img
              className="m-9aspect-[3/2] bg-gray-50 object-cover lg:aspect-[4/3] lg:h-[700px] xl:aspect-[16/9] w-full h-auto"
              src="https://plus.unsplash.com/premium_photo-1679079456783-5d862f755557?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjQ3fHxtYW4lMjB3aXRoJTIwbGFwdG9wfGVufDB8fDB8fA%3D%3D&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=60"
              alt="NFT Trading"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
