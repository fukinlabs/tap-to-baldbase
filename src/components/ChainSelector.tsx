"use client";

import React from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { mainnet, base, baseSepolia } from 'wagmi/chains';

const chains = [
  { id: mainnet.id, name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' },
  { id: base.id, name: 'Base', symbol: 'ETH', color: 'bg-blue-600' },
  { id: baseSepolia.id, name: 'Base Sepolia', symbol: 'ETH', color: 'bg-purple-500' },
];

export default function ChainSelector() {
  const { isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const chainId = useChainId();

  if (!isConnected) {
    return null;
  }

  const currentChain = chains.find(chain => chain.id === chainId);

  const handleChainSwitch = (targetChainId: number) => {
    if (targetChainId !== chainId) {
      switchChain({ chainId: targetChainId });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">Current Network</div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${currentChain?.color || 'bg-gray-400'}`}></div>
          <span className="font-semibold text-lg">
            {currentChain?.name || 'Unknown Network'}
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {chains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => handleChainSwitch(chain.id)}
            disabled={isPending || chain.id === chainId}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              chain.id === chainId
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : isPending
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : `${chain.color} text-white hover:opacity-80 active:scale-95`
            }`}
          >
            {isPending && chain.id !== chainId ? 'Switching...' : chain.name}
          </button>
        ))}
      </div>
    </div>
  );
}
