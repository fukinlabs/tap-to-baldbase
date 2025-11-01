"use client";

import { useEffect } from "react";

export default function GameButton() {
  useEffect(() => {
    // Detect if running in Farcaster Mini App for future features
    if (typeof window !== "undefined") {
      // Check if running in Farcaster/Warpcast frame
      const isFrame = window.parent !== window;
      // @ts-expect-error - Farcaster Mini App SDK may add this
      const hasMiniAppSDK = window.farcaster !== undefined;
      
      if (isFrame || hasMiniAppSDK) {
        console.log("Running in Farcaster Mini App context");
      }
    }
  }, []);

  const handlePlayGame = () => {
    // Navigate to game - works in both web and Mini App context
    window.location.href = "/slap";
  };

  return (
    <button
      onClick={handlePlayGame}
      className="px-12 py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 animate-pulse hover:animate-none"
    >
      🎮 เล่นเกมตบหัวโล้น
    </button>
  );
}

