"use client";

// Check if projectId is available
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Please add it to your .env.local file');
}
import React from 'react'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, base, baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { connectorsForWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  injectedWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
const chains = [mainnet, base, baseSepolia] as const;


const queryClient = new QueryClient(); 

// สร้าง connectors สำหรับ multi-wallet (exclude Coinbase Wallet to avoid telemetry inline script)
const supportedWallets = [
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet,
      rainbowWallet,
      injectedWallet,
      walletConnectWallet,
    ],
  },
];

const connectors = connectorsForWallets(supportedWallets, {
  appName: 'Tap to Baldbase',
  projectId: projectId || 'fallback-project-id',
});

// สร้าง Wagmi config
const config = createConfig({
  connectors,
  chains,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});


// const config = createConfig({
//   chains: [mainnet, base, baseSepolia],
//   transports: {
//     [mainnet.id]: http('https://cloudflare-eth.com'),
//     [base.id]: http('https://mainnet.base.org'),
//     [baseSepolia.id]: http('https://sepolia.base.org'),
//   },
//   connectors: [injected()],
// });


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* ✅ ใส่ RainbowKitProvider ครอบ */}
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}