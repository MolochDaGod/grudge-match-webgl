import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import { AnalyticsService } from '@/shared/utils/analytics';

export function useWalletAnalytics() {
  const { connected, wallet } = useWallet();

  useEffect(() => {
    if (connected && wallet) {
      AnalyticsService.trackWalletConnected(wallet.adapter.name);
    }
  }, [connected, wallet]);

  return { connected, wallet };
}