import { signUpAction } from "@/lib/actions";

export default function RegisterPage() {
  return (
    <>
      <section className="page-title">
        <div>
          <h1>Rekisteröidy</h1>
          <p>Luo kuluttaja- tai yritystili. Yritystili vaatii myöhemmin varmennuksen ennen virallisia tarjouksia.</p>
        </div>
      </section>
      <form className="panel wizard" action={signUpAction}>
        <label>Rooli<select name="role" required><option value="consumer">Kuluttaja</option><option value="company">Yritys</option></select></label>
        <label>Nimi<input name="display_name" required /></label>
        <label>Sähköposti<input name="email" type="email" required /></label>
        <label>Salasana<input name="password" type="password" required /></label>
        <label>Yrityksen nimi, jos yritys<input name="company_name" /></label>
        <label>Y-tunnus, jos yritys<input name="business_id" /></label>
        <label className="check"><input type="checkbox" required /> Hyväksyn käyttöehdot version 0.1.0-draft.</label>
        <label className="check"><input type="checkbox" required /> Olen lukenut tietosuojaselosteen version 0.1.0-draft.</label>
        <p className="muted">Tuotantoversiossa hyväksyntään tallennetaan käyttäjä, dokumenttiversio, hyväksymisajankohta ja hyväksyntäkonteksti.</p>
        <button className="button" type="submit">Luo staging-tili</button>
      </form>
    </>
  );
}
