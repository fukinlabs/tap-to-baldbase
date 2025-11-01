"use client";

import Link from "next/link";
import ConnectButton from "../components/ConnectButton";
import GameButton from "../components/GameButton";


import { useAccount, useWriteContract } from "wagmi"; 
// import { parseEther } from "viem";

export default function Home() {
   const { address, isConnected } = useAccount();
    // 👇 สมมติคุณมี Contract ABI และ Address
  const nftAddress = "0x0f898954922dF5f81B9607015706eC8935a449a1";
  const nftAbi = [
    {
      name: "publicMint",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [],
      outputs: [
        { internalType: "uint256", name: "", type: "uint256" }
      ],
    },
  ] as const;

    const { writeContract, isPending } = useWriteContract();
const handleMint = async () => {
    try {
      await writeContract({
        address: nftAddress,
        abi: nftAbi,
        functionName: "publicMint",
        args: [],
      });
    } catch (err) {
      console.error("Mint error:", err);
    }
  };
   
  return (
   <div className="font-sans grid grid-rows-[auto_1fr_20px] min-h-screen bg-gradient-to-br from-sky-100 to-purple-100">
  {/* Navbar */}
  <header className="w-full flex justify-between items-center p-4">
    <Link href="/slap">
      <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all hover:from-blue-600 hover:to-purple-700">
        🎮 เล่นเกม
      </button>
    </Link>
    <ConnectButton />
  </header>

  {/* Main */}
  <main className="flex flex-col gap-8 row-start-2 items-center justify-center p-8 sm:p-20">
    <div className="text-center space-y-4">
      <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        👋 Tap to GM
      </h1>
      <p className="text-lg text-gray-600 mb-8">เกมตบหัวโล้นสนุกๆ พร้อม Mint NFT</p>
    </div>

    {/* ปุ่มเล่นเกมหลัก - ใหญ่และเด่นชัด - รองรับ Farcaster Mini App */}
    <GameButton />

    <div className="flex flex-col sm:flex-row gap-4 items-center">
      {isConnected && (
        <>
          <button
            onClick={handleMint}
            disabled={isPending}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 hover:from-green-600 hover:to-emerald-700"
          >
            {isPending ? "กำลัง Mint..." : "Mint NFT 🎨"}
          </button>
          <p className="text-gray-600 text-sm bg-white/80 px-4 py-2 rounded-lg">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </>
      )}
    </div>

    {/* ... เนื้อหาอื่น ๆ ของคุณ ... */}
  </main>

  {/* Footer */}
  <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center p-4 bg-white/50 backdrop-blur-sm">
    <Link href="/slap">
      <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all hover:from-blue-600 hover:to-purple-700">
        🎮 เล่นเกมตบหัวโล้น
      </button>
    </Link>
  </footer>
</div>
  );
}
