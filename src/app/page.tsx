"use client";

import Image from "next/image"; 
import Link from "next/link";
import ConnectButton from "../components/ConnectButton";


import { useAccount, useWriteContract } from "wagmi"; 
import { parseEther } from "viem";

export default function Home() {
   const { address, isConnected } = useAccount();
    // 👇 สมมติคุณมี Contract ABI และ Address
  const nftAddress = "0x4Bc50987CFdcEfb473e61b4fED45CBF3dd1900B7";
const nftAbi = [
  {
    name: "publicMint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
];

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
   <div className="font-sans grid grid-rows-[auto_1fr_20px] min-h-screen">
  {/* Navbar */}
  <header className="w-full flex justify-end p-4">
    <ConnectButton />
  </header>

  {/* Main */}
  <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start p-8 sm:p-20">
    <Image
      className="dark:invert"
      src="/next.svg"
      alt="Next.js logo"
      width={180}
      height={38}
      priority
    />

    <h1 className="text-4xl mb-6">👋 Tap to GM</h1>
  {isConnected && (
        <button
          onClick={handleMint}
          disabled={isPending}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition"
        >
          {isPending ? "Minting..." : "Mint NFT 🎨"}
        </button>
      )}

 {isConnected && (
        <p className="text-gray-600 text-sm">Connected: {address}</p>
      )}

    <Link href="/slap">
      <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-2xl shadow-md hover:bg-blue-600 transition">
        เล่นเกมตบหัวโล้น 🎮
      </button>
    </Link>

    {/* ... เนื้อหาอื่น ๆ ของคุณ ... */}
  </main>

  {/* Footer */}
  <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center p-4">
    {/* ลิงก์ต่าง ๆ */}
  </footer>
</div>
  );
}
