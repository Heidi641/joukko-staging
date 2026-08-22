import { LegalPage } from "@/components/legal-page";
import { legalDocuments } from "@/lib/legal-documents";

export default function TermsPage() {
  return <LegalPage document={legalDocuments.kayttoehdot} />;
}
