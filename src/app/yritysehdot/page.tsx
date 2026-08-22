import { LegalPage } from "@/components/legal-page";
import { legalDocuments } from "@/lib/legal-documents";

export default function CompanyTermsPage() {
  return <LegalPage document={legalDocuments.yritysehdot} />;
}
