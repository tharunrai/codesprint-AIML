'use client';

import { useState, useRef } from 'react';
import { verifyCredential } from '@/lib/web3Utils';

export default function VerifyPage() {
  const [eduId, setEduId] = useState('');
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const html5QrcodeRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!eduId.trim()) {
      setMessage('Please enter an EduID');
      return;
    }

    setLoading(true);
    setMessage('');
    setSearched(false);

    try {
      const { exists, credential: cred } = await verifyCredential(eduId);

      if (!exists) {
        setMessage('❌ Credential not found');
        setCredential(null);
      } else {
        setCredential(cred);
        setMessage(cred.revoked ? '⚠️ This credential has been revoked' : '✓ Credential verified');
      }
      setSearched(true);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ ' + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white min-h-screen py-12 px-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-100 to-purple-300">
            Verify Credential
          </h1>
          <p className="text-blue-200 text-lg">Enter an EduID or scan a QR code to verify academic credentials on the blockchain</p>
        </div>

        {/* Search Form */}
        <div className="group relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative bg-slate-900/90 backdrop-blur border border-blue-500/30 rounded-2xl p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-3">
                  Enter EduID or Scan QR Code
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={eduId}
                    onChange={(e) => setEduId(e.target.value)}
                    placeholder="e.g., credential-2024-xxxxx..."
                    className="flex-1 px-4 py-3 bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setScannerError('');
                        if (scanning) {
                          try {
                            if (html5QrcodeRef.current) await html5QrcodeRef.current.stop();
                          } catch (e) {
                            console.error('Error stopping scanner:', e);
                          }
                          setScanning(false);
                          return;
                        }

                        try {
                          const { Html5Qrcode } = await import('html5-qrcode');
                          const elementId = 'qr-reader';
                          const html5Qr = new Html5Qrcode(elementId);
                          html5QrcodeRef.current = html5Qr;
                          const devices = await Html5Qrcode.getCameras();
                          const cameraId = (devices && devices.length) ? devices[0].id : undefined;
                          setScanning(true);

                          await html5Qr.start(
                            cameraId || { facingMode: 'environment' },
                            { fps: 10, qrbox: 250 },
                            (decodedText) => {
                              setEduId(decodedText);
                              html5Qr.stop().catch(() => {});
                              setScanning(false);
                              setScannerError('');
                            },
                            (errorMessage) => {
                              // per-frame decode errors ignored
                            }
                          );
                        } catch (err) {
                          console.error('QR scanner error:', err);
                          setScannerError('QR scanner unavailable. Use image upload or compatible browser.');
                          setScanning(false);
                        }
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
                    >
                      {scanning ? '⏹ Stop' : '📷 Scan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
                    >
                      📁 Image
                    </button>
                  </div>
                </div>
                {scannerError && <p className="text-sm text-red-400 mt-2">⚠️ {scannerError}</p>}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  setScannerError('');
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const { Html5Qrcode } = await import('html5-qrcode');
                    if (Html5Qrcode.scanFileV2) {
                      const result = await Html5Qrcode.scanFileV2(file, true);
                      const decoded = result?.decodedText || result;
                      if (decoded) setEduId(decoded);
                    } else if (Html5Qrcode.scanFile) {
                      const decoded = await Html5Qrcode.scanFile(file, true);
                      if (decoded) setEduId(decoded);
                    } else {
                      setScannerError('QR decode not available');
                    }
                  } catch (err) {
                    console.error('QR decode error:', err);
                    setScannerError('Unable to decode QR from image');
                  } finally {
                    e.target.value = '';
                  }
                }}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50 shadow-lg"
              >
                {loading ? '⏳ Verifying...' : '✓ Verify Credential'}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-4 rounded-lg backdrop-blur ${message.includes('✓') || message.includes('Verified') ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* QR Scanner Preview */}
        {scanning && (
          <div className="group relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-slate-900/90 backdrop-blur border border-blue-500/30 rounded-2xl p-4">
              <div id="qr-reader" className="w-full" />
              <p className="text-sm text-blue-300 mt-3">📹 Point your camera at the QR code to scan the EduID</p>
            </div>
          </div>
        )}

        {/* Verification Result - Valid */}
        {searched && credential && !credential.revoked && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-slate-900/90 backdrop-blur border border-green-500/30 rounded-2xl p-8 transform transition hover:scale-105">
              <div className="mb-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50 text-green-300 font-bold">
                  ✓ VALID
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                  <p className="text-sm text-blue-400 font-semibold mb-1">Student Name</p>
                  <p className="text-lg text-white">{credential.studentName}</p>
                </div>

                <div>
                  <p className="text-sm text-blue-400 font-semibold mb-1">Institution</p>
                  <p className="text-lg text-white">{credential.institutionName}</p>
                </div>

                <div>
                  <p className="text-sm text-blue-400 font-semibold mb-1">Credential Type</p>
                  <p className="text-lg text-white">{credential.credentialType}</p>
                </div>

                <div>
                  <p className="text-sm text-blue-400 font-semibold mb-1">Course/Program</p>
                  <p className="text-lg text-white">{credential.courseOrProgram}</p>
                </div>

                <div>
                  <p className="text-sm text-blue-400 font-semibold mb-1">Issued Date</p>
                  <p className="text-lg text-white">
                    {new Date(Number(credential.issueDate) * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-blue-400 font-semibold mb-1">EduID</p>
                  <p className="font-mono text-sm text-slate-300 break-all">{eduId}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-blue-400 font-semibold mb-1">Issuer Wallet</p>
                  <p className="font-mono text-xs text-slate-300 break-all">{credential.issuer}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-blue-400 font-semibold mb-1">Student Wallet</p>
                  <p className="font-mono text-xs text-slate-300 break-all">{credential.studentWallet}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-blue-400 font-semibold mb-1">Document Hash (SHA-256)</p>
                  <p className="font-mono text-xs text-slate-300 break-all">{credential.documentHash}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result - Revoked */}
        {searched && credential && credential.revoked && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-slate-900/90 backdrop-blur border border-red-500/30 rounded-2xl p-8">
              <div className="mb-6">
                <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 font-bold inline-block">
                  ⚠️ REVOKED
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-300 font-semibold">This credential has been revoked</p>
                <p className="text-sm text-red-200 mt-1">This credential is no longer valid and cannot be used for verification purposes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-blue-400 font-semibold mb-1">Student Name</p>
                  <p className="text-lg text-white">{credential.studentName}</p>
                </div>

                <div>
                  <p className="text-sm text-blue-400 font-semibold mb-1">Institution</p>
                  <p className="text-lg text-white">{credential.institutionName}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-blue-400 font-semibold mb-1">EduID</p>
                  <p className="font-mono text-sm text-slate-300 break-all">{eduId}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not Found */}
        {searched && !credential && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-slate-900/90 backdrop-blur border border-red-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">❌</div>
                <h3 className="text-xl font-bold text-white">Credential Not Found</h3>
              </div>
              <p className="text-slate-300">The EduID you entered could not be found on the blockchain. Please verify the ID is correct.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
