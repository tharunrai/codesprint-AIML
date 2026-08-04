"use client";

import { useEffect, useState } from "react";
import { getAllOffers, updateOfferStatus } from "@/app/actions/offers";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import OfferStatusBadge from "@/components/offers/OfferStatusBadge";
import { formatCTC } from "@/lib/utils";
import { OfferLetter } from "@/lib/types";

type OfferStatus = "uploaded" | "verified" | "accepted" | "declined";

export default function FacultyOffersPage() {
  const [offerLetters, setOfferLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | OfferStatus>("all");
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllOffers();
        setOfferLetters(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Statistics calculation
  const acceptedCount = offerLetters.filter((o) => o.status === "accepted").length;
  const pendingCount = offerLetters.filter((o) => o.status === "uploaded").length;
  const verifiedCount = offerLetters.filter((o) => o.status === "verified").length;
  const declinedCount = offerLetters.filter((o) => o.status === "declined").length;

  // Search & tab filtering
  const filteredOffers = offerLetters.filter((offer) => {
    const matchesSearch =
      offer.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" || offer.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleRemarkChange = (id: string, text: string) => {
    setRemarksMap((prev) => ({ ...prev, [id]: text }));
  };

  return (
    <>
      <Header
        title="Offer Letter Verification Queue"
        subtitle="Review student offer uploads, verify compensation packages, and record TPC attestation"
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Statistics Row (StatCard pattern) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card padding="md" className="border-l-4 border-l-info">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Accepted Offers
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-foreground">{acceptedCount}</span>
                  <Badge variant="info" size="sm">Accepted</Badge>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-l-warning">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Pending Approvals
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-foreground">{pendingCount}</span>
                  <Badge variant="warning" size="sm">Pending</Badge>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-l-success">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Verified Offers
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-foreground">{verifiedCount}</span>
                  <Badge variant="success" size="sm">Verified</Badge>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-l-danger">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Declined Offers
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-foreground">{declinedCount}</span>
                  <Badge variant="danger" size="sm">Declined</Badge>
                </div>
              </Card>
            </div>

            {/* AI Feature Placeholder Banner */}
            <Card className="bg-surface-hover/50 border-primary/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    AI
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      🤖 AI Interview Insights — Coming Soon
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Automated transcript analysis, candidate weakness detection, and offer CTC parity analytics.
                    </p>
                  </div>
                </div>
                <Badge variant="info" size="sm">Coming Soon</Badge>
              </div>
            </Card>

            {/* Filters & Search Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl overflow-x-auto">
                {(["all", "uploaded", "verified", "accepted", "declined"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 capitalize whitespace-nowrap cursor-pointer
                      ${
                        activeTab === tab
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search student or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Offers Verification Queue */}
            {filteredOffers.length === 0 ? (
              <Card className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted/20 text-muted-foreground mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-foreground">
                  No pending offer approvals.
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  There are no student offer submissions matching your filter criteria.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOffers.map((offer) => {
                  const currentRemark = remarksMap[offer.id] ?? offer.remarks ?? "";
                  const isPreviewing = previewDocId === offer.id;

                  return (
                    <Card key={offer.id} className="space-y-4">
                      {/* Top info header */}
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-foreground">
                              {offer.studentName}
                            </h4>
                            <span className="text-xs text-muted-foreground font-semibold">
                              ({offer.rollNumber} • {offer.branch})
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-primary mt-0.5">
                            {offer.companyName} — {offer.role} ({formatCTC(offer.packageLPA)})
                          </p>
                        </div>

                        <OfferStatusBadge status={offer.status} />
                      </div>

                      {/* Document & Details Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-background/50 p-3 rounded-xl border border-border/50">
                        <div className="space-y-0.5">
                          <span className="text-muted-foreground block font-medium">Uploaded Document</span>
                          <span className="font-bold text-foreground block">
                            {offer.fileName ? offer.fileName : "No Document Attached Yet"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {offer.fileName && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setPreviewDocId(isPreviewing ? null : offer.id)}
                            >
                              {isPreviewing ? "Hide Preview" : "Preview Document"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Live PDF Offer Letter Preview */}
                      {isPreviewing && (
                        <div className="p-4 rounded-xl bg-surface border border-border space-y-3 animate-fade-in text-xs">
                          <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="font-bold text-sm text-foreground">
                              📄 Student Uploaded Offer Letter: {offer.fileName || "Offer_Letter.pdf"}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-primary font-semibold uppercase bg-primary/10 px-2 py-0.5 rounded">
                                TPC Audit View
                              </span>
                              <a
                                href={offer.fileUrl || "/sample-offer.pdf"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                Open PDF ↗
                              </a>
                            </div>
                          </div>

                          {/* Embedded PDF iframe player */}
                          <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border bg-slate-900 shadow-inner">
                            <iframe
                              src={`${offer.fileUrl || "/sample-offer.pdf"}#toolbar=1&navpanes=0`}
                              title={offer.fileName || "Offer Letter"}
                              className="w-full h-full border-0"
                            />
                          </div>

                          <p className="text-muted-foreground font-mono text-[11px]">
                            Candidate: {offer.studentName} ({offer.rollNumber} • {offer.branch}) | Role: {offer.role} @ {offer.companyName} ({formatCTC(offer.packageLPA)})
                          </p>
                        </div>
                      )}

                      {/* Inline Verification Controls */}
                      <div className="pt-2 border-t border-border space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="flex-1">
                            <Input
                              placeholder="Add faculty remarks / verification notes..."
                              value={currentRemark}
                              onChange={(e) => handleRemarkChange(offer.id, e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={async () => {
                                await updateOfferStatus(offer.id, "declined");
                                setOfferLetters(prev => prev.map(o => o.id === offer.id ? { ...o, status: "declined" } : o));
                              }}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-success text-white hover:bg-success/90"
                              onClick={async () => {
                                await updateOfferStatus(offer.id, "verified");
                                setOfferLetters(prev => prev.map(o => o.id === offer.id ? { ...o, status: "verified" } : o));
                              }}
                            >
                              Approve & Verify
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
