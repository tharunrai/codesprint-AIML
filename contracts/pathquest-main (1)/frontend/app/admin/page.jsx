'use client';

import { useState, useEffect } from 'react';
import {
  getCurrentWallet,
  connectMetaMask,
  getContractInstance,
  getSignerAndContractInstance,
  whitelistInstitution,
  removeFromWhitelist,
  getAllCredentials,
  isAdmin,
} from '@/lib/web3Utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';

export default function AdminPage() {
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [txMessage, setTxMessage] = useState('');
  const [allCredentials, setAllCredentials] = useState([]);

  // Form state
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [whitelistStatus, setWhitelistStatus] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const acc = await getCurrentWallet();
      setAccount(acc);

      if (acc) {
        // Check if is owner
        const isAdminUser = await isAdmin(acc);
        setIsOwner(isAdminUser);

        // Load credentials
        if (isAdminUser) {
          const creds = await getAllCredentials();
          setAllCredentials(creds);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const acc = await connectMetaMask();
      setAccount(acc);
      await checkAdminStatus();
      setTxStatus('success');
      setTxMessage(SUCCESS_MESSAGES.WALLET_CONNECTED);
      setTimeout(() => setTxStatus(null), 3000);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setTxStatus('error');
      setTxMessage(error.message || ERROR_MESSAGES.METAMASK_NOT_INSTALLED);
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = (addr) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleUpdateWhitelist = async (e) => {
    e.preventDefault();

    if (!institutionAddress || !institutionName) {
      setTxStatus('error');
      setTxMessage('Please fill in all fields');
      return;
    }

    if (!validateAddress(institutionAddress)) {
      setTxStatus('error');
      setTxMessage(ERROR_MESSAGES.INVALID_ADDRESS);
      return;
    }

    setLoading(true);
    setTxStatus('loading');
    setTxMessage('Processing transaction...');

    try {
      if (whitelistStatus) {
        await whitelistInstitution(institutionAddress, institutionName);
        setTxMessage(SUCCESS_MESSAGES.INSTITUTION_WHITELISTED);
      } else {
        await removeFromWhitelist(institutionAddress);
        setTxMessage(SUCCESS_MESSAGES.INSTITUTION_REMOVED);
      }

      setTxStatus('success');
      setInstitutionAddress('');
      setInstitutionName('');
      await checkAdminStatus();

      setTimeout(() => setTxStatus(null), 5000);
    } catch (error) {
      console.error('Error updating whitelist:', error);
      setTxStatus('error');
      setTxMessage(error.reason || error.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-blue-300">Connecting...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900/60 backdrop-blur border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold mb-4">No Wallet Connected</h2>
            <p className="text-slate-300 mb-8">
              Please connect your MetaMask wallet to access the admin dashboard.
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur border border-red-500/50 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold mb-3 text-red-300">Access Denied</h2>
            <p className="text-slate-300 mb-4">
              You are not authorized to access the admin dashboard.
            </p>
            <p className="text-sm text-slate-400">
              Connected Wallet:<br />
              <span className="font-mono text-blue-400 break-all">{account}</span>
            </p>
            <p className="text-slate-400 mt-6">
              Only the contract owner can access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white px-4 py-12">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
            Admin Dashboard
          </h1>
          <p className="text-blue-200">Manage institution whitelisting and view all credentials</p>
        </div>

        {/* Transaction Status */}
        {txStatus && (
          <div
            className={`mb-6 p-4 rounded-lg backdrop-blur border transition ${
              txStatus === 'loading'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : txStatus === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {txStatus === 'loading' && (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2"></div>
              )}
              {txStatus === 'success' && <span>✅</span>}
              {txStatus === 'error' && <span>❌</span>}
              <span>{txMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Account Card */}
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur border border-blue-500/30 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-2">Connected Account (Owner)</p>
            <p className="font-mono text-sm text-blue-300 break-all leading-relaxed">
              {account}
            </p>
            <button
              onClick={handleConnectWallet}
              className="mt-4 w-full px-4 py-2 bg-blue-600/50 hover:bg-blue-600 rounded-lg text-sm font-semibold transition"
            >
              Switch Account
            </button>
          </div>

          {/* Stats Cards */}
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur border border-purple-500/30 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-3">Total Credentials</p>
            <p className="text-4xl font-bold text-purple-300">{allCredentials.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 backdrop-blur border border-green-500/30 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-3">Role</p>
            <p className="text-3xl font-bold text-green-300">Owner</p>
          </div>
        </div>

        {/* Whitelist Manager */}
        <div className="bg-slate-900/60 backdrop-blur border border-blue-500/30 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Whitelist Institution</h2>

          <form onSubmit={handleUpdateWhitelist} className="space-y-6">
            {/* Institution Address Input */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                Institution Wallet Address *
              </label>
              <input
                type="text"
                value={institutionAddress}
                onChange={(e) => setInstitutionAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <p className="text-xs text-slate-400 mt-1">
                Enter the Ethereum address of the institution to whitelist
              </p>
            </div>

            {/* Institution Name Input */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                Institution Name *
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g., MIT, Harvard, Stanford"
                className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <p className="text-xs text-slate-400 mt-1">
                Full name of the academic institution
              </p>
            </div>

            {/* Status Toggle */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-4">
                Action
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setWhitelistStatus(true)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    whitelistStatus
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  ✓ Whitelist
                </button>
                <button
                  type="button"
                  onClick={() => setWhitelistStatus(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    !whitelistStatus
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  ✕ Remove
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 rounded-lg font-semibold text-white transition transform hover:scale-105 disabled:scale-100"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : whitelistStatus ? (
                'Whitelist Institution'
              ) : (
                'Remove from Whitelist'
              )}
            </button>
          </form>
        </div>

        {/* Credentials List */}
        <div className="bg-slate-900/60 backdrop-blur border border-blue-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">All Credentials</h2>

          {allCredentials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No credentials issued yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-blue-500/30">
                  <tr className="text-blue-300">
                    <th className="text-left py-3 px-4 font-semibold">#</th>
                    <th className="text-left py-3 px-4 font-semibold">EduID</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allCredentials.map((eduId, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-700/50 hover:bg-slate-800/40 transition"
                    >
                      <td className="py-4 px-4 text-slate-400">{idx + 1}</td>
                      <td className="py-4 px-4 font-mono text-xs text-blue-300">
                        {eduId.slice(0, 20)}...
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-semibold border border-green-500/30">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <a
                          href={`/verify/${eduId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-slate-500 mt-4">
            Showing {allCredentials.length} total credentials
          </p>
        </div>
      </div>
    </div>
  );
}
