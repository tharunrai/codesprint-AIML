'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  getCurrentWallet,
  connectMetaMask,
  isInstitutionWhitelisted,
  issueCredential,
  getStudentCredentials,
} from '@/lib/web3Utils';
import { CREDENTIAL_TYPES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';

export default function IssuerPage() {
  const [account, setAccount] = useState(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [txMessage, setTxMessage] = useState('');
  const [issuedCredential, setIssuedCredential] = useState(null);
  const [myCredentials, setMyCredentials] = useState([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    studentName: '',
    studentWallet: '',
    institutionName: '',
    credentialType: 'degree',
    courseOrProgram: '',
    pdfFile: null,
  });

  const [pdfHash, setPdfHash] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setCheckingAuth(true);
    try {
      const acc = await getCurrentWallet();
      setAccount(acc);

      if (acc) {
        const isWhitelisted_tmp = await isInstitutionWhitelisted(acc);
        setIsWhitelisted(isWhitelisted_tmp);

        if (isWhitelisted_tmp) {
          const credentials = await getStudentCredentials(acc);
          setMyCredentials(credentials || []);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const acc = await connectMetaMask();
      setAccount(acc);
      await checkAuthStatus();
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

  // Compute SHA256 hash of PDF file
  const computeSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return '0x' + hashHex;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, pdfFile: file });
      setPdfFileName(file.name);

      // Compute hash
      try {
        const hash = await computeSHA256(file);
        setPdfHash(hash);
      } catch (error) {
        console.error('Error computing PDF hash:', error);
        setTxStatus('error');
        setTxMessage('Failed to compute PDF hash');
      }
    }
  };

  const validateForm = () => {
    if (!formData.studentName.trim()) {
      setTxMessage('Student name is required');
      return false;
    }
    if (!formData.studentWallet.trim()) {
      setTxMessage('Student wallet address is required');
      return false;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.studentWallet)) {
      setTxMessage(ERROR_MESSAGES.INVALID_ADDRESS);
      return false;
    }
    if (!formData.institutionName.trim()) {
      setTxMessage('Institution name is required');
      return false;
    }
    if (!formData.courseOrProgram.trim()) {
      setTxMessage('Course or program is required');
      return false;
    }
    if (!pdfFile) {
      setTxMessage('PDF certificate is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setTxStatus('error');
      return;
    }

    setLoading(true);
    setTxStatus('loading');
    setTxMessage('Issuing credential on blockchain...');

    try {
      const eduId = await issueCredential(
        formData.studentWallet,
        formData.studentName,
        formData.institutionName,
        formData.credentialType,
        formData.courseOrProgram,
        pdfHash
      );

      setTxStatus('success');
      setTxMessage(SUCCESS_MESSAGES.CREDENTIAL_ISSUED);
      setIssuedCredential({
        eduId,
        studentName: formData.studentName,
        credentialType: formData.credentialType,
        courseOrProgram: formData.courseOrProgram,
        verifyUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${eduId}`,
      });

      // Reset form
      setFormData({
        studentName: '',
        studentWallet: '',
        institutionName: '',
        credentialType: 'degree',
        courseOrProgram: '',
        pdfFile: null,
      });
      setPdfHash('');
      setPdfFileName('');

      // Reload credentials
      await checkAuthStatus();

      setTimeout(() => setTxStatus(null), 5000);
    } catch (error) {
      console.error('Error issuing credential:', error);
      setTxStatus('error');
      setTxMessage(error.reason || error.message || 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
          <p className="mt-4 text-green-300">Loading...</p>
        </div>
      </div>
    );
  }

  // No wallet connected
  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900/60 backdrop-blur border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-slate-300 mb-8">
              Connect your institution wallet to issue academic credentials on the blockchain.
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not whitelisted
  if (!isWhitelisted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur border border-red-500/50 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⛔</div>
            <h2 className="text-3xl font-bold mb-3 text-red-300">Not Whitelisted</h2>
            <p className="text-slate-300 mb-4">
              Your institution is not whitelisted to issue credentials.
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Connected Wallet:<br />
              <span className="font-mono text-green-400 break-all">{account}</span>
            </p>
            <p className="text-slate-400">
              Please contact the CredChain admin to get your institution whitelisted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show issued credential with QR code
  if (issuedCredential) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-green-950 to-slate-900 text-white px-4 py-12">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Success Banner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur border border-green-500/50 rounded-2xl text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-3xl font-bold mb-2">Credential Issued Successfully!</h2>
            <p className="text-green-300">The credential has been recorded on the blockchain</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Credential Details */}
            <div className="bg-slate-900/60 backdrop-blur border border-green-500/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-white">Credential Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Student Name</p>
                  <p className="text-lg font-semibold text-green-300">
                    {issuedCredential.studentName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Credential Type</p>
                  <p className="text-lg font-semibold text-green-300">
                    {issuedCredential.credentialType.charAt(0).toUpperCase() +
                      issuedCredential.credentialType.slice(1)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Course/Program</p>
                  <p className="text-lg font-semibold text-green-300">
                    {issuedCredential.courseOrProgram}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">EduID</p>
                  <p className="font-mono text-xs text-green-400 break-all leading-relaxed">
                    {issuedCredential.eduId}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Verification Link</p>
                  <a
                    href={issuedCredential.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm break-all transition"
                  >
                    {issuedCredential.verifyUrl}
                  </a>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(issuedCredential.verifyUrl);
                    alert('Link copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-2 bg-green-600/50 hover:bg-green-600 rounded-lg text-sm font-semibold transition"
                >
                  Copy Link
                </button>

                <button
                  onClick={() => setIssuedCredential(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
                >
                  Issue Another
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-slate-900/60 backdrop-blur border border-green-500/30 rounded-2xl p-8 flex flex-col items-center justify-center">
              <h3 className="text-2xl font-bold mb-6 text-white">Verification QR Code</h3>
              <div className="bg-white p-6 rounded-lg mb-6">
                <QRCodeSVG
                  value={issuedCredential.verifyUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-slate-400 text-center">
                Students can scan this QR code to verify their credential
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  const pdfFile = formData.pdfFile;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-green-950 to-slate-900 text-white px-4 py-12">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-emerald-300">
            Issue Credential
          </h1>
          <p className="text-green-200">Issue academic credentials and record them on the blockchain</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/60 backdrop-blur border border-green-500/30 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Name */}
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  />
                </div>

                {/* Student Wallet */}
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">
                    Student Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={formData.studentWallet}
                    onChange={(e) =>
                      setFormData({ ...formData, studentWallet: e.target.value })
                    }
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    The student's Sepolia testnet wallet address
                  </p>
                </div>

                {/* Institution Name */}
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) =>
                      setFormData({ ...formData, institutionName: e.target.value })
                    }
                    placeholder="e.g., MIT, Stanford, Harvard"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  />
                </div>

                {/* Credential Type */}
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">
                    Credential Type *
                  </label>
                  <select
                    value={formData.credentialType}
                    onChange={(e) =>
                      setFormData({ ...formData, credentialType: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  >
                    <option value="degree">Bachelor's Degree</option>
                    <option value="diploma">Diploma</option>
                    <option value="certificate">Certificate</option>
                    <option value="12th">12th Grade</option>
                    <option value="10th">10th Grade</option>
                    <option value="tc">Transfer Certificate</option>
                  </select>
                </div>

                {/* Course or Program */}
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">
                    Course or Program *
                  </label>
                  <input
                    type="text"
                    value={formData.courseOrProgram}
                    onChange={(e) =>
                      setFormData({ ...formData, courseOrProgram: e.target.value })
                    }
                    placeholder="e.g., Computer Science, Business Administration"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  />
                </div>

                {/* PDF Upload */}
                <div>
                  <label className="block text-sm font-semibold text-green-300 mb-2">
                    PDF Certificate (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 focus:outline-none focus:border-green-500 transition"
                    />
                  </div>
                  {pdfFile && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-300 flex items-center gap-2">
                        ✓ <span className="break-all">{pdfFileName}</span>
                      </p>
                      {pdfHash && (
                        <p className="text-xs text-slate-400 mt-2 font-mono break-all">
                          Hash: {pdfHash.slice(0, 32)}...
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 rounded-lg font-semibold text-white transition transform hover:scale-105 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    ' Issue Credential'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Account & Recent Credentials */}
          <div className="space-y-6">
            {/* Account Card */}
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 backdrop-blur border border-green-500/30 rounded-2xl p-6">
              <p className="text-slate-400 text-sm mb-2">Connected Account</p>
              <p className="font-mono text-xs text-green-300 break-all leading-relaxed">
                {account}
              </p>
              <button
                onClick={handleConnectWallet}
                className="mt-4 w-full px-3 py-2 bg-green-600/50 hover:bg-green-600 rounded-lg text-sm font-semibold transition"
              >
                Switch Account
              </button>
            </div>

            {/* Recent Credentials */}
            <div className="bg-slate-900/60 backdrop-blur border border-green-500/30 rounded-2xl p-6">
              <p className="text-green-300 text-sm font-semibold mb-4">
                Recently Issued ({myCredentials.length})
              </p>

              {myCredentials.length === 0 ? (
                <p className="text-slate-400 text-sm">No credentials issued yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {myCredentials.slice(0, 5).map((eduId, idx) => (
                    <a
                      key={idx}
                      href={`/verify/${eduId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-slate-800/40 border border-green-500/20 rounded-lg hover:bg-slate-800/60 hover:border-green-500/40 transition"
                    >
                      <p className="font-mono text-xs text-green-400 break-all">
                        {eduId.slice(0, 20)}...
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
