"use client";

import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import OfferCard from "@/components/offers/OfferCard";

export default function StudentOffersPage() {
  const { user } = useAuth();
  const {
    offerLetters,
    uploadOffer,
    updateOffer,
    deleteOffer,
  } = usePlacement();

  // Filter offers for logged-in student
  const studentOffers = offerLetters.filter(
    (off) => user && off.studentId === user.id
  );

  return (
    <>
      <Header
        title="My Offer Letters"
        subtitle="Manage extended job offers, upload official offer documents, and submit acceptances"
      />

      <div className="p-6 space-y-6">
        {studentOffers.length === 0 ? (
          <Card className="py-16 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                No offers received yet.
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                When a campus recruiter extends an offer letter, it will appear here for your review and document upload.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {studentOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onUpdate={(id, updates) => updateOffer(id, updates)}
                onUpload={(id, file, size) => uploadOffer(id, file, size)}
                onDelete={(id) => deleteOffer(id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
