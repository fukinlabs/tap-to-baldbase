"use client";

import Image from "next/image"; 
import Link from "next/link";
import ConnectButton from "../components/ConnectButton";
import ChainSelector from "../components/ChainSelector";
 
import { useAccount, useWriteContract, useFeeData, useChainId } from "wagmi";
import { mainnet, base, baseSepolia } from 'wagmi/chains';

import { formatEther } from "viem";

export default function Home() {
   const { address, isConnected } = useAccount();
   const { data: feeData } = useFeeData();
   const chainId = useChainId();
   
   // Contract addresses for different chains
   const contractAddresses = {
     [mainnet.id]: "0x4Bc50987CFdcEfb473e61b4fED45CBF3dd1900B7" as `0x${string}`, // Ethereum mainnet
     [base.id]: "0x4Bc50987CFdcEfb473e61b4fED45CBF3dd1900B7" as `0x${string}`, // Base mainnet (same for demo)
     [baseSepolia.id]: "0x4Bc50987CFdcEfb473e61b4fED45CBF3dd1900B7" as `0x${string}`, // Base Sepolia testnet
   };
   
   const nftAddress = contractAddresses[chainId as keyof typeof contractAddresses];
  
  // Fee threshold in Gwei (adjust as needed)
  const FEE_THRESHOLD_GWEI = 20; // 20 Gwei threshold
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
    
    // Calculate current gas fee in Gwei
    const currentGasFeeGwei = feeData?.gasPrice ? Number(formatEther(feeData.gasPrice)) * 1e9 : 0;
    const isFeeTooHigh = currentGasFeeGwei > FEE_THRESHOLD_GWEI;
    const isChainSupported = nftAddress !== undefined;
    
const handleMint = async () => {
    // Check if chain is supported
    if (!isChainSupported) {
      alert(`This chain (ID: ${chainId}) is not supported for minting. Please switch to a supported chain.`);
      return;
    }
    
    // Check if fee is too high before minting
    if (isFeeTooHigh) {
      alert(`Gas fee is too high! Current: ${currentGasFeeGwei.toFixed(2)} Gwei, Threshold: ${FEE_THRESHOLD_GWEI} Gwei`);
      return;
    }
    
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
    
    {/* Chain Selector */}
    {isConnected && <ChainSelector />}
    
    {/* Gas Fee Display */}
    {isConnected && feeData && (
      <div className="mb-4 p-4 bg-gray-100 rounded-xl">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Current Gas Fee</div>
          <div className={`text-2xl font-bold ${isFeeTooHigh ? 'text-red-500' : 'text-green-500'}`}>
            {currentGasFeeGwei.toFixed(2)} Gwei
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Threshold: {FEE_THRESHOLD_GWEI} Gwei
          </div>
          {isFeeTooHigh && (
            <div className="text-red-600 text-sm mt-2 font-medium">
              ⚠️ Fee too high! Minting disabled
            </div>
          )}
          {!isChainSupported && (
            <div className="text-red-600 text-sm mt-2 font-medium">
              ⚠️ Chain not supported for minting
            </div>
          )}
        </div>
      </div>
    )}
    
  {isConnected && (
        <button
          onClick={handleMint}
          disabled={isPending || isFeeTooHigh || !isChainSupported}
          className={`px-6 py-3 font-semibold rounded-xl shadow-md transition ${
            isFeeTooHigh || !isChainSupported
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isPending ? "Minting..." : 
           isFeeTooHigh ? "Fee Too High ⚠️" : 
           !isChainSupported ? "Chain Not Supported ⚠️" : 
           "Mint NFT 🎨"}
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
