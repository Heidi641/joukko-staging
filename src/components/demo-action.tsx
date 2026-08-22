"use client";

import { useState } from "react";

type DemoActionProps = {
  label: string;
  doneLabel: string;
  storageKey: string;
  variant?: "primary" | "secondary";
};

export function DemoAction({ label, doneLabel, storageKey, variant = "primary" }: DemoActionProps) {
  const [done, setDone] = useState(false);

  return (
    <div className="demo-action">
      <button
        className={variant === "secondary" ? "button secondary" : "button"}
        type="button"
        onClick={() => {
          window.localStorage.setItem(storageKey, new Date().toISOString());
          setDone(true);
        }}
      >
        {label}
      </button>
      {done && <p className="success">{doneLabel}</p>}
    </div>
  );
}
