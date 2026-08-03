'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getCurrentWallet } from '@/lib/web3Utils';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      const acc = await getCurrentWallet();
      setAccount(acc);
    };
    checkAccount();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-8 inline-block">
            <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-500/10 border border-blue-500/30 text-blue-300">
              Blockchain-Powered Credentials
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-100 to-purple-300 leading-tight">
            Issue. Store. Verify. Instantly.
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Say goodbye to forged documents. CredChain brings academic credentials to the blockchain—secure, transparent, and instantly verifiable.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {account ? (
              <>
                <Link
                  href="/issuer"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                >
                  Issue Credential
                </Link>
                <Link
                  href="/verify"
                  className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-lg transition transform hover:scale-105 border border-blue-500/30"
                >
                  ✓ Verify
                </Link>
              </>
            ) : (
              <div className="text-lg text-blue-300">
                Connect your wallet to get started
              </div>
            )}
          </div>

          {/* Account Display */}
          {account && (
            <p className="text-sm text-blue-400">
              Connected: <span className="font-mono font-semibold">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </p>
          )}
        </div>
      </section>

      {/* Features/Roles Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Built for Everyone</h2>
          <p className="text-center text-blue-200 mb-16 max-w-2xl mx-auto">
            Whether you're issuing, receiving, or verifying credentials, CredChain makes it seamless.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Institution Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-900/90 backdrop-blur border border-blue-500/30 rounded-2xl p-8 h-full transform transition hover:scale-105 hover:border-blue-500/60">
                <div className="mb-4 flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="CredChain Logo"
                    width={48}
                    height={48}
                    className="rounded"
                  />
                  <span className="text-xl font-bold text-blue-300">CredChain</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Institutions</h3>
                <p className="text-slate-300 mb-6">
                  Issue verifiable digital credentials in seconds. No more paperwork, no more delays.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-slate-400">
                  <li>✓ Instant issuance</li>
                  <li>✓ Tamper-proof records</li>
                  <li>✓ Easy revocation</li>
                </ul>
                <Link
                  href="/admin"
                  className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Student Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-900/90 backdrop-blur border border-purple-500/30 rounded-2xl p-8 h-full transform transition hover:scale-105 hover:border-purple-500/60">
                <div className="mb-4 flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="CredChain Logo"
                    width={48}
                    height={48}
                    className="rounded"
                  />
                  <span className="text-xl font-bold text-purple-300">CredChain</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Students</h3>
                <p className="text-slate-300 mb-6">
                  Own your credentials. Share them anywhere instantly with a public verification link.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-slate-400">
                  <li>✓ Secure storage</li>
                  <li>✓ Shareable links</li>
                  <li>✓ Always accessible</li>
                </ul>
                <Link
                  href="/student"
                  className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                >
                  View Credentials
                </Link>
              </div>
            </div>

            {/* Employer/Verifier Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-900/90 backdrop-blur border border-green-500/30 rounded-2xl p-8 h-full transform transition hover:scale-105 hover:border-green-500/60">
                <div className="mb-4 flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="CredChain Logo"
                    width={48}
                    height={48}
                    className="rounded"
                  />
                  <span className="text-xl font-bold text-green-300">CredChain</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Employers</h3>
                <p className="text-slate-300 mb-6">
                  Verify credentials directly on the blockchain. No intermediaries, no delays.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-slate-400">
                  <li>✓ Instant verification</li>
                  <li>✓ No intermediaries</li>
                  <li>✓ Complete transparency</li>
                </ul>
                <Link
                  href="/verify"
                  className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                >
                  Verify Credential
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">Issue</h4>
              <p className="text-slate-400">Institution uploads student credentials and generates a PDF hash</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center text-3xl text-blue-500">→</div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">Store</h4>
              <p className="text-slate-400">Credential stored on Ethereum Sepolia with unique EduID</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center text-3xl text-blue-500">→</div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">Verify</h4>
              <p className="text-slate-400">Anyone can verify credentials instantly using EduID or QR code</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Why CredChain?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🔐', title: 'Immutable', desc: 'Credentials stored on blockchain cannot be altered or forged' },
              { icon: '⚡', title: 'Instant', desc: 'Verify credentials in real-time without waiting for confirmations' },
              { icon: '🌍', title: 'Decentralized', desc: 'No central authority. Completely transparent and trustless' },
              { icon: '📱', title: 'Shareable', desc: 'Generate public verification links for easy credential sharing' },
              { icon: '💚', title: 'Cost-Effective', desc: 'Minimal gas fees on Sepolia testnet, scalable solution' },
              { icon: '🎓', title: 'Academic-Ready', desc: 'Supports degrees, certificates, diplomas, and more' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-900/60 backdrop-blur border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/50 transition">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Transform Credentials?</h2>
          <p className="text-xl text-blue-200 mb-10">
            Join thousands of educators and employers trusting CredChain with their credentials.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition transform hover:scale-105 shadow-lg"
            >
              Launch Admin Dashboard
            </Link>
            <Link
              href="/verify"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-lg transition transform hover:scale-105 border border-blue-500/30"
            >
              Try Verification
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="relative pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-blue-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src="/logo.png"
                  alt="CredChain Logo"
                  width={40}
                  height={40}
                  className="rounded"
                />
                <h3 className="text-2xl font-bold text-white">CredChain</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Blockchain-powered academic credential verification for the future of education.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/admin" className="hover:text-blue-400 transition">Admin</Link></li>
                <li><Link href="/issuer" className="hover:text-blue-400 transition">Issuer</Link></li>
                <li><Link href="/student" className="hover:text-blue-400 transition">Student</Link></li>
              </ul>
            </div>

            {/* Network */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Network</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Sepolia Testnet</li>
                <li>Chain ID: 11155111</li>
                <li><a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">Block Explorer</a></li>
              </ul>
            </div>

            {/* Hackathon */}
            <div>
              <h4 className="font-semibold mb-4 text-white">StackBlaze HC-602</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Project: CredChain</li>
                <li>Status: Active</li>
                <li className="text-xs text-slate-500">Feb 14, 2026</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-blue-500/10 pt-8">
            <p className="text-center text-slate-500 text-sm">
              © 2026 CredChain. All rights reserved. Built for the StackBlaze Hackathon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
