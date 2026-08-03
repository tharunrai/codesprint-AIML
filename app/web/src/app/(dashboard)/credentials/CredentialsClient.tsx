"use client";

import { useState } from "react";
import { DocumentType, Credential } from "@prisma/client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/utils/supabase/client";
import { createCredentialBundle } from "@/app/actions/credentials";
import CryptoJS from "crypto-js";
import { QRCodeSVG } from "qrcode.react";
import { Upload, FileCheck, XCircle, Clock, Link as LinkIcon, Plus, Trash2, ShieldCheck, QrCode, FileText, Download } from "lucide-react";

const DOC_TYPES: DocumentType[] = [
  "MARKSHEET_10",
  "MARKSHEET_12",
  "DEGREE_CERTIFICATE",
  "SEMESTER_MARKSHEET",
  "RESUME",
  "OFFER_LETTER",
  "OTHER",
];

interface FormRow {
  id: string;
  docType: DocumentType;
  file: File | null;
}

export default function CredentialsClient({
  initialCredentials,
  studentInfo,
}: {
  initialCredentials: Credential[];
  studentInfo?: {
    id: string;
    rollNumber: string;
    branch: string;
    fullName: string;
  } | null;
}) {
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  
  // Dynamic form rows: allow selecting Document Type + File simultaneously across multiple rows
  const [rows, setRows] = useState<FormRow[]>([
    { id: "row-1", docType: "MARKSHEET_10", file: null },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleAddRow = () => {
    // Pick next available document type or default to RESUME
    const usedTypes = rows.map((r) => r.docType);
    const nextType = DOC_TYPES.find((t) => !usedTypes.includes(t)) || "RESUME";

    setRows([
      ...rows,
      { id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, docType: nextType, file: null },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const handleDocTypeChange = (id: string, docType: DocumentType) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, docType } : r)));
  };

  const handleFileChange = (id: string, file: File | null) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, file } : r)));
    if (file) setError(null);
  };

  const getFileHash = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
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

  const handleUploadBundle = async (e: React.FormEvent) => {
    e.preventDefault();

    const validRows = rows.filter((r) => r.file !== null);

    if (validRows.length === 0) {
      setError("Please select at least one document file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const uploadedItems = [];

      for (const row of validRows) {
        const file = row.file!;
        // 1. Calculate SHA-256 Hash
        const fileHash = await getFileHash(file);

        // 2. Upload to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${row.docType}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("credentials")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("credentials")
          .getPublicUrl(fileName);

        uploadedItems.push({
          docType: row.docType,
          fileUrl: publicUrlData.publicUrl,
          fileHash,
        });
      }

      // 3. Save entire bundle to Database via Server Action
      const newCredentials = await createCredentialBundle(uploadedItems);

      // Update state
      setCredentials([...newCredentials, ...credentials]);
      setRows([{ id: `row-${Date.now()}`, docType: "RESUME", file: null }]);
      setSuccessMessage(`Successfully uploaded bundle of ${newCredentials.length} document(s)!`);
    } catch (err: any) {
      setError(err.message || "An error occurred during bundle upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <FileCheck className="w-5 h-5 text-emerald-500" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const downloadQRCode = () => {
    const svgElement = document.getElementById("master-bundle-qr");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        const studentNameClean = studentInfo?.fullName ? studentInfo.fullName.toLowerCase().replace(/\s+/g, "_") : "student";
        downloadLink.download = `${studentNameClean}_master_qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Master Bundle Verification URL
  const masterVerificationId = studentInfo?.id || credentials[0]?.studentId || "demo";
  const masterVerificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${masterVerificationId}`;
  const validFilesCount = rows.filter((r) => r.file !== null).length;

  return (
    <div className="space-y-6">
      {/* Top Card: Single Master Bundle QR Code Pass */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-background to-accent/10 border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> Single Master Verification Pass
            </div>
            <h3 className="text-xl font-bold">
              {studentInfo?.fullName || "Student"}'s Academic Portfolio
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              Scan this single master QR code to publicly verify all uploaded marksheets, degree certificates, and resumes in one unified pass.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-medium pt-2">
              <span className="bg-muted px-2.5 py-1 rounded-md border">
                Roll No: <strong>{studentInfo?.rollNumber || "N/A"}</strong>
              </span>
              <span className="bg-muted px-2.5 py-1 rounded-md border">
                Branch: <strong>{studentInfo?.branch || "CSE"}</strong>
              </span>
              <span className="bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Verified Bundle Count: <strong>{credentials.length}</strong>
              </span>
            </div>
          </div>

          {/* Master QR Code Display */}
          <div className="flex flex-col items-center justify-center bg-white p-3.5 rounded-xl shadow-md border min-w-[150px]">
            <QRCodeSVG id="master-bundle-qr" value={masterVerificationUrl} size={115} />
            <span className="text-[11px] text-center mt-2 text-gray-700 font-semibold flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-primary" /> Master Bundle QR
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={downloadQRCode}
              className="mt-2.5 text-[11px] h-7 px-2.5 w-full flex items-center justify-center gap-1 font-medium"
            >
              <Download className="w-3 h-3" /> Download QR
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content: Dynamic Multi-Document Bundle Upload + Credential Vault */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Dynamic Multi-Document Upload Form */}
        <Card className="lg:col-span-7 flex flex-col justify-between p-6 space-y-6">
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Bundle Document Upload
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Select document types and attach files simultaneously. Use the <strong className="text-foreground">+</strong> button to add more document rows.
              </p>
            </div>

            {/* Dynamic Document Rows List */}
            <form onSubmit={handleUploadBundle} className="space-y-3">
              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div
                    key={row.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-surface/50 backdrop-blur-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 transition-all duration-200 hover:border-primary/40 shadow-xs"
                  >
                    {/* Document Type Dropdown */}
                    <div className="sm:w-5/12">
                      <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1 sm:hidden">
                        Document Type
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-lg text-sm bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                        value={row.docType}
                        onChange={(e) => handleDocTypeChange(row.id, e.target.value as DocumentType)}
                        disabled={isUploading}
                      >
                        {DOC_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select File Input */}
                    <div className="sm:w-6/12">
                      <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1 sm:hidden">
                        Select File
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        disabled={isUploading}
                        onChange={(e) => handleFileChange(row.id, e.target.files?.[0] || null)}
                        className="w-full h-10 px-3 py-1.5 text-xs rounded-lg bg-background border border-input text-foreground file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      />
                    </div>

                    {/* Row Controls: Plus Icon / Delete Icon */}
                    <div className="flex items-center gap-1.5 justify-end sm:w-1/12">
                      {index === rows.length - 1 ? (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleAddRow}
                          disabled={isUploading}
                          title="Add another document row"
                          className="h-10 w-10 p-0 rounded-lg shrink-0 flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      ) : null}

                      {rows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRow(row.id)}
                          disabled={isUploading}
                          title="Remove row"
                          className="h-10 w-10 p-0 rounded-lg shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Row Action Link */}
              <div className="pt-1 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handleAddRow}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Another Document Row
                </button>

                <span className="text-muted-foreground font-medium">
                  {validFilesCount} file(s) attached
                </span>
              </div>

              {error && <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 text-sm">{error}</div>}
              {successMessage && <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-medium">{successMessage}</div>}

              {/* Submit Bundle Button */}
              <Button
                type="submit"
                disabled={isUploading || validFilesCount === 0}
                className="w-full h-11 text-base mt-2"
              >
                {isUploading ? (
                  "Calculating Hashes & Uploading Bundle..."
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Complete Bundle ({validFilesCount} Document{validFilesCount !== 1 ? "s" : ""})
                  </>
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Right Column: Uploaded Credentials Vault */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Uploaded Credentials ({credentials.length})
            </h3>
          </div>

          <div className="space-y-3 h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {credentials.length === 0 ? (
              <div className="text-center p-8 border rounded-xl bg-muted/20">
                <p className="text-muted-foreground text-sm">No credentials in your bundle yet.</p>
              </div>
            ) : (
              credentials.map((cred) => (
                <Card key={cred.id} padding="sm" className="space-y-3 border-border/80 hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(cred.status)}
                      <h4 className="font-semibold text-sm">
                        {cred.docType.replace("_", " ")}
                      </h4>
                    </div>

                    <Badge variant={getStatusBadgeVariant(cred.status) as any}>
                      {cred.status}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-muted-foreground break-all bg-muted/50 p-2 rounded-lg border font-mono">
                    <span className="block font-semibold text-foreground mb-0.5">SHA-256 Hash:</span>
                    {cred.fileHash}
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(cred.createdAt).toLocaleDateString()}
                    </span>
                    <a href={cred.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm" type="button">
                        <LinkIcon className="w-3.5 h-3.5 mr-1" /> View File
                      </Button>
                    </a>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
