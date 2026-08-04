"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAllCredentials, updateCredentialStatus } from "@/app/actions/credentials";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { type DocumentStatus } from "@/lib/mock-data";

export default function FacultyDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  
  // Track remarks input for each document ID being verified
  const [remarksState, setRemarksState] = useState<Record<string, string>>({});
  // Track which documents are in "editing/re-evaluating" mode
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllCredentials();
        setDocuments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isFaculty = user?.role === "FACULTY";

  if (!isFaculty) {
    return (
      <>
        <Header
          title="Student Documents Portal"
          subtitle="Upload and manage your academic credentials."
        />
        <div className="p-6 max-w-2xl">
          <Card className="p-6 border-danger/30 bg-danger/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                <span className="text-danger text-2xl font-bold">⚠️</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Access Denied</h3>
                <p className="text-sm text-muted-foreground">
                  You are logged in with a Student profile. Faculty verification tools are restricted.
                </p>
                <div className="pt-2">
                  <Link href="/documents">
                    <Button variant="primary">Go to My Documents Page</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // Filter and search logic
  const filteredDocs = documents.filter((doc) => {
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      doc.studentName.toLowerCase().includes(searchLower) ||
      doc.rollNumber.toLowerCase().includes(searchLower) ||
      doc.fileName.toLowerCase().includes(searchLower) ||
      doc.type.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  const getDocIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "resume":
        return (
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case "marksheet":
        return (
          <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case "certificate":
        return (
          <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
          </svg>
        );
    }
  };

  const handleVerify = async (docId: string, status: "verified" | "rejected") => {
    const remarks = remarksState[docId] || "";
    // Optimistic update
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status, remarks } : d))
    );
    setEditingDocId(null);
    try {
      await updateCredentialStatus(docId, status.toUpperCase() as any, remarks);
    } catch (e) {
      console.error(e);
      // Rollback would go here
    }
  };

  return (
    <>
      <Header
        title="Document Verification Queue"
        subtitle="Review student-submitted credentials, add feedback, and approve/reject profiles for placement compliance."
      />

      <div className="p-6 space-y-6 max-w-7xl">
        {/* Filters */}
        {loading ? (
           <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "verified", "rejected"] as const).map((s) => {
              const count =
                s === "all"
                  ? documents.length
                  : documents.filter((d) => d.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                    ${
                      filterStatus === s
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                        : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    }
                  `}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by student, roll number, file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl text-xs bg-surface-hover border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <svg className="w-4 h-4 text-muted-foreground absolute left-3 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Verification Queue */}
        {filteredDocs.length === 0 ? (
          <Card className="text-center py-20 border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">No documents found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              There are no documents matching your search or selected status filter at the moment.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocs.map((doc) => {
              const isPending = doc.status === "pending";
              const isVerified = doc.status === "verified";
              const isRejected = doc.status === "rejected";
              const isEditing = editingDocId === doc.id;

              return (
                <Card key={doc.id} className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Document details */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-surface-hover shrink-0">
                        {getDocIcon(doc.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {doc.studentName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({doc.rollNumber} • {doc.branch})
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          <span className="font-semibold text-foreground">
                            {doc.type.toUpperCase()}:
                          </span>
                          <span className="text-muted-foreground truncate max-w-[200px]" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                          <span className="text-muted-foreground">• {doc.fileSize}</span>
                          <span className="text-muted-foreground">
                            • Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Action triggers */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                      <Badge
                        variant={
                          isVerified ? "success" : isRejected ? "danger" : "warning"
                        }
                        dot
                      >
                        {doc.status.toUpperCase()}
                      </Badge>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setPreviewDocId(previewDocId === doc.id ? null : doc.id)
                        }
                        className="text-xs py-1.5"
                      >
                        {previewDocId === doc.id ? "Close Preview" : "Preview"}
                      </Button>
                    </div>
                  </div>

                  {/* Inline Preview Toggle */}
                  {previewDocId === doc.id && (
                    <div className="p-4 rounded-xl bg-surface border border-border text-xs space-y-2">
                      <div className="font-semibold text-foreground pb-1.5 border-b border-border">
                        Document Content Preview (Mocked)
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground leading-relaxed p-3 bg-surface-hover rounded-lg max-h-36 overflow-y-auto space-y-1">
                        <p className="text-foreground font-semibold">--- {doc.fileName} ---</p>
                        <p>File Size: {doc.fileSize || "Unknown"}</p>
                        <p>Student Identifier: {doc.studentId}</p>
                        <p>Academic Roll: {doc.rollNumber}</p>
                        <p>Verified Status: {doc.status.toUpperCase()}</p>
                        <p>Upload Timestamp: {new Date(doc.uploadedAt).toLocaleString()}</p>
                        {doc.verifiedAt && <p>Verification Timestamp: {new Date(doc.verifiedAt).toLocaleString()}</p>}
                        {doc.remarks && <p>Attested remarks: {doc.remarks}</p>}
                      </div>
                    </div>
                  )}

                  {/* Inline Verification Form */}
                  {(isPending || isEditing) ? (
                    <div className="p-4 rounded-2xl bg-surface-hover border border-border/60 space-y-4">
                      <div className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="flex-1 w-full space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Verification Remarks
                          </label>
                          <Input
                            placeholder="Add remarks (e.g. 'GPA verified with transcripts', or rejection reasons)"
                            value={remarksState[doc.id] ?? doc.remarks ?? ""}
                            onChange={(e) =>
                              setRemarksState((prev) => ({
                                ...prev,
                                [doc.id]: e.target.value,
                              }))
                            }
                            className="bg-surface border-border text-xs w-full"
                          />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                          {isEditing && (
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setEditingDocId(null);
                                setRemarksState((prev) => {
                                  const updated = { ...prev };
                                  delete updated[doc.id];
                                  return updated;
                                });
                              }}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            onClick={() => handleVerify(doc.id, "rejected")}
                            className="text-xs flex-1 sm:flex-none justify-center"
                          >
                            Reject
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => handleVerify(doc.id, "verified")}
                            className="text-xs flex-1 sm:flex-none justify-center bg-success text-white hover:bg-success/90"
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-border text-xs">
                      <div className="space-y-1">
                        <span className="font-semibold text-muted-foreground">Remarks:</span>{" "}
                        <span className="text-foreground italic">
                          {doc.remarks || "No remarks provided."}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingDocId(doc.id);
                          setRemarksState((prev) => ({
                            ...prev,
                            [doc.id]: doc.remarks || "",
                          }));
                        }}
                        className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors cursor-pointer"
                      >
                        Update Verification
                      </button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
        </>)}
      </div>
    </>
  );
}
