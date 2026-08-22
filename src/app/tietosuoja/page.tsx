import { LegalPage } from "@/components/legal-page";
import { legalDocuments } from "@/lib/legal-documents";

export default function PrivacyPage() {
  return <LegalPage document={legalDocuments.tietosuoja} />;
}
