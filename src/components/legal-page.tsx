import type { LegalDocument } from "@/lib/types";

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <section className="page-title">
        <div>
          <h1>{document.title}</h1>
          <p>Versio {document.version} · voimaantulo {document.effectiveDate} · päivitetty {document.updatedAt}</p>
        </div>
      </section>
      <section className="grid two">
        {document.sections.map((section, index) => (
          <article className="card" key={section.title}>
            <span className="pill">{index + 1}</span>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
