'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { verifyCredential } from '@/lib/web3Utils';
import { useParams } from 'next/navigation';

export default function VerifyDetailPage() {
  const params = useParams();
  const eduId = params.eduId;

  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Set current URL for sharing
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
    loadCredential();
  }, [eduId]);

  const loadCredential = async () => {
    try {
      const { exists, credential: cred } = await verifyCredential(eduId);

      if (!exists) {
        setMessage('Credential not found');
        setCredential(null);
      } else {
        setCredential(cred);
        setMessage(cred.revoked ? 'This credential has been revoked' : '✓ Credential verified');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error loading credential');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-blue-300">Verifying credential...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!credential) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur border border-red-500/50 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-3xl font-bold mb-3 text-red-300">Credential Not Found</h2>
            <p className="text-slate-300 mb-2">
              The credential you're looking for could not be found on the blockchain.
            </p>
            <p className="text-xs text-slate-400 font-mono break-all">{eduId}</p>
          </div>
        </div>
      </div>
    );
  }

  // Valid/Revoked credential display
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white px-4 py-12">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Status Banner */}
        <div className="mb-8 flex justify-center">
          <div
            className={`inline-block px-8 py-3 rounded-full font-bold text-lg backdrop-blur border ${
              credential.revoked
                ? 'bg-red-600/20 border-red-500/50 text-red-300'
                : 'bg-green-600/20 border-green-500/50 text-green-300'
            }`}
          >
            {credential.revoked ? '🔴 REVOKED' : '✅ VALID CREDENTIAL'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Credential Card */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/60 backdrop-blur border border-blue-500/30 rounded-2xl p-8">
              {/* Header */}
              <div className="mb-8 pb-6 border-b border-slate-700">
                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">
                  {credential.studentName}
                </h1>
                <p className="text-blue-200 text-lg">
                  {credential.credentialType.charAt(0).toUpperCase() + credential.credentialType.slice(1)}
                </p>
              </div>

              {/* Credential Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-slate-400 text-sm font-semibold mb-1">Institution</p>
                  <p className="text-xl text-white font-semibold">{credential.institutionName}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm font-semibold mb-1">Course / Program</p>
                  <p className="text-xl text-white font-semibold">{credential.courseOrProgram}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm font-semibold mb-1">Issued Date</p>
                  <p className="text-xl text-white font-semibold">
                    {new Date(Number(credential.issueDate) * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm font-semibold mb-1">Status</p>
                  <p
                    className={`text-xl font-bold ${
                      credential.revoked ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {credential.revoked ? '🔴 Revoked' : '🟢 Active'}
                  </p>
                </div>
              </div>

              {/* EduID Section */}
              <div className="bg-slate-800/40 border border-blue-500/20 rounded-lg p-6 mb-8">
                <p className="text-slate-400 text-sm font-semibold mb-2">Blockchain EduID</p>
                <p className="font-mono text-sm text-blue-300 break-all">{eduId}</p>
              </div>

              {/* Advanced Details */}
              <div className="bg-slate-800/40 border border-blue-500/20 rounded-lg p-6 mb-8">
                <p className="text-slate-400 text-sm font-semibold mb-4">Advanced Details</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Issuer Address</p>
                    <p className="font-mono text-xs text-slate-300 break-all">{credential.issuer}</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-xs mb-1">Student Wallet</p>
                    <p className="font-mono text-xs text-slate-300 break-all">{credential.studentWallet}</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-xs mb-1">Document Hash (SHA256)</p>
                    <p className="font-mono text-xs text-slate-300 break-all">{credential.documentHash}</p>
                  </div>
                </div>
              </div>

              {/* Revoked Warning */}
              {credential.revoked && (
                <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-6">
                  <p className="text-red-300 font-bold mb-2"> This credential has been revoked</p>
                  <p className="text-sm text-red-200">
                    This credential is no longer valid. Contact the issuing institution for more information.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: QR Code & Share */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="bg-slate-900/60 backdrop-blur border border-blue-500/30 rounded-2xl p-6 flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-white">Shareable QR</h3>
              <div className="bg-white p-4 rounded-lg">
                {currentUrl && (
                  <QRCodeSVG
                    value={currentUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>
              <p className="text-xs text-slate-400 text-center mt-4">
                Scan to verify this credential
              </p>
            </div>

            {/* Share Card */}
            <div className="bg-slate-900/60 backdrop-blur border border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 text-white">Share Link</h3>
              <button
                onClick={copyToClipboard}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <p className="text-xs text-slate-400 text-center mt-3">
                Click to copy the shareable verification link
              </p>
            </div>

            {/* Blockchain Info */}
            <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
              <p className="text-xs text-slate-400 text-center">
                ✓ Verified on Sepolia Ethereum testnet<br/>
                ✓ Independently verifiable<br/>
                ✓ Tamper-proof
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400">
            CredChain © 2026 | HC-602 Academic Credential Verification Platform
          </p>
        </div>
      </div>
    </div>
  );
}
