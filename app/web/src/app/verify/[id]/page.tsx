import { getBundleVerificationDetails } from "@/app/actions/credentials";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ShieldCheck, FileCheck, XCircle, Clock, Link as LinkIcon, ExternalLink, GraduationCap, Award } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Verify Academic Credentials | PlaceMe CredChain",
  description: "Public verification page for student academic credential bundle anchored on blockchain",
};

export default async function PublicVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundleData = await getBundleVerificationDetails(id);

  if (!bundleData || !bundleData.student) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Bundle Not Found</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          The requested credential bundle could not be found or has been revoked.
        </p>
        <Link href="/" className="mt-6">
          <Button variant="secondary">Return to Home</Button>
        </Link>
      </div>
    );
  }

  const { student, credentials } = bundleData;
  const totalVerified = credentials.filter((c) => c.status === "VERIFIED").length;
  const isFullyVerified = credentials.length > 0 && totalVerified === credentials.length;

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

  const getBadgeVariant = (status: string): "success" | "danger" | "warning" | "default" => {
    switch (status) {
      case "VERIFIED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "warning";
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Brand */}
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold">PlaceMe CredChain</h1>
              <p className="text-xs text-muted-foreground">Public Academic Verification System</p>
            </div>
          </div>

          <Badge variant={isFullyVerified ? "success" : "info"}>
            {isFullyVerified ? "Official Verified Bundle" : `${totalVerified}/${credentials.length} Verified`}
          </Badge>
        </div>

        {/* Student Profile Overview */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 via-background to-accent/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.fullName}</h2>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                  <span>Roll No: <strong>{student.rollNumber}</strong></span>
                  <span>•</span>
                  <span>Branch: <strong>{student.branch}</strong></span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" /> Blockchain Verified Issuer
            </div>
          </div>
        </Card>

        {/* Bundled Credentials List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Verified Document Bundle ({credentials.length})
            </h3>
          </div>

          {credentials.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No documents uploaded to this bundle yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {credentials.map((cred) => (
                <Card key={cred.id} className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(cred.status)}
                      <h4 className="font-semibold text-base">
                        {cred.docType.replace("_", " ")}
                      </h4>
                    </div>
                    <Badge variant={getBadgeVariant(cred.status)}>
                      {cred.status}
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium">SHA-256 Hash:</span>
                      <p className="font-mono text-[11px] bg-muted/50 p-2 rounded border break-all">
                        {cred.fileHash}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium">On-Chain Reference:</span>
                      <p className="font-mono text-[11px] bg-muted/50 p-2 rounded border break-all">
                        {cred.eduId ? `EduID: ${cred.eduId}` : "Attestation Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Uploaded on: {new Date(cred.createdAt).toLocaleDateString()}
                    </span>

                    <a href={cred.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">
                        <LinkIcon className="w-3.5 h-3.5 mr-1" /> View Document <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
