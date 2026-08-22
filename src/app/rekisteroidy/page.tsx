export default function RegisterPage() {
  return (
    <>
      <section className="page-title">
        <div>
          <h1>Rekisteröidy</h1>
          <p>Luo kuluttaja- tai yritystili. Yritystili vaatii myöhemmin varmennuksen ennen virallisia tarjouksia.</p>
        </div>
      </section>
      <form className="panel wizard">
        <label>Rooli<select required><option>Kuluttaja</option><option>Yritys</option></select></label>
        <label>Nimi<input required /></label>
        <label>Sähköposti<input type="email" required /></label>
        <label>Salasana<input type="password" required /></label>
        <label>Yrityksen nimi, jos yritys<input /></label>
        <label>Y-tunnus, jos yritys<input /></label>
        <label className="check"><input type="checkbox" required /> Hyväksyn käyttöehdot version 0.1.0-draft.</label>
        <label className="check"><input type="checkbox" required /> Olen lukenut tietosuojaselosteen version 0.1.0-draft.</label>
        <p className="muted">Tuotantoversiossa hyväksyntään tallennetaan käyttäjä, dokumenttiversio, hyväksymisajankohta ja hyväksyntäkonteksti.</p>
        <button className="button" type="button">Luo tili demo</button>
      </form>
    </>
  );
}
