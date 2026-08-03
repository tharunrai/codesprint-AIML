"use client";

import Badge from "@/components/ui/Badge";
import { type OfferStatus } from "@/lib/mock-data";

interface OfferStatusBadgeProps {
  status: OfferStatus;
  size?: "sm" | "md";
}

export default function OfferStatusBadge({
  status,
  size = "md",
}: OfferStatusBadgeProps) {
  const variantMap: Record<
    OfferStatus,
    "warning" | "info" | "danger" | "success"
  > = {
    received: "warning",
    uploaded: "info",
    verified: "success",
    accepted: "success",
    declined: "danger",
  };

  const labelMap: Record<OfferStatus, string> = {
    received: "Offer Received",
    uploaded: "Offer Uploaded",
    verified: "Verified",
    accepted: "Accepted",
    declined: "Declined",
  };

  return (
    <Badge variant={variantMap[status]} size={size} dot>
      {labelMap[status]}
    </Badge>
  );
}
