"use client";

import { useRouter } from "next/navigation";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import marketplace from "./../marketplace.json";
import { ethers } from "ethers";
import { WalletContext } from "@/context/wallet";
import { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus, Wand2, Upload, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
});

export default function MINT() {
  const [fileURL, setFileURL] = useState();
  const [message, updateMessage] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [btnContent, setBtnContent] = useState("MINT NFT");
  const router = useRouter();
  const { isConnected, signer } = useContext(WalletContext);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
    },
  });

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

  async function uploadMetadataToIPFS(values) {
    const { name, description, price } = values;
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

  async function listNFT(values) {
    try {
      setBtnContent("Processing...");
      const metadataURL = await uploadMetadataToIPFS(values);
      if (!metadataURL) return;

      updateMessage("Uploading NFT... Please don't click anything!");

      let contract = new ethers.Contract(
        marketplace.address.trim(),
        marketplace.abi,
        signer
      );
      const price = ethers.parseEther(values.price);

      let transaction = await contract.createToken(metadataURL, price);
      await transaction.wait();

      setBtnContent("LIST NFT");
      setBtnDisabled(true);
      updateMessage("");
      form.reset();
      toast.success("Successfully listed your NFT!");
      router.push("/profile");
    } catch (e) {
      toast.error("Upload error: " + e.message);
      console.error("Error listing NFT:", e);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      <Navbar />
      
      {isConnected ? (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-200 mb-2">Create Your NFT</h1>
              <p className="text-slate-400">Choose your preferred minting method below</p>
            </div>

            <Tabs defaultValue="mint" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="mint" className="flex items-center space-x-2">
                  <ImagePlus className="w-4 h-4" />
                  <span>Regular Mint</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center space-x-2">
                  <Wand2 className="w-4 h-4" />
                  <span>AI Mint</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mint">
                <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-200">Mint Your NFT</CardTitle>
                    <CardDescription className="text-slate-400">
                      Upload your artwork and fill in the details to create your NFT
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(listNFT)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">NFT Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter NFT name" 
                                  className="bg-zinc-800 border-zinc-700 text-slate-200"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your NFT" 
                                  className="bg-zinc-800 border-zinc-700 text-slate-200 min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Price (ETH)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter price in ETH" 
                                  className="bg-zinc-800 border-zinc-700 text-slate-200"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-2">
                          <Label className="text-slate-200">Upload Image</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              onChange={onFileChange}
                              className="bg-zinc-800 border-zinc-700 text-slate-200"
                            />
                            <Upload className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>

                        {message && (
                          <div className="text-sm text-red-400">{message}</div>
                        )}

                        <Button 
                          type="submit" 
                          disabled={btnDisabled}
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                        >
                          {btnContent === "Processing..." ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ImagePlus className="w-4 h-4 mr-2" />
                              Mint NFT
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai">
                <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-200">AI-Powered NFT Creation</CardTitle>
                    <CardDescription className="text-slate-400">
                      Generate unique NFTs using artificial intelligence
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Wand2 className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-200 mb-2">Coming Soon</h3>
                      <p className="text-slate-400 mb-6">
                        Our AI-powered NFT creation feature is currently under development.
                        Stay tuned for updates!
                      </p>
                      <Button 
                        variant="outline" 
                        className="text-slate-200 border-zinc-700 hover:bg-zinc-800"
                        disabled
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Notify Me
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl text-slate-200">Connect Your Wallet</CardTitle>
              <CardDescription className="text-slate-400">
                Please connect your wallet to start minting NFTs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
