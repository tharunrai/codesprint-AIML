"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { UploadCloud, CheckCircle2, XCircle, Search } from "lucide-react";
import Link from "next/link";

export default function VerifyPortalPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      // Initialize scanner just for file scanning (doesn't need camera permissions)
      const html5QrCode = new Html5Qrcode("qr-reader-hidden");
      
      const decodedText = await html5QrCode.scanFile(file, false);
      
      // Parse the URL to extract the ID
      const url = new URL(decodedText);
      const parts = url.pathname.split("/verify/");
      
      if (parts.length > 1 && parts[1]) {
        const studentId = parts[1];
        // Redirect to the actual verification page for this ID
        router.push(`/verify/${studentId}`);
      } else {
        throw new Error("Invalid PlaceMe QR Code format.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Could not read a valid QR code from this image. Please try a clearer image.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      router.push(`/verify/${manualId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar space */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">PlaceMe CredChain</span>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Login to Portal</Button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Public Verification Portal</h1>
            <p className="text-muted-foreground">
              Upload a student's Master QR Code to verify the authenticity of their academic credentials on the blockchain.
            </p>
          </div>

          <Card className="p-8 space-y-6 bg-gradient-to-br from-surface to-accent/5">
            
            {/* Hidden div required by html5-qrcode for instantiation even for file scanning */}
            <div id="qr-reader-hidden" style={{ display: "none" }}></div>

            {/* Upload Area */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Upload QR Code Image"
                disabled={isScanning}
              />
              <div className={`
                border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-200
                ${isScanning ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-surface-hover"}
              `}>
                {isScanning ? (
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mb-1">
                  {isScanning ? "Scanning QR Code..." : "Upload QR Code Image"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  {isScanning ? "Please wait while we decode the image." : "Drag & drop an image or click to browse files (PNG, JPG)"}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3 text-danger">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase font-bold tracking-wider">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Manual Entry */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Verify manually by ID</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter Student ID or EduID..."
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                />
                <Button type="submit" disabled={!manualId.trim()} className="h-11 px-6">
                  Verify
                </Button>
              </div>
            </form>

          </Card>
        </div>
      </div>
    </div>
  );
}
