"use client";

import { useState } from "react";
import { testAccounts } from "@/lib/staging";

export function DemoLogin() {
  const [role, setRole] = useState<string | null>(null);

  return (
    <section className="panel wizard">
      <h2>Staging-demo kirjautuminen</h2>
      <p className="muted">Valitse testirooli. Tämä ei käytä oikeaa salasanaa, asiakasdataa tai Supabase Authia.</p>
      <div className="actions">
        {testAccounts.map((account) => (
          <button
            className="button secondary"
            key={account.email}
            type="button"
            onClick={() => {
              window.localStorage.setItem("joukko-demo-role", account.role);
              setRole(account.role);
            }}
          >
            {account.role}
          </button>
        ))}
      </div>
      {role && <p className="success">Kirjauduttu staging-demoon roolilla: {role}</p>}
    </section>
  );
}
