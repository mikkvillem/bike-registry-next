import type { Metadata } from "next";
import { LegalPlaceholder } from "@/app/legal-placeholder";

export const metadata: Metadata = {
  title: "Terms",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <LegalPlaceholder
      title="Terms of service"
      summary="Registrations are self-attested: nobody checks a receipt, and the
        same physical bike cannot be registered twice. A theft report is the
        owner's own claim, published by them and withdrawable by them."
    />
  );
}
