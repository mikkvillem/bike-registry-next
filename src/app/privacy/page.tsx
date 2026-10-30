import type { Metadata } from "next";
import { LegalPlaceholder } from "@/app/legal-placeholder";

export const metadata: Metadata = {
  title: "Privacy",
  // A placeholder shouldn't be indexed or shared as if it were the policy.
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <LegalPlaceholder
      title="Privacy"
      summary="A registration records the bike's details and a contact method for
        the owner. A theft report adds what happened and where. The public
        bike page shows the owner's contact only if they explicitly opted in
        when filing the report."
    />
  );
}
