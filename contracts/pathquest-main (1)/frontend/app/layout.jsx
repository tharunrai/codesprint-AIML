'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '../styles/globals.css';
import { getCurrentWallet } from '@/lib/web3Utils';

export default function RootLayout({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkAccount();
    if (typeof window !== 'undefined') {
      window.ethereum?.on('accountsChanged', () => checkAccount());
    }
  }, []);

  const checkAccount = async () => {
    try {
      const acc = await getCurrentWallet();
      setAccount(acc);
    } catch (error) {
      console.error('Error checking account:', error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed');
        return;
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <html lang="en">
      <body>
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white backdrop-blur-md bg-opacity-95 border-b border-blue-500/20 shadow-2xl">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 pointer-events-none"></div>
          
          <div className="container mx-auto px-4 py-4 flex justify-between items-center relative z-10">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center space-x-3 group hover:scale-105 transition transform duration-200">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                <Image
                  src="/logo.png"
                  alt="CredChain Logo"
                  width={40}
                  height={40}
                  className="rounded-lg relative"
                />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-100 to-purple-300">
                CredChain
              </span>
            </Link>

            {/* Navigation Links & Auth */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Desktop Links */}
              <div className="hidden md:flex items-center space-x-1">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/admin', label: 'Admin' },
                  { href: '/issuer', label: 'Issuer' },
                  { href: '/student', label: 'Student' },
                  { href: '/verify', label: 'Verify' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 rounded-lg text-blue-100 relative group transition duration-200 hover:text-white"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg scale-0 group-hover:scale-100 transition transform duration-200 origin-center"></div>
                  </Link>
                ))}
              </div>

              {/* Wallet Section */}
              <div className="flex items-center gap-3">
                {account ? (
                  <>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur border border-blue-500/30 hover:border-blue-500/60 transition duration-200">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="font-mono text-sm text-blue-200 font-semibold">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition transform hover:scale-105 shadow-lg"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition transform hover:scale-105 disabled:opacity-50 shadow-lg"
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Connecting...
                      </span>
                    ) : (
                      '🦊 Connect Wallet'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
