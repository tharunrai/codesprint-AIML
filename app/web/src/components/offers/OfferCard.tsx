"use client";

import { type OfferLetter } from "@/lib/types";
import { formatCTC } from "@/lib/utils";;
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
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">
              {offer.companyName}
            </h3>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              {formatCTC(offer.packageLPA)}
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {offer.role} • {offer.location}
          </p>
        </div>

        <OfferStatusBadge status={offer.status} />
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-background/50 p-3.5 rounded-xl border border-border/50">
        <div>
          <span className="text-muted-foreground block font-medium">Offer Date</span>
          <span className="font-bold text-foreground mt-0.5 block">{offerDateFormatted}</span>
        </div>
        <div>
          <span className="text-muted-foreground block font-medium">Joining Date</span>
          <span className="font-bold text-foreground mt-0.5 block">{joiningDateFormatted}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-muted-foreground block font-medium">Verification Status</span>
          <span className="font-bold text-foreground mt-0.5 block capitalize">
            {offer.fileName ? "Document Attached" : "Pending Upload"}
          </span>
        </div>
      </div>

      {/* Faculty Remarks if present */}
      {offer.remarks && (
        <div className={`p-3 rounded-xl border text-xs ${
          offer.status === "declined" ? "bg-danger/10 border-danger/30 text-danger" : "bg-warning/10 border-warning/30 text-warning"
        }`}>
          <span className="font-bold block">Faculty Remarks:</span>
          <p className="mt-0.5">{offer.remarks}</p>
        </div>
      )}

      {/* Offer Letter Upload Section */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
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
      </div>

      {/* Action Controls & Blockchain Stub */}
      <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3">
        {/* Blockchain stub */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-surface-hover/70 px-3 py-1.5 rounded-lg border border-border/60">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>🔗 Blockchain Verification — Coming Soon</span>
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
              className="bg-success text-white hover:bg-success/90"
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
