import { LegalPage } from "@/components/legal-page";
import { legalDocuments } from "@/lib/legal-documents";

export default function CookiesPage() {
  return <LegalPage document={legalDocuments.evasteet} />;
}
