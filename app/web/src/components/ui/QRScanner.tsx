"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onScanFailure, isOpen, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
        scannerRef.current = null;
      }
      return;
    }

    const scannerId = "qr-reader";
    
    // Create scanner instance
    scannerRef.current = new Html5QrcodeScanner(
      scannerId,
      { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScanSuccess(decodedText);
      },
      (error) => {
        if (onScanFailure) onScanFailure(error);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner on unmount", e));
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScanSuccess, onScanFailure]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl p-6 shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Scan Student QR</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-surface-hover"
          >
            ✕
          </button>
        </div>
        
        {errorMsg && (
          <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        <div id="qr-reader" className="w-full overflow-hidden rounded-xl border border-border"></div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Point camera at the student's Master Bundle QR Code
        </p>
      </div>
    </div>
  );
}
