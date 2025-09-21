"use client";

import Image from "next/image"; 
import Link from "next/link";
import ConnectButton from "../components/ConnectButton";
import ChainSelector from "../components/ChainSelector";
 
import { useAccount, useWriteContract, useFeeData, useChainId, useSimulateContract, useBalance, useReadContract } from "wagmi";
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
  
  // NFT Contract ABI
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
  ] as const;
  
  // Simulate contract with automatic gas estimation
  const { data: simulationData, error: simulationError, isLoading: isSimulating } = useSimulateContract({
    address: nftAddress,
    abi: nftAbi,
    functionName: 'publicMint',
    args: [],
    query: {
      enabled: !!nftAddress && isConnected,
    },
  });
  
  // Extract gas limit from simulation (Wagmi automatically adds buffer)
  const gasLimitWithBuffer = simulationData?.request?.gas;
  
  // Check if simulation failed
  const simulationFailed = simulationError !== null;
  const simulationErrorMessage = simulationError?.message || 'Unknown simulation error';
  
  // User balance check
  const { data: userBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
    },
  });
  
  // Contract state checks (assuming common NFT contract functions)
  const { data: totalSupply } = useReadContract({
    address: nftAddress,
    abi: [
      {
        name: "totalSupply",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      },
    ],
    functionName: "totalSupply",
    query: {
      enabled: !!nftAddress && isConnected,
    },
  });
  
  const { data: maxSupply } = useReadContract({
    address: nftAddress,
    abi: [
      {
        name: "maxSupply",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      },
    ],
    functionName: "maxSupply",
    query: {
      enabled: !!nftAddress && isConnected,
    },
  });
  
  const { data: isPaused } = useReadContract({
    address: nftAddress,
    abi: [
      {
        name: "paused",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
      },
    ],
    functionName: "paused",
    query: {
      enabled: !!nftAddress && isConnected,
    },
  });
  
  const { data: mintPrice } = useReadContract({
    address: nftAddress,
    abi: [
      {
        name: "mintPrice",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      },
    ],
    functionName: "mintPrice",
    query: {
      enabled: !!nftAddress && isConnected,
    },
  });
  
  // Safe mint conditions
  const hasEnoughBalance = userBalance && mintPrice ? userBalance.value >= mintPrice : true; // Assume free mint if no price
  const isNotSoldOut = maxSupply ? (totalSupply || BigInt(0)) < maxSupply : true;
  const isNotPaused = isPaused === false;
  const contractIsHealthy = hasEnoughBalance && isNotSoldOut && isNotPaused;
  
  // Calculate estimated transaction cost
  const estimatedTxCost = feeData?.gasPrice && gasLimitWithBuffer 
    ? feeData.gasPrice * gasLimitWithBuffer 
    : undefined;
  const hasEnoughForGas = userBalance && estimatedTxCost ? userBalance.value >= estimatedTxCost : true;

    const { writeContract, isPending } = useWriteContract();
    
    // Calculate current gas fee in Gwei
    const currentGasFeeGwei = feeData?.gasPrice ? Number(formatEther(feeData.gasPrice)) * 1e9 : 0;
    const isFeeTooHigh = currentGasFeeGwei > FEE_THRESHOLD_GWEI;
    const isChainSupported = nftAddress !== undefined;
    
