"use client";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/app/components/Navbar";
import { WalletContext } from "@/context/wallet";

export default function DiscussionPage() {
  const { userAddress, isConnected } = useContext(WalletContext);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState("");
  const [msg, setMsg] = useState("");

  // Fetch discussions from the server
  async function fetchDiscussions() {
    try {
      const response = await axios.get("/api/get_discuss");
      console.log(response);
      
      setDiscussions(response.data);
    } catch (error) {
      console.error("Error fetching discussions:", error);
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

    try {
      await axios.post("/api/post_discuss", {
        author: userAddress,
        content: newDiscussion,
      });
      setNewDiscussion(""); // Clear the discussion input
      setMsg("Discussion submitted successfully!");
      fetchDiscussions(); // Refresh the discussions list
    } catch (error) {
      setMsg("Error submitting discussion.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen font-space-mono bg-zinc-950">
      <Navbar />
      <div className="flex-1 p-4 md:p-8">
        {isConnected ? (
          <div className="container mx-auto flex flex-col p-7">
            <h1 className="text-3xl font-semibold text-slate-300">Discussions</h1>

            {/* Discussion Form */}
            <div className="mt-8">
              <form onSubmit={submitDiscussion} className="flex flex-col">
                <textarea
                  className="p-2 border border-zinc-800 rounded-md text-slate-300 bg-black"
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  placeholder="Write your discussion here"
                  required
                />
                <button
                  type="submit"
                  className="mt-4 rounded-md bg-sky-300 px-4 py-2 text-black font-semibold shadow-sm hover:bg-sky-400"
                >
                  Submit Discussion
                </button>
              </form>
              {msg && <p className="mt-4 text-green-400">{msg}</p>}
            </div>

            {/* Discussions List */}
            <div className="mt-8">
              {discussions.length > 0 ? (
                discussions.map((d, index) => (
                  <div key={index} className="mt-4 border-t border-zinc-800 pt-4">
                    <div className="flex justify-between text-gray-500 text-sm">
                      <p>{d.author}</p>
                      <p>{new Date(d.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-slate-300 mt-2">{d.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No discussions yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-300">
            You are not connected...
          </div>
        )}
      </div>
    </div>
  );
}
