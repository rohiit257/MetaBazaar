import { HeroScrollDemo } from "./components/Hero";
import { CarouselDemo } from "./components/HomepageCarousel";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full font-mono">
      <Navbar />

      <div className="w-full flex  flex-col items-center justify-center">
        <HeroScrollDemo />
      </div>

      {/* Trending NFTs Section */}
      <div className="w-full text-center mt-16 mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
          Trending NFTs
        </h1>
      </div>

      <div className="w-full flex justify-center">
        <CarouselDemo />
      </div>
    </div>
  );
}