const handleMint = async () => {
    // SAFE MINT: Comprehensive safety checks
    
    // 1. Chain support check
    if (!isChainSupported) {
      alert(`❌ Chain Not Supported\n\nThis chain (ID: ${chainId}) is not supported for minting. Please switch to a supported chain.`);
      return;
    }
    
    // 2. Gas fee threshold check
    if (isFeeTooHigh) {
      alert(`❌ Gas Fee Too High\n\nCurrent: ${currentGasFeeGwei.toFixed(2)} Gwei\nThreshold: ${FEE_THRESHOLD_GWEI} Gwei\n\nPlease wait for lower gas fees.`);
      return;
    }
    
    // 3. Contract health checks
    if (!contractIsHealthy) {
      let errorMsg = "❌ Contract Not Ready\n\n";
      if (!hasEnoughBalance) {
        errorMsg += `• Insufficient balance for minting\n`;
      }
      if (!isNotSoldOut) {
        errorMsg += `• Collection is sold out (${totalSupply}/${maxSupply})\n`;
      }
      if (!isNotPaused) {
        errorMsg += `• Contract is paused\n`;
      }
      alert(errorMsg);
      return;
    }
    
    // 4. Gas balance check
    if (!hasEnoughForGas) {
      alert(`❌ Insufficient Gas Balance\n\nYou need at least ${estimatedTxCost ? formatEther(estimatedTxCost) : 'unknown'} ETH for gas fees.`);
      return;
    }
    
    // 5. Contract simulation check - CRITICAL: Prevent gas loss
    if (simulationFailed) {
      alert(`❌ Contract Simulation Failed!\n\nReason: ${simulationErrorMessage}\n\nThis transaction would fail and cause gas fee loss.\n\nPlease check:\n• Contract address is correct\n• You have sufficient balance\n• Contract is not paused\n• You haven't already minted`);
      return;
    }
    
    // 6. Gas limit estimation check
    if (!gasLimitWithBuffer) {
      alert('❌ Gas Limit Estimation Failed\n\nPlease try again or check your connection.');
      return;
    }
    
    // All checks passed - Safe to mint!
    try {
      // Execute the mint transaction using simulation data
      await writeContract({
        address: nftAddress,
        abi: nftAbi,
        functionName: 'publicMint',
        args: [],
        gas: gasLimitWithBuffer, // Use auto-estimated gas from simulation
      });
    } catch (err) {
      console.error("Mint error:", err);
      alert(`❌ Transaction Failed\n\n${err instanceof Error ? err.message : 'Unknown error'}\n\nPlease try again or check your wallet.`);
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
    
    {/* Safe Mint Status */}
    {isConnected && (
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-3">🛡️ Safe Mint Status</div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Contract Status */}
            <div className="text-center">
              <div className="text-gray-500 mb-1">Contract</div>
              <div className={`font-bold ${contractIsHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {contractIsHealthy ? '✅ Healthy' : '❌ Issues'}
              </div>
            </div>
            
            {/* Supply Status */}
            <div className="text-center">
              <div className="text-gray-500 mb-1">Supply</div>
              <div className={`font-bold ${isNotSoldOut ? 'text-green-600' : 'text-red-600'}`}>
                {isNotSoldOut ? '✅ Available' : '❌ Sold Out'}
              </div>
            </div>
            
            {/* Balance Status */}
            <div className="text-center">
              <div className="text-gray-500 mb-1">Balance</div>
              <div className={`font-bold ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                {hasEnoughBalance ? '✅ Sufficient' : '❌ Low'}
              </div>
            </div>
            
            {/* Gas Status */}
            <div className="text-center">
              <div className="text-gray-500 mb-1">Gas</div>
              <div className={`font-bold ${hasEnoughForGas ? 'text-green-600' : 'text-red-600'}`}>
                {hasEnoughForGas ? '✅ Ready' : '❌ Low'}
              </div>
            </div>
          </div>
          
          {/* Supply Info */}
          {totalSupply !== undefined && maxSupply && (
            <div className="mt-3 text-xs text-gray-600">
              Minted: {totalSupply.toString()} / {maxSupply.toString()}
            </div>
          )}
          
          {/* Mint Price */}
          {mintPrice && mintPrice > BigInt(0) && (
            <div className="mt-2 text-xs text-gray-600">
              Price: {formatEther(mintPrice)} ETH
            </div>
          )}
        </div>
      </div>
    )}
    
    {/* Gas Information Display */}
    {isConnected && feeData && (
      <div className="mb-4 p-4 bg-gray-100 rounded-xl">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Gas Information</div>
          
          {/* Gas Price */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Gas Price</div>
            <div className={`text-xl font-bold ${isFeeTooHigh ? 'text-red-500' : 'text-green-500'}`}>
              {currentGasFeeGwei.toFixed(2)} Gwei
            </div>
            <div className="text-xs text-gray-500">
              Threshold: {FEE_THRESHOLD_GWEI} Gwei
            </div>
          </div>
          
          {/* Gas Limit */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Gas Limit</div>
            {isSimulating ? (
              <div className="text-lg font-bold text-blue-500">Simulating...</div>
            ) : simulationFailed ? (
              <div className="text-lg font-bold text-red-500">Simulation Failed</div>
            ) : gasLimitWithBuffer ? (
              <div className="text-lg font-bold text-green-500">
                {gasLimitWithBuffer.toString()} 
                <span className="text-xs text-gray-500 ml-1">(auto-estimated)</span>
              </div>
            ) : (
              <div className="text-lg font-bold text-red-500">Failed to estimate</div>
            )}
          </div>
          
          {/* Contract Simulation Status */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Transaction Status</div>
            {isSimulating ? (
              <div className="text-sm font-bold text-blue-500">🔄 Simulating...</div>
            ) : simulationFailed ? (
              <div className="text-sm font-bold text-red-500">❌ Will Fail</div>
            ) : gasLimitWithBuffer ? (
              <div className="text-sm font-bold text-green-500">✅ Ready to Execute</div>
            ) : (
              <div className="text-sm font-bold text-yellow-500">⚠️ Unknown Status</div>
            )}
          </div>
          
          {/* Warnings */}
          {simulationFailed && (
            <div className="text-red-600 text-sm mt-2 font-medium p-2 bg-red-50 rounded-lg">
              <div className="font-bold">❌ Transaction Will Fail!</div>
              <div className="text-xs mt-1">Reason: {simulationErrorMessage}</div>
              <div className="text-xs mt-1">This would cause gas fee loss. Check contract status.</div>
            </div>
          )}
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
          {!gasLimitWithBuffer && !isSimulating && !simulationFailed && (
            <div className="text-red-600 text-sm mt-2 font-medium">
              ⚠️ Gas limit estimation failed
            </div>
          )}
        </div>
      </div>
    )}
    
  {isConnected && (
        <button
          onClick={handleMint}
          disabled={isPending || isFeeTooHigh || !isChainSupported || !gasLimitWithBuffer || isSimulating || simulationFailed || !contractIsHealthy || !hasEnoughForGas}
          className={`px-6 py-3 font-semibold rounded-xl shadow-md transition ${
            isFeeTooHigh || !isChainSupported || !gasLimitWithBuffer || isSimulating || simulationFailed || !contractIsHealthy || !hasEnoughForGas
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg'
          }`}
        >
          {isPending ? "🔄 Minting..." : 
           isSimulating ? "🔄 Simulating Contract..." :
           simulationFailed ? "❌ Transaction Will Fail" :
           !contractIsHealthy ? "❌ Contract Not Ready" :
           !hasEnoughForGas ? "❌ Insufficient Gas" :
           isFeeTooHigh ? "⚠️ Fee Too High" : 
           !isChainSupported ? "⚠️ Chain Not Supported" : 
           !gasLimitWithBuffer ? "⚠️ Gas Estimation Failed" :
           "🛡️ Safe Mint NFT 🎨"}
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
