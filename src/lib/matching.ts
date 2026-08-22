import type { ConditionalCommitment, Offer, OfferAcceptance } from "./types";

export function calculateTotalPrice(productPrice: number, mandatoryFees = 0, deliveryPrice = 0) {
  return productPrice + mandatoryFees + deliveryPrice;
}

export function deliveredTotalPrice(offer: Pick<Offer, "price" | "delivery_price" | "total_price">) {
  return offer.total_price ?? offer.price + (offer.delivery_price ?? 0);
}

export function matchingTier(offer: Offer, acceptedCount: number) {
  return [...offer.tiers]
    .filter((tier) => acceptedCount >= tier.min_acceptances)
    .sort((a, b) => b.min_acceptances - a.min_acceptances)[0] ?? null;
}

export function evaluateConditionalMatch(commitment: ConditionalCommitment, offer: Offer, acceptedCount: number) {
  const tier = matchingTier(offer, acceptedCount);
  const totalPrice = tier ? calculateTotalPrice(tier.price, offer.mandatory_fees, offer.delivery_price ?? 0) : deliveredTotalPrice(offer);

  if (offer.valid_until && new Date(offer.valid_until) < new Date()) {
    return "expired" as const;
  }

  if (acceptedCount < offer.minimum_participants) {
    return "conditional_match" as const;
  }

  if (commitment.max_total_price !== null && totalPrice > commitment.max_total_price) {
    return "failed_threshold" as const;
  }

  if (commitment.max_monthly_price !== null && offer.price > commitment.max_monthly_price) {
    return "failed_threshold" as const;
  }

  if (commitment.max_contract_months !== null && offer.contract_length) {
    const months = Number.parseInt(offer.contract_length, 10);
    if (Number.isFinite(months) && months > commitment.max_contract_months) {
      return "failed_threshold" as const;
    }
  }

  if (commitment.delivery_required && offer.delivery_price === null) {
    return "failed_threshold" as const;
  }

  return "threshold_reached" as const;
}

export function canAutoApplyImprovedTier(acceptance: OfferAcceptance, oldOffer: Offer, newOffer: Offer) {
  if (!acceptance.allow_improved_offer_auto_apply) {
    return { allowed: false, reason: "Käyttäjä ei hyväksynyt automaattista parempaa hintaporrasta." };
  }

  if (oldOffer.product_or_service !== newOffer.product_or_service) {
    return { allowed: false, reason: "Tuote tai palvelu muuttui. Uusi hyväksyntä tarvitaan." };
  }

  if ((newOffer.delivery_price ?? 0) > (oldOffer.delivery_price ?? 0)) {
    return { allowed: false, reason: "Toimituskulut nousivat. Uusi hyväksyntä tarvitaan." };
  }

  if (oldOffer.delivery_method && newOffer.delivery_method && oldOffer.delivery_method !== newOffer.delivery_method) {
    return { allowed: false, reason: "Toimitustapa muuttui. Uusi hyväksyntä tarvitaan." };
  }

  if (oldOffer.contract_length && newOffer.contract_length && oldOffer.contract_length !== newOffer.contract_length) {
    const oldMonths = Number.parseInt(oldOffer.contract_length, 10);
    const newMonths = Number.parseInt(newOffer.contract_length, 10);
    if (Number.isFinite(oldMonths) && Number.isFinite(newMonths) && newMonths > oldMonths) {
      return { allowed: false, reason: "Sopimuskausi piteni. Uusi hyväksyntä tarvitaan." };
    }
  }

  if (newOffer.terms_version !== oldOffer.terms_version) {
    return { allowed: false, reason: "Myyjän ehtoversio muuttui. Uusi hyväksyntä tarvitaan." };
  }

  if (deliveredTotalPrice(newOffer) > acceptance.accepted_price) {
    return { allowed: false, reason: "Kokonaishinta nousi. Uusi hyväksyntä tarvitaan." };
  }

  return { allowed: true, reason: "Hinta laski tai pysyi samana eikä olennainen ehto heikentynyt." };
}

export function calculatePlatformCommission(finalPrice: number, model: "per_completed_customer" | "percentage_of_trade" | "fixed_campaign_fee", value: number) {
  if (model === "percentage_of_trade") {
    return Math.round(finalPrice * value) / 100;
  }
  return value;
}
