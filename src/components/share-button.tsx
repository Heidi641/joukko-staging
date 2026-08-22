"use client";

export function ShareButton({ title, count }: { title: string; count: number }) {
  async function share() {
    const text = `${count.toLocaleString("fi-FI")} ihmistä haluaa saman asian halvemmalla. Liity JOUKKOON.`;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    alert("Joukon linkki kopioitu.");
  }

  return <button className="button secondary" type="button" onClick={share}>Jaa</button>;
}
