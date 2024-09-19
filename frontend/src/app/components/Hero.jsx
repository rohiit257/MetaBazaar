"use client";
import React from "react";
import { ContainerScroll } from "../components/ui/container-scroll-animation";
import Image from "next/image";

export function HeroScrollDemo() {
  return (
    (<div className="flex flex-col overflow-hidden font-space-mono">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
            Step Into a World Where Every Pixel Matters, and Creativity is Turned into an Asset You Can Own, Trade, and Treasure Forever <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
              MetaBazaar
              </span>
            </h1>
          </>
        }>
        <Image
          src={`/nft2.png`}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false} />
      </ContainerScroll>
    </div>)
  );
}
