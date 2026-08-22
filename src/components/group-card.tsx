import Link from "next/link";
import type { Group } from "@/lib/types";
import { ProgressBar } from "./progress";

export function GroupCard({ group }: { group: Group }) {
  return (
    <article className="card group-card">
      <div className="card-top">
        <span className="icon">{group.category_icon}</span>
        <span className="pill">{group.category_name}</span>
      </div>
      <h3>{group.name}</h3>
      <p>{group.description}</p>
      <strong className="big">{group.member_count.toLocaleString("fi-FI")} mukana</strong>
      <ProgressBar count={group.member_count} target={group.target_count} />
      <p className="muted">
        {group.committed_count.toLocaleString("fi-FI")} ehdollisesti sitoutunut · {group.ready_now_count.toLocaleString("fi-FI")} voi toteuttaa nyt
      </p>
      <p className="muted">{group.area ?? "Valtakunnallinen"} · {group.offer_count} yritystarjousta</p>
      <Link className="button secondary" href={`/joukot/${group.id}`}>Avaa Joukko</Link>
    </article>
  );
}
