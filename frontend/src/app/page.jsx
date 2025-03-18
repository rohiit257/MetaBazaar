import { HeroScrollDemo } from "./components/Hero";
import { CarouselDemo } from "./components/HomepageCarousel";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full font-mono overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="w-full flex flex-col items-center justify-center">
        <HeroScrollDemo />
      </div>

  
      {/* Carousel Section */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 overflow-hidden">
        <CarouselDemo />
      </div>
    </div>
  );
}