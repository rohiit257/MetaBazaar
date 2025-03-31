"use client";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/app/components/Navbar";
import { WalletContext } from "@/context/wallet";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send, User, Clock } from "lucide-react";

export default function DiscussionPage() {
  const { userAddress, isConnected } = useContext(WalletContext);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch discussions from the server
  async function fetchDiscussions() {
    try {
      setLoading(true);
      const response = await axios.get("/api/get_discuss");
      console.log(response);
      
      setDiscussions(response.data);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      toast.error("Failed to fetch discussions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isConnected) {
      fetchDiscussions();
    }
  }, [isConnected]);

  // Handle discussion submission
  async function submitDiscussion(e) {
    e.preventDefault();
    if (!newDiscussion.trim()) return;

    try {
      await axios.post("/api/post_discuss", {
        author: userAddress,
        content: newDiscussion,
      });
      setNewDiscussion(""); // Clear the discussion input
      setMsg("Discussion submitted successfully!");
      toast.success("Discussion submitted successfully!");
      fetchDiscussions(); // Refresh the discussions list
    } catch (error) {
      setMsg("Error submitting discussion.");
      toast.error("Failed to submit discussion");
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-200 mb-2">Community Discussions</h1>
            <p className="text-slate-400">Join the conversation with other NFT enthusiasts</p>
          </div>

          {isConnected ? (
            <div className="space-y-8">
              <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200">Start a Discussion</CardTitle>
                  <CardDescription className="text-slate-400">
                    Share your thoughts with the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitDiscussion} className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        className="bg-zinc-800 border-zinc-700 text-slate-200 min-h-[120px]"
                        value={newDiscussion}
                        onChange={(e) => setNewDiscussion(e.target.value)}
                        placeholder="Write your discussion here..."
                        required
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post Discussion
                    </Button>
                  </form>
                  {msg && (
                    <p className="mt-4 text-sm text-green-400">{msg}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200">Recent Discussions</CardTitle>
                  <CardDescription className="text-slate-400">
                    Latest conversations from the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    </div>
                  ) : discussions.length > 0 ? (
                    <div className="space-y-6">
                      {discussions.map((d, index) => (
                        <div 
                          key={index} 
                          className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <User className="w-5 h-5 text-slate-400" />
                              <span className="text-slate-200 font-medium">
                                {d.author.slice(0, 6)}...{d.author.slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center text-slate-400 text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(d.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-slate-300">{d.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                      No discussions yet. Be the first to start a conversation!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-slate-200">Connect Your Wallet</CardTitle>
                <CardDescription className="text-slate-400">
                  Please connect your wallet to participate in discussions
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
