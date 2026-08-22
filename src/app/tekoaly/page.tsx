import { LegalPage } from "@/components/legal-page";
import { legalDocuments } from "@/lib/legal-documents";

export default function AiPage() {
  return <LegalPage document={legalDocuments.tekoaly} />;
}
