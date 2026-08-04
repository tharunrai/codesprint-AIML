"use client";

import { type OfferLetter } from "@/lib/types";
import { formatCTC } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import OfferStatusBadge from "@/components/offers/OfferStatusBadge";
import OfferUploadSection from "@/components/offers/OfferUploadSection";

interface OfferCardProps {
  offer: OfferLetter;
  onUpdate?: (offerId: string, updates: Partial<OfferLetter>) => void;
  onUpload?: (offerId: string, fileName: string, fileSize: string) => void;
  onDelete?: (offerId: string) => void;
}

export default function OfferCard({
  offer,
  onUpdate,
  onUpload,
  onDelete,
}: OfferCardProps) {
  const offerDateFormatted = new Date(offer.offerDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const joiningDateFormatted = offer.joiningDate
    ? new Date(offer.joiningDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  return (
    <Card className="space-y-5">
      {/* Top Title & Status Row */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-foreground pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">
              {offer.companyName}
            </h3>
            <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 border border-foreground">
              {formatCTC(offer.packageLPA)}
            </span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            {offer.role} • {offer.location}
          </p>
        </div>

        <OfferStatusBadge status={offer.status} />
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-surface p-3.5 border-2 border-foreground">
        <div>
          <span className="text-muted-foreground block font-bold">Offer Date</span>
          <span className="font-bold text-foreground mt-0.5 block">{offerDateFormatted}</span>
        </div>
        <div>
          <span className="text-muted-foreground block font-bold">Joining Date</span>
          <span className="font-bold text-foreground mt-0.5 block">{joiningDateFormatted}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-muted-foreground block font-bold">Verification Status</span>
          <span className="font-bold text-foreground mt-0.5 block capitalize">
            {offer.fileName ? "Document Attached" : "Pending Upload"}
          </span>
        </div>
      </div>

      {/* Faculty Remarks if present */}
      {offer.remarks && (
        <div className={`p-3 border-2 border-foreground text-xs ${
          offer.status === "declined" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
        }`}>
          <span className="font-bold block">Faculty Remarks:</span>
          <p className="mt-0.5">{offer.remarks}</p>
        </div>
      )}

      {/* Offer Letter Upload & Document Section */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">
          Offer Document & Attestation
        </span>
        {onUpload && onDelete && offer.status !== "declined" && (
          <OfferUploadSection
            offerId={offer.id}
            currentFile={offer.fileName}
            currentFileSize={offer.fileSize}
            uploadedAt={offer.uploadedAt}
            onUpload={onUpload}
            onDelete={onDelete}
          />
        )}

        {/* Embedded Live PDF Viewer for Student (Arjun's Offer Section) */}
        {offer.fileUrl && (
          <div className="p-4 rounded-none bg-surface border-2 border-foreground space-y-3 text-xs">
            <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
              <span className="font-bold text-sm text-foreground">
                📄 Verified Offer Document: {offer.fileName || "techcorp_offer_letter.pdf"}
              </span>
              <a
                href={offer.fileUrl || "/sample-offer.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                Open Fullscreen ↗
              </a>
            </div>
            <div className="relative w-full h-[380px] border-2 border-foreground bg-slate-900 shadow-[4px_4px_0px_0px_var(--foreground)] overflow-hidden">
              <iframe
                src={`${offer.fileUrl || "/sample-offer.pdf"}#toolbar=1&navpanes=0`}
                title={offer.fileName || "Offer Letter"}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Controls & Blockchain Stub */}
      <div className="pt-2 border-t-2 border-foreground flex flex-wrap items-center justify-between gap-3">
        {/* Blockchain stub */}
        <div className="flex items-center gap-2 text-[11px] text-foreground font-semibold bg-surface px-3 py-1.5 border border-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>🔗 Blockchain Verification — Verified</span>
        </div>

        {/* Accept / Decline actions */}
        {offer.status === "verified" && onUpdate && (
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => onUpdate(offer.id, { status: "declined" })}
            >
              Decline Offer
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-success text-black border-2 border-foreground hover:bg-success/90"
              onClick={() => onUpdate(offer.id, { status: "accepted" })}
            >
              Accept Offer
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
