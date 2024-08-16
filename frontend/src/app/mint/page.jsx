"use client";

import { useRouter } from "next/navigation";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import marketplace from "./../marketplace.json";
import { ethers } from "ethers";
import { WalletContext } from "@/context/wallet";
import { useState, useContext } from "react";
import Navbar from "../components/Navbar";

export default function MINT() {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState();
  const [message, updateMessage] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [btnContent, setBtnContent] = useState("MINT NFT");
  const router = useRouter();
  const { isConnected, signer } = useContext(WalletContext);

  async function onFileChange(e) {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const data = new FormData();
      data.set("file", file);

      setBtnDisabled(true);
      updateMessage("Uploading image... Please don't click anything!");

      const response = await uploadFileToIPFS(data);
      if (response.success) {
        setBtnDisabled(false);
        updateMessage("");
        setFileURL(response.pinataURL);
      } else {
        updateMessage("Error uploading image.");
      }
    } catch (e) {
      console.error("Error during file upload:", e);
      updateMessage("Error during file upload.");
    }
  }

  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    if (!name || !description || !price || !fileURL) {
      updateMessage("Please fill all the fields!");
      return null;
    }

    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success) {
        return response.pinataURL;
      } else {
        updateMessage("Error uploading metadata.");
        return null;
      }
    } catch (e) {
      console.error("Error uploading JSON metadata:", e);
      updateMessage("Error uploading metadata.");
      return null;
    }
  }

  async function listNFT(e) {
    e.preventDefault(); // Prevent form submission

    try {
      setBtnContent("Processing...");
      const metadataURL = await uploadMetadataToIPFS();
      if (!metadataURL) return;

      updateMessage("Uploading NFT... Please don't click anything!");

      let contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );
      const price = ethers.parseEther(formParams.price);

      let transaction = await contract.createToken(metadataURL, price);
      await transaction.wait();

      setBtnContent("LIST NFT");
      setBtnDisabled(true);
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "" });
      alert("Successfully listed your NFT!");
      router.push("/marketplace");
    } catch (e) {
      alert("Upload error: " + e.message);
      console.error("Error listing NFT:", e);
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen font-space-mono">
      {/* Background Image Container */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://i.pinimg.com/564x/c0/b9/d2/c0b9d236564328481bb78901ccda6beb.jpg')`,
          backgroundRepeat: 'repeat', // Repeat the image
          backgroundSize: '500px 500px', // Adjust the size of the image
          zIndex: -1,
        }}
      ></div>
      <Navbar />
      {isConnected ? (
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div className="max-w-md w-full bg-black p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-slate-300">MINT YOUT NFT</h2>
            <form className="space-y-4" onSubmit={listNFT}>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                  NFT NAME
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 bg-black text-white border border-zinc-800 rounded-md shadow-sm focus:outline-none focus:ring-sky-300 focus:border-sky-300 sm:text-sm transition-transform hover:scale-105"
                  value={formParams.name}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                  NFT DESCRIPTION
                </label>
                <textarea
                  className="block w-full px-3 py-2 bg-black text-white border border-zinc-800 rounded-md shadow-sm focus:outline-none focus:ring-sky-300 focus:border-sky-300 sm:text-sm transition-transform hover:scale-105"
                  value={formParams.description}
                  onChange={(e) =>
                    updateFormParams({
                      ...formParams,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                  PRICE (IN ETH)
                </label>
                <input
                  type="number"
                  className="block w-full px-3 py-2 bg-black text-white border border-zinc-800 rounded-md shadow-sm focus:outline-none focus:ring-sky-300 focus:border-sky-300 sm:text-sm transition-transform hover:scale-105"
                  value={formParams.price}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                  UPLOAD IMAGE
                </label>
                <input
                  type="file"
                  className="block w-full px-3 py-2 bg-black text-white border border-zinc-800 rounded-md shadow-sm focus:outline-none focus:ring-sky-300 focus:border-sky-300 sm:text-sm transition-transform hover:scale-105"
                  onChange={onFileChange}
                />
              </div>
              <div className="text-red-500">{message}</div>
              <button
                type="submit"
                className={`w-full py-2 px-4 border rounded-md shadow-sm text-zinc-800 ${
                  btnDisabled
                    ? "bg-sky-200 cursor-not-allowed"
                    : "bg-pink-300 hover:bg-pink-400"
                }`}
                disabled={btnDisabled}
              >
                {btnContent === "Processing..." && (
                  <span className="animate-spin h-5 w-5 border-4 border-t-4  rounded-full mr-2 inline-block"></span>
                )}
                {btnContent}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div className="font-bold text-lg text-gray-700 bg-black ">
            CONNECT YOUR WALLET TO CONTINUE......
          </div>
        </div>
      )}
    </div>
  );
}
