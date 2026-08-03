'use client';

import { useState, useEffect } from 'react';
import {
  getCurrentWallet,
  connectMetaMask,
  getStudentCredentials,
  getCredentialDetails,
} from '@/lib/web3Utils';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';

export default function StudentPage() {
  const [account, setAccount] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [credentialDetails, setCredentialDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [txStatus, setTxStatus] = useState(null); // 'success' | 'error' | null
  const [txMessage, setTxMessage] = useState('');
  const [fetchingCredentials, setFetchingCredentials] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const acc = await getCurrentWallet();
      setAccount(acc);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const acc = await connectMetaMask();
      setAccount(acc);
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

  const handleFetchCredentials = async () => {
    if (!account) return;

    setFetchingCredentials(true);
    setTxStatus('loading');
    setTxMessage('Fetching your credentials...');

    try {
      const creds = await getStudentCredentials(account);
      setCredentials(creds || []);

      // Load details for each credential
      const details = {};
      for (const eduId of creds || []) {
        try {
          const cred = await getCredentialDetails(eduId);
          details[eduId] = cred;
        } catch (error) {
          console.error('Error loading credential details:', error);
        }
      }
      setCredentialDetails(details);

      if ((creds || []).length === 0) {
        setTxStatus('error');
        setTxMessage('No credentials found for your wallet');
      } else {
        setTxStatus('success');
        setTxMessage(`Loaded ${creds.length} credential(s)`);
      }
      setTimeout(() => setTxStatus(null), 3000);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setTxStatus('error');
      setTxMessage(error.message || 'Failed to fetch credentials');
    } finally {
      setFetchingCredentials(false);
    }
  };

  const shareCredential = (eduId) => {
    const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${eduId}`;
    navigator.clipboard.writeText(verifyUrl);
    setTxStatus('success');
    setTxMessage('✓ Link copied to clipboard');
    setTimeout(() => setTxStatus(null), 2000);
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
          <p className="mt-4 text-purple-300">Loading...</p>
        </div>
      </div>
    );
  }

  // No wallet connected
  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900/60 backdrop-blur border border-purple-500/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-3xl font-bold mb-4">View Your Credentials</h2>
            <p className="text-slate-300 mb-8">
              Connect your wallet to see all credentials issued to you on the blockchain.
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 text-white px-4 py-12">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">
            My Credentials
          </h1>
          <p className="text-purple-200">View and share your academic credentials</p>
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

        {/* Control Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Account Card */}
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur border border-purple-500/30 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-2">Connected Account</p>
            <p className="font-mono text-xs text-purple-300 break-all leading-relaxed">
              {account}
            </p>
            <button
              onClick={handleConnectWallet}
              className="mt-4 w-full px-4 py-2 bg-purple-600/50 hover:bg-purple-600 rounded-lg text-sm font-semibold transition"
            >
              Switch Account
            </button>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 backdrop-blur border border-indigo-500/30 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-3">Total Credentials</p>
            <p className="text-4xl font-bold text-indigo-300">{credentials.length}</p>
          </div>

          {/* Fetch Button */}
          <button
            onClick={handleFetchCredentials}
            disabled={fetchingCredentials}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 rounded-2xl p-6 font-semibold transition transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {fetchingCredentials ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Fetching...
              </>
            ) : (
              <>
                <span>🔄</span>
                Fetch My Credentials
              </>
            )}
          </button>
        </div>

        {/* Credentials Grid */}
        {credentials.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur border border-purple-500/30 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-2xl font-bold mb-2 text-white">No Credentials Found</h3>
            <p className="text-slate-400 mb-6">
              Click "Fetch My Credentials" to load credentials issued to your wallet
            </p>
            <button
              onClick={handleFetchCredentials}
              disabled={fetchingCredentials}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {fetchingCredentials ? 'Fetching...' : 'Fetch Credentials'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentials.map((eduId, idx) => {
              const cred = credentialDetails[eduId];
              return (
                <div
                  key={eduId}
                  className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-6 transition transform hover:scale-105 hover:shadow-2xl"
                >
                  {/* Credential Type Badge */}
                  <div className="inline-block px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-xs font-semibold text-purple-300 mb-4">
                    {cred?.credentialType
                      ? cred.credentialType.charAt(0).toUpperCase() + cred.credentialType.slice(1)
                      : 'Credential'}
                  </div>

                  {/* Credential Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {cred?.studentName || 'Student Credential'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono break-all">
                      {eduId.slice(0, 20)}...{eduId.slice(-10)}
                    </p>
                  </div>

                  {/* Credential Details */}
                  <div className="space-y-3 mb-6 text-sm">
                    {cred?.institutionName && (
                      <div>
                        <p className="text-slate-400">Institution</p>
                        <p className="text-purple-300 font-semibold">
                          {cred.institutionName}
                        </p>
                      </div>
                    )}

                    {cred?.courseOrProgram && (
                      <div>
                        <p className="text-slate-400">Course</p>
                        <p className="text-purple-300 font-semibold">
                          {cred.courseOrProgram}
                        </p>
                      </div>
                    )}

                    {cred?.issueDate && (
                      <div>
                        <p className="text-slate-400">Issued</p>
                        <p className="text-purple-300 font-semibold">
                          {new Date(Number(cred.issueDate) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div>
                      <p className="text-slate-400">Status</p>
                      <p
                        className={`font-semibold inline-block px-2 py-1 rounded text-xs ${
                          cred?.revoked
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-green-500/20 text-green-300'
                        }`}
                      >
                        {cred?.revoked ? '🔴 Revoked' : '🟢 Active'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t border-slate-700">
                    <button
                      onClick={() => shareCredential(eduId)}
                      className="flex-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm font-semibold transition"
                    >
                      Copy Link
                    </button>
                    <a
                      href={`/verify/${eduId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-sm font-semibold transition text-center"
                    >
                       View
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
