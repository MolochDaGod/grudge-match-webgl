'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Coins, RefreshCw } from 'lucide-react';
import { GbuxTokenService, TokenBalance as TokenBalanceType } from '@/services/GbuxTokenService';

export default function TokenBalance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<TokenBalanceType | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gbuxService = new GbuxTokenService(connection);

  const fetchBalances = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const [tokenBalance, solBalance] = await Promise.all([
        gbuxService.getTokenBalance(publicKey),
        gbuxService.getSolBalance(publicKey),
      ]);

      setBalance(tokenBalance);
      setSolBalance(solBalance);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [publicKey]);

  if (!publicKey) return null;

  return (
    <div className="flex items-center space-x-4 bg-black/20 rounded-lg px-4 py-2 border border-purple-500/30">
      {/* GBUX Balance */}
      <div className="flex items-center space-x-2">
        <Coins className="w-4 h-4 text-yellow-400" />
        <div className="text-sm">
          {isLoading ? (
            <div className="flex items-center space-x-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : error ? (
            <span className="text-red-400">Error</span>
          ) : (
            <div>
              <span className="text-yellow-400 font-semibold">
                {balance?.formatted || '0.00'}
              </span>
              <span className="text-gray-400 ml-1">GBUX</span>
            </div>
          )}
        </div>
      </div>

      {/* SOL Balance */}
      <div className="text-sm">
        <span className="text-purple-400 font-semibold">
          {solBalance.toFixed(3)}
        </span>
        <span className="text-gray-400 ml-1">SOL</span>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchBalances}
        disabled={isLoading}
        className="p-1 hover:bg-white/10 rounded transition-colors"
        title="Refresh balances"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}