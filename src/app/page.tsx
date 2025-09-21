"use client";

import Image from "next/image"; 
import Link from "next/link";
import ConnectButton from "../components/ConnectButton";

import { useAccount, useNetwork, useSwitchNetwork, usePrepareContractWrite, useContractWrite } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const nftAddress = "0x4Bc50987CFdcEfb473e61b4fED45CBF3dd1900B7";
  const nftAbi = [
    {
      name: "safeMint",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [],
      outputs: [],
    },
  ];

  // Prepare + estimate gas
  const { config } = usePrepareContractWrite({
    address: nftAddress,
    abi: nftAbi,
    functionName: "safeMint",
    args: [],
    enabled: isConnected && chain?.id === baseSepolia.id,
  });

  const { write: safeMintWrite, isLoading: isPending } = useContractWrite(config);

  const handleSafeMint = () => {
    if (!isConnected) return alert("Connect wallet first!");

    if (chain?.id !== baseSepolia.id) {
      if (switchNetwork) switchNetwork(baseSepolia.id);
      else return alert("Please switch wallet to Base Sepolia testnet!");
      return;
    }

    safeMintWrite?.();
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
            onClick={handleSafeMint}
            disabled={isPending}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition"
          >
            {isPending ? "Minting..." : "Safe Mint NFT 🎨"}
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
      </main>

      {/* Footer */}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center p-4">
      </footer>
    </div>
  );
}
