 'use client';

import { useEffect, useState } from 'react';
import { connectMetaMask, getCurrentWallet } from '@/lib/web3Utils';

export default function WalletConnect({ onConnected }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const acc = await getCurrentWallet();
        if (mounted && acc) {
          setAccount(acc);
          onConnected?.(acc);
        }
      } catch (err) {
        console.error('WalletConnect init error', err);
      }
    };

    init();

    const handleAccountsChanged = (accounts) => {
      const a = accounts && accounts.length ? accounts[0] : null;
      setAccount(a);
      if (a) onConnected?.(a);
    };

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      mounted = false;
      if (typeof window !== 'undefined' && window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [onConnected]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const acc = await connectMetaMask();
      setAccount(acc);
      onConnected?.(acc);
    } catch (err) {
      console.error('Connect error', err);
      alert(err?.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const shortAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="inline-flex items-center gap-3">
      {!account ? (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <div className="text-sm font-mono text-slate-200">{shortAddress(account)}</div>
        </div>
      )}
    </div>
  );
}
