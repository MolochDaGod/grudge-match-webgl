'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';
import React, { createContext, useContext, useMemo, ReactNode } from 'react';

// Default styles for wallet adapter UI
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletContextProviderProps {
  children: ReactNode;
}

interface WalletContextType {
  network: WalletAdapterNetwork;
  endpoint: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletContextProvider');
  }
  return context;
};

export default function WalletContextProvider({ children }: WalletContextProviderProps) {
  // Use devnet for development, can be configured via environment variables
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }
    return clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Add more wallets here if needed
    ],
    []
  );

  const contextValue = useMemo(() => ({
    network,
    endpoint,
  }), [network, endpoint]);

  return (
    <WalletContext.Provider value={contextValue}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </WalletContext.Provider>
  );
}