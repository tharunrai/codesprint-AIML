"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { type DocumentType } from "@/lib/mock-data";

export default function StudentDocumentsPage() {
  const { user } = useAuth();
  const { documents, uploadDocument, removeDocument } = usePlacement();
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);

  const isStudent = user?.role === "student";

  // Filter documents belonging to this student
  const studentDocs = documents.filter(
    (doc) => user && doc.studentId === user.id
  );

  const documentTypes: { type: DocumentType; label: string; desc: string }[] = [
    {
      type: "resume",
      label: "Professional Resume",
      desc: "Upload your latest ATS-friendly resume. (PDF, Max 2MB)",
    },
    {
      type: "marksheet",
      label: "Academic Marksheet",
      desc: "Consolidated grade sheet or latest semester marksheet. (PDF, Max 5MB)",
    },
    {
      type: "certificate",
      label: "Degree/Course Certificate",
      desc: "Degree certificate, NPTEL, Coursera or technical certification. (PDF, Max 2MB)",
    },
  ];

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: DocumentType
  ) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const sizeInKb = file.size / 1024;
    const sizeStr =
      sizeInKb > 1024
        ? `${(sizeInKb / 1024).toFixed(1)} MB`
        : `${sizeInKb.toFixed(0)} KB`;

    uploadDocument(user, type, file.name, sizeStr);
    // Reset file input value so upload can be triggered again
    e.target.value = "";
  };

  const getDocIcon = (type: DocumentType) => {
    switch (type) {
      case "resume":
        return (
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case "marksheet":
        return (
          <svg className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case "certificate":
        return (
          <svg className="w-8 h-8 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        );
    }
  };

  if (!isStudent) {
    return (
      <>
        <Header
          title="Document Verification Portal"
          subtitle="Manage student academic credentialing and verification records."
        />
        <div className="p-6 max-w-2xl">
          <Card className="p-6 border-warning/30 bg-warning/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                <span className="text-warning text-2xl font-bold">⚠️</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Faculty Account Detected</h3>
                <p className="text-sm text-muted-foreground">
                  You are logged in with a Faculty / TPC Coordinator profile. Student document uploading is only accessible to students.
                </p>
                <div className="pt-2">
                  <Link href="/faculty/documents">
                    <Button variant="primary">Go to Faculty Verification Page</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="My Documents & Verification"
        subtitle="Manage and upload your credentials. Once verified, they are attested for placement eligibility."
      />

      <div className="p-6 space-y-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documentTypes.map(({ type, label, desc }) => {
            const doc = studentDocs.find((d) => d.type === type);
            const isPending = doc?.status === "pending";
            const isVerified = doc?.status === "verified";
            const isRejected = doc?.status === "rejected";

            return (
              <Card key={type} className="flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-surface-hover">
                      {getDocIcon(type)}
                    </div>
                    {doc ? (
                      <Badge
                        variant={
                          isVerified ? "success" : isRejected ? "danger" : "warning"
                        }
                        dot
                      >
                        {isVerified
                          ? "Verified"
                          : isRejected
                          ? "Rejected"
                          : "Pending"}
                      </Badge>
                    ) : (
                      <Badge variant="default">Missing</Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground">{label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </div>

                  {doc ? (
                    <div className="p-3 rounded-xl bg-surface-hover border border-border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground truncate max-w-[150px]" title={doc.fileName}>
                          {doc.fileName}
                        </span>
                        <span className="text-muted-foreground shrink-0 ml-2">
                          {doc.fileSize}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="relative group border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-6 text-center cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileUpload(e, type)}
                      />
                      <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="text-xs font-semibold text-foreground block">
                        Upload File
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-1">
                        or drag & drop
                      </span>
                    </div>
                  )}

                  {doc && isRejected && doc.remarks && (
                    <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger space-y-1">
                      <p className="font-semibold">Rejection Reason:</p>
                      <p className="text-muted-foreground">{doc.remarks}</p>
                    </div>
                  )}

                  {doc && isVerified && (
                    <div className="p-2.5 rounded-xl bg-success/5 border border-success/20 text-[10px] text-success/80 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                      <span className="truncate" title="ATT-IMMUTABLE-SHA256-ONCHAIN-VERIFIED">
                        ID: ATT-{doc.id.toUpperCase()} (VERIFIED)
                      </span>
                    </div>
                  )}
                </div>

                {doc && (
                  <div className="mt-6 space-y-2">
                    {previewDocId === doc.id ? (
                      <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-border">
                          <span className="font-semibold text-foreground">File Preview</span>
                          <button
                            onClick={() => setPreviewDocId(null)}
                            className="text-muted-foreground hover:text-foreground text-[10px] cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground leading-relaxed py-1 space-y-1 bg-surface-hover p-2 rounded-lg max-h-32 overflow-y-auto">
                          <p className="text-foreground font-semibold">--- {doc.fileName} ---</p>
                          <p>File type: PDF/Academic Document</p>
                          <p>Attestation Hash: sha256_mock_f72a1e8...</p>
                          <p>Verification Status: {doc.status.toUpperCase()}</p>
                          <p>Student Roll: {doc.rollNumber}</p>
                          <p>Student Name: {doc.studentName}</p>
                          <p>Attestation Date: {doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleString() : "Pending Verification"}</p>
                          {doc.remarks && <p>Remarks: {doc.remarks}</p>}
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => setPreviewDocId(doc.id)}
                      >
                        Preview Document
                      </Button>
                    )}

                    {(isPending || isRejected) && (
                      <Button
                        variant="danger"
                        className="w-full justify-center text-xs py-1.5"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove this ${type}?`)) {
                            removeDocument(doc.id);
                            if (previewDocId === doc.id) setPreviewDocId(null);
                          }
                        }}
                      >
                        Remove Document
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
