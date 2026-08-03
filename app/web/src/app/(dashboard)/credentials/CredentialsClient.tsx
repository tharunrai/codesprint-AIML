"use client";

import { useState } from "react";
import { DocumentType, Credential } from "@prisma/client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/utils/supabase/client";
import { createCredential } from "@/app/actions/credentials";
import CryptoJS from "crypto-js";
import { QRCodeSVG } from "qrcode.react";
import { Upload, FileCheck, XCircle, Clock, Link as LinkIcon } from "lucide-react";

const DOC_TYPES = [
  "MARKSHEET_10",
  "MARKSHEET_12",
  "DEGREE_CERTIFICATE",
  "SEMESTER_MARKSHEET",
  "RESUME",
  "OFFER_LETTER",
  "OTHER",
];

export default function CredentialsClient({
  initialCredentials,
}: {
  initialCredentials: Credential[];
}) {
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>("RESUME");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const getFileHash = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // Convert ArrayBuffer to WordArray
          const wordArray = CryptoJS.lib.WordArray.create(e.target.result as any);
          const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
          resolve(hash);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Generate SHA-256 Hash
      const fileHash = await getFileHash(file);

      // 2. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${docType}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("credentials")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("credentials")
        .getPublicUrl(filePath);

      // 3. Save to Database via Server Action
      const newCredential = await createCredential({
        docType,
        fileUrl: publicUrlData.publicUrl,
        fileHash,
      });

      // Update local state
      setCredentials([newCredential, ...credentials]);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <FileCheck className="w-5 h-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "default"; // or green if you have custom variants
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Upload Section */}
      <Card>
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-lg">Upload Document</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Document Type
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                disabled={isUploading}
              >
                {DOC_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">File</label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max file size: 5MB. A cryptographic hash will be generated for blockchain verification.
              </p>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button type="submit" disabled={isUploading || !file} className="w-full">
              {isUploading ? (
                "Processing & Uploading..."
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Credential
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* Credentials List */}
      <div className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {credentials.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No credentials uploaded yet.</p>
          </div>
        ) : (
          credentials.map((cred) => {
            // URL for faculty to scan and verify
            const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${cred.id}`;
            
            return (
              <Card key={cred.id} className="overflow-hidden p-0">
                <div className="flex p-4 gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(cred.status)}
                      <h3 className="font-semibold">{cred.docType.replace("_", " ")}</h3>
                    </div>
                    
                    <Badge variant={getStatusBadgeVariant(cred.status) as any}>
                      {cred.status}
                    </Badge>
                    
                    <div className="text-xs text-muted-foreground break-all bg-muted/50 p-2 rounded border font-mono mt-2">
                      <span className="block font-semibold mb-1">SHA-256 Hash:</span>
                      {cred.fileHash}
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <a href={cred.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="sm" type="button">
                          <LinkIcon className="w-4 h-4 mr-1" /> View File
                        </Button>
                      </a>
                    </div>
                  </div>
                  
                  {/* QR Code Section */}
                  <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border min-w-[120px]">
                    <QRCodeSVG value={verificationUrl} size={100} />
                    <span className="text-[10px] text-center mt-2 text-gray-500 font-medium">Scan to Verify</span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
