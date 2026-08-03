"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface OfferUploadSectionProps {
  offerId: string;
  currentFile?: string;
  currentFileSize?: string;
  uploadedAt?: string;
  onUpload: (offerId: string, fileName: string, fileSize: string) => void;
  onDelete: (offerId: string) => void;
}

export default function OfferUploadSection({
  offerId,
  currentFile,
  currentFileSize = "1.2 MB",
  uploadedAt,
  onUpload,
  onDelete,
}: OfferUploadSectionProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const sizeInKb = file.size / 1024;
    const sizeStr =
      sizeInKb > 1024
        ? `${(sizeInKb / 1024).toFixed(1)} MB`
        : `${Math.round(sizeInKb)} KB`;

    onUpload(offerId, file.name, sizeStr);
  };

  if (currentFile) {
    return (
      <div className="space-y-3 bg-background/50 p-4 rounded-xl border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {currentFile}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentFileSize} • Uploaded{" "}
                {uploadedAt ? new Date(uploadedAt).toLocaleDateString() : "Recently"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            >
              {isPreviewOpen ? "Hide Preview" : "Preview"}
            </Button>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md bg-surface text-foreground border border-border hover:bg-surface-hover transition-colors">
                Replace
              </span>
            </label>

            <Button
              variant="ghost"
              size="sm"
              className="text-danger hover:text-danger hover:bg-danger/10"
              onClick={() => onDelete(offerId)}
            >
              Remove
            </Button>
          </div>
        </div>

        {/* Mock Inline Document Preview */}
        {isPreviewOpen && (
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 animate-fade-in text-xs font-mono">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-foreground">
                📄 PREVIEW: {currentFile}
              </span>
              <span className="text-[10px] text-success font-semibold uppercase bg-success/10 px-2 py-0.5 rounded">
                Authentic Offer Document
              </span>
            </div>
            <div className="text-muted-foreground space-y-1 py-2 font-mono text-[11px] leading-relaxed">
              <p>[OFFER LETTER SUMMARY & ATTESTATION]</p>
              <p>Company: Official Placement Extension Document</p>
              <p>Document Hash: sha256_e8f9a2b0c1...d4e5f6</p>
              <p>Status: Attached & Ready for Faculty Verification</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-border rounded-xl p-5 text-center bg-surface/30 hover:bg-surface-hover/50 hover:border-primary/40 transition-all">
      <label className="cursor-pointer space-y-2 block">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-foreground">
          Upload Signed Offer Letter
        </p>
        <p className="text-xs text-muted-foreground">
          Click to browse or drag PDF / Word document (Max 5MB)
        </p>
      </label>
    </div>
  );
}
