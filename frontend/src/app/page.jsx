import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <div className="m-8 p-8">
        {/* <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <h2 className="text-white text-4xl font-bold font-space-mono">Welcome To MetaBazzaar  </h2>
        </div> */}
      
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/564x/73/b1/06/73b106de5a3c7db0246f0fecf93df0d3.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/564x/98/e7/c9/98e7c937375d5569d3f709084ae2cfb0.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/564x/0d/fd/3a/0dfd3a3f609564dd060d422fabae9519.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/736x/62/aa/0d/62aa0d579ef9e51dfa23792891a9010e.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/564x/eb/1a/20/eb1a2096d174957936a79c21b31de65e.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/564x/56/74/93/5674939b7e38a04728ae3acb10958de6.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/736x/8a/56/b3/8a56b3ca88a2e7189b02429ba9711af9.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/564x/f2/61/18/f2611814ee19507aaf17d590fe2411be.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/564x/91/26/bd/9126bd1473fbc574c11e0d5ed6233e98.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/564x/c1/7d/60/c17d60d69638bfd3f7c45d8cf8d69b2e.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/564x/9f/5a/0f/9f5a0f6dd07a88cad4ce782a64d39283.jpg"
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition duration-300 hover:scale-90"
              src="https://i.pinimg.com/736x/7f/e2/47/7fe24767cb389508aa390818423d7568.jpg"
              alt=""
            />
          </div>
        </div>
      </div>
    </>
  );
}
