import Link from "next/link";
import { launchPilots, phaseLabel } from "@/lib/launch-pilots";
import type { PilotPhase } from "@/lib/launch-pilots";

export const metadata = {
  title: "JOUKKO | Valmisteltavat yhteisostokampanjat",
  description: "Näe mitä JOUKOSSA voidaan kilpailuttaa ja miten osallistuminen sekä yrityksen palkkio toimisivat."
};

const phases: PilotPhase[] = ["aloitus", "seuraava", "kumppanihaku"];
export default function CampaignsPage() {
  return (
    <>
      <section className="page-title">
        <div>
          <p className="kicker">JOUKKO / Uudet kampanjat</p>
          <h1>Mitä ostaisimme edullisemmin yhdessä?</h1>
          <p>Tässä ovat valmisteltavat ostotoiveet. Nämä eivät ole oikeita tarjouksia eikä mukanaolijoita ole laskettu kuvitteellisesti.</p>
        </div>
      </section>
      <section className="grid two">
        <article className="panel">
          <h2>Ostajille</h2>
          <p>Haluatko parempaa hintaa? Valitse kiinnostava kampanja, ilmoita ostotoiveesi ja vertaile tulevia oikeita tarjouksia. Kiinnostus ei sido.</p>
          <Link className="button" href="/perusta">Haluan ostaa</Link>
        </article>
        <article className="panel">
          <h2>Yrityksille ja valtuutetuille myyjille</h2>
          <p>Tarjoa oman yrityksesi kanssa sovitun myyntialueen ja valtuuksien mukaisesti. Jos osallistuminen edellyttää keskitettyä hyväksyntää, kumppanuus tehdään yrityksen kanssa.</p>
          <Link className="button" href="/yritys">Haluan tarjota</Link>
        </article>
      </section>
      <section className="panel">
        <h2>Selkeä toimintatapa</h2>
        <p><strong>Asiakkaalle maksuton.</strong> Kiinnostus ei ole ostositoumus. Yritykset tekevät tarjoukset ja ilmoittavat kokonaishinnat. Asiakas hyväksyy tarjouksen erikseen ja tekee lopullisen sopimuksen myyjän kanssa.</p>
        <p>JOUKON tulot: yritys maksaa vain toteutuneesta ja vahvistetusta kaupasta etukäteen sovitun palkkion. Palkkio ei tule asiakkaalle erillisenä lisämaksuna. Alla on valmisteltu ehdotushinnasto; se ei ole vielä hyväksytty yrityssopimus.</p>
        <p>Normaali kampanjarytmi: kiinnostuksen keruu 7–21 päivää, isot hankinnat 30–60 päivää, yritysten tarjoukset 7–14 päivää ja asiakkaan oma hyväksyntä vähintään 72 tunnin aikana; autoissa ja talopaketeissa vähintään 7 päivää.</p>
      </section>
      <section className="panel">
        <h2>Isot ja pienet kaupat – palkkio suhteutetaan kauppaan</h2>
        <p>Ei yleistä 300 euron ylärajaa. Esimerkkejä ehdotetusta yrityshinnoittelusta: 800 €:n verottomasta puhelimesta 3 % eli 24 €, 40 000 €:n verottomasta autosta 1 % eli 400 € ja 240 000 €:n verottomasta rajatusta talopakettitoimituksesta 0,75 % eli 1 800 €. Provisiolaskuun lisätään soveltuva arvonlisävero.</p>
        <p>Nämä ovat esimerkkilaskelmia, eivät lupauksia myyntimääristä tai yritysten hyväksymiä sopimuksia. Kukin yritys hyväksyy nimenomaisesti kampanjakohtaisen palkkion ennen osallistumista.</p>
        <p><Link href="/vastuut">Katso selkeä vastuunjako, kaupan syntymisen ehdot ja rahaliikenne</Link>.</p>
      </section>
            {phases.map(phase => (
        <section key={phase}>
          <div className="section-head"><h2>{phaseLabel[phase]}</h2></div>
          <div className="grid">
            {launchPilots.filter(pilot => pilot.phase === phase).map(pilot => (
              <article className="card" key={pilot.slug} id={pilot.slug}>
                <span className="pill">{pilot.segment} · {pilot.location}</span>
                <h3>{pilot.name}</h3>
                <p className="muted">Kiinnostusikkuna: {pilot.interestDays} päivää · {pilot.target}</p>
                <h4>Mitä kilpailutetaan?</h4>
                <ul>{pilot.specification.map(item => <li key={item}>{item}</li>)}</ul>
                <h4>Millä yritykset vertaillaan?</h4>
                <ul>{pilot.compare.map(item => <li key={item}>{item}</li>)}</ul>
                <p><strong>Ehdotettu yrityksen maksettava palkkio:</strong> {pilot.fee}</p>
                {pilot.note && <p className="warning">{pilot.note}</p>}
                <div className="actions">
                  <Link className="button secondary" href={`/perusta?nimi=${encodeURIComponent(pilot.name)}`}>Ehdota / aloita Joukko</Link>
                  <Link className="button secondary" href="/yritys">Olen yritys</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      <section className="panel">
        <h2>Ei näennäistarjouksia tai pakkomaksuja</h2>
        <p>Markkinointiin siirrytään vasta, kun testidata on erotettu oikeista kampanjoista, yritys- ja kuluttajaehdot on tarkistettu ja ensimmäiset oikeat yhteistyöyritykset hyväksyvät palkkioehdot. Säänneltyjen palvelujen sitova kilpailutus aktivoidaan vasta toimialakohtaisen tarkistuksen jälkeen.</p>
        <Link className="button" href="/ota-yhteytta">Ota yhteyttä</Link>
      </section>
    </>
  );
}
