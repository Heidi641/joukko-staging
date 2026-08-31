"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isProductionRelease } from "./staging";
import { createSupabaseServerClient } from "./supabase";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const parsed = Number(value(formData, key).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

async function currentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase puuttuu ympäristöstä.");
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/kirjaudu");
  return { supabase, user: data.user };
}

async function currentAdmin() {
  const session = await currentUser();
  const { data: profile } = await session.supabase.from("profiles").select("role").eq("id", session.user.id).single();
  if (profile?.role !== "admin") redirect("/minun?virhe=ei_admin");
  return session;
}

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase ei ole käytössä.");

  const { error } = await supabase.auth.signInWithPassword({
    email: value(formData, "email"),
    password: value(formData, "password")
  });

  if (error) redirect("/kirjaudu?virhe=1");
  redirect("/minun");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function signUpAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase ei ole käytössä.");

  const email = value(formData, "email");
  const displayName = value(formData, "display_name");
  const termsVersion = value(formData, "terms_version");
  const privacyVersion = value(formData, "privacy_version");
  const aiNoticeVersion = value(formData, "ai_notice_version");

  if (formData.get("accept_terms") !== "on" || formData.get("accept_privacy") !== "on" || formData.get("accept_ai_notice") !== "on") {
    redirect("/rekisteroidy?virhe=ehdot");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: value(formData, "password"),
    options: { data: { display_name: displayName, role: "consumer" } }
  });

  if (error || !data.user) redirect("/rekisteroidy?virhe=1");
  const userId = data.user.id;

  await supabase.from("profiles").upsert({
    id: userId,
    role: "consumer",
    display_name: displayName || email,
    buyer_company_name: value(formData, "buyer_company_name") || null,
    buyer_business_id: value(formData, "buyer_business_id") || null,
    terms_version: termsVersion,
    privacy_version: privacyVersion,
    ai_notice_version: aiNoticeVersion,
    terms_accepted_at: new Date().toISOString(),
    privacy_accepted_at: new Date().toISOString(),
    ai_notice_accepted_at: new Date().toISOString(),
    marketing_consent: formData.get("marketing_consent") === "on"
  });

  const { data: docs } = await supabase
    .from("legal_documents")
    .select("id, slug")
    .in("slug", ["kayttoehdot", "tietosuoja", "tekoaly"]);
  const acceptances = (docs ?? []).map((doc) => ({
    profile_id: userId,
    document_id: doc.id,
    acceptance_context: `registration:${doc.slug}`
  }));
  if (acceptances.length > 0) await supabase.from("legal_acceptances").upsert(acceptances, { onConflict: "profile_id,document_id,acceptance_context" });

  redirect("/minun");
}

export async function createCompanyProfileAction(formData: FormData) {
  const { supabase, user } = await currentUser();
  const companyName = value(formData, "company_name");
  const businessId = value(formData, "business_id");
  const contactEmail = value(formData, "contact_email") || user.email || "";

  if (!companyName || !businessId || !contactEmail) redirect("/yritys?virhe=yritystiedot");

  const { data: company } = await supabase.from("companies").insert({
    owner_id: user.id,
    name: companyName,
    business_id: businessId,
    email: contactEmail,
    contact_email: contactEmail,
    customer_service_contact: value(formData, "customer_service_contact") || contactEmail,
    verification_status: "pending_verification",
    commission_agreement_status: "pending_admin_review",
    billing_setup_status: "not_ready",
    admin_review_status: "pending"
  }).select("id").single();

  if (company?.id) {
    await supabase.from("reports").insert({
      reporter_id: user.id,
      entity_type: "company",
      entity_id: company.id,
      reason: "Uusi yritys odottaa admin-tarkistusta: varmennus, palkkiomalli ja laskutusportti ennen tarjousten julkaisua.",
      status: "open"
    });
  }

  revalidatePath("/yritys");
  redirect("/yritys?yritysprofiili=luotu");
}

export async function joinGroupAction(formData: FormData) {
  const { supabase, user } = await currentUser();
  const groupId = value(formData, "group_id");

  await supabase.from("group_members").upsert({
    group_id: groupId,
    profile_id: user.id,
    status: "active",
    postal_code: value(formData, "postal_code") || null,
    contract_status: value(formData, "contract_status") || "unknown",
    contract_ends_at: value(formData, "contract_ends_at") || null
  }, { onConflict: "group_id,profile_id" });

  revalidatePath(`/joukot/${groupId}`);
  redirect(`/joukot/${groupId}?liitytty=1`);
}

export async function createGroupAction(formData: FormData) {
  const { supabase, user } = await currentUser();
  const name = value(formData, "name");
  const exact = value(formData, "group_type") === "exact";
  const slug = `${slugify(name)}-${Date.now().toString(36)}`;
  const categoryId = value(formData, "category_id");
  const { data: category } = await supabase
    .from("categories")
    .select("id, active")
    .eq("id", categoryId)
    .eq("active", true)
    .single();
  if (!category) redirect("/perusta?virhe=kategoria");

  const { data, error } = await supabase
    .from("groups")
    .insert({
      founder_id: user.id,
      category_id: categoryId,
      group_type: exact ? "exact" : "open",
      name,
      slug,
      want_summary: name,
      description: value(formData, "description") || `Ihmiset haluavat ${name}.`,
      detail_note: value(formData, "detail_note") || null,
      terms: [value(formData, "detail_note") || "Tarve tarkentuu Joukon kasvaessa"],
      area: value(formData, "area") || "Suomi",
      target_count: numberValue(formData, "target_count", 100),
      brand: value(formData, "brand") || null,
      model: value(formData, "model") || null,
      model_code: value(formData, "model_code") || null,
      status: "pending"
    })
    .select("id")
    .single();

  if (error || !data) redirect("/perusta?virhe=1");
  redirect(`/joukot/${data.id}`);
}

export async function createOfferAction(formData: FormData) {
  const { supabase, user } = await currentUser();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, business_id, contact_email, email, customer_service_contact, home_country, verification_status, commission_agreement_status, billing_setup_status")
    .eq("owner_id", user.id)
    .eq("verification_status", "verified")
    .eq("commission_agreement_status", "accepted")
    .eq("billing_setup_status", "ready")
    .limit(1)
    .single();
  if (!company) redirect("/yritys?virhe=yritys");

  const groupId = value(formData, "group_id");
  const { data: group } = await supabase
    .from("groups")
    .select("id, group_type, brand, model_code, categories!inner(id, slug, active, regulated, commission_model, commission_value, commission_terms_version)")
    .eq("id", groupId)
    .single();
  if (!group) redirect("/yritys?virhe=joukko");
  const category = Array.isArray(group.categories) ? group.categories[0] : group.categories;
  if (!category?.active) redirect("/yritys?virhe=kategoria");
  if (isProductionRelease && category.regulated) redirect("/yritys?virhe=regulated");
  if (formData.get("accept_commission") !== "on") redirect("/yritys?virhe=palkkio_hyvaksyttava");
  if (!category.commission_model || category.commission_model === "manual_review_required" || category.commission_value == null) {
    redirect("/yritys?virhe=palkkio_puuttuu");
  }

  if (group.group_type === "exact") {
    const exactBrand = String(group.brand ?? "").trim().toLowerCase();
    const exactModelCode = String(group.model_code ?? "").trim().toLowerCase();
    const offeredBrand = value(formData, "brand").toLowerCase();
    const offeredModelCode = value(formData, "model_code").toLowerCase();
    if ((exactBrand && offeredBrand !== exactBrand) || (exactModelCode && offeredModelCode !== exactModelCode)) {
      redirect("/yritys?virhe=exact");
    }
  }

  const { count } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId)
    .eq("company_id", company.id)
    .eq("status", "active");

  if ((count ?? 0) >= 6) redirect("/yritys?virhe=tarjousraja");

  const { data: offer, error } = await supabase
    .from("offers")
    .insert({
      group_id: groupId,
      company_id: company.id,
      status: "active",
      current_version: 1,
      closes_at: value(formData, "valid_until") ? `${value(formData, "valid_until")}T23:59:59+02:00` : null,
      max_acceptances: numberValue(formData, "max_acceptances") || null,
      stock_limit: numberValue(formData, "stock_limit") || null,
      unlimited_until_close: formData.get("unlimited_until_close") === "on"
    })
    .select("id")
    .single();

  if (error || !offer) redirect("/yritys?virhe=tarjous");

  const price = numberValue(formData, "price");
  const fees = numberValue(formData, "mandatory_fees");
  const delivery = numberValue(formData, "delivery_price");
  const termsText = value(formData, "terms_text");

  const { data: version } = await supabase
    .from("offer_versions")
    .insert({
      offer_id: offer.id,
      version: 1,
      product_or_service: value(formData, "product_or_service"),
      title: value(formData, "title"),
      description: value(formData, "description"),
      brand: value(formData, "brand") || null,
      model: value(formData, "model") || null,
      model_code: value(formData, "model_code") || null,
      price,
      product_price: price,
      mandatory_fees: fees,
      normal_price: numberValue(formData, "normal_price") || null,
      estimated_saving: numberValue(formData, "estimated_saving") || null,
      delivery_price: delivery,
      shipping_price: delivery,
      delivery_method: value(formData, "delivery_method") || "Myyjän ilmoittama",
      delivery_time: value(formData, "delivery_time") || null,
      fulfillment_start_type: value(formData, "fulfillment_start_type") || "after_offer_closes",
      fulfillment_start_date: value(formData, "fulfillment_start_date") || null,
      fulfillment_end_date: value(formData, "fulfillment_end_date") || null,
      delivery_days_min: numberValue(formData, "delivery_days_min") || null,
      delivery_days_max: numberValue(formData, "delivery_days_max") || null,
      fulfillment_note: value(formData, "fulfillment_note") || null,
      max_acceptances: numberValue(formData, "max_acceptances") || null,
      stock_limit: numberValue(formData, "stock_limit") || null,
      unlimited_until_close: formData.get("unlimited_until_close") === "on",
      minimum_participants: numberValue(formData, "minimum_participants", 1),
      contract_length: value(formData, "contract_length") || null,
      vat_status: value(formData, "vat_status") || "Sisältää ALV:n",
      commission_type: category.commission_model,
      commission_value: category.commission_value,
      commission_currency: "EUR",
      commission_terms_version: category.commission_terms_version || "category-commission-v1",
      commission_terms_accepted_by_company_at: new Date().toISOString(),
      terms_type: "text",
      terms_text: termsText,
      terms_version: value(formData, "terms_version") || `terms-${Date.now()}`,
      terms: termsText || "Myyjän ehdot puuttuvat: LEGAL_REVIEW_REQUIRED",
      valid_until: value(formData, "valid_until") || null,
      accepted_by_company_at: new Date().toISOString(),
      starts_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      requirement_match: value(formData, "requirement_match") || "company_confirmed",
      category_match: value(formData, "category_match") || "company_confirmed",
      comparison_fields: Object.fromEntries(
        [...formData.entries()]
          .filter(([key, entry]) => key.startsWith("comparison_") && String(entry).trim().length > 0)
          .map(([key, entry]) => [key.slice("comparison_".length), String(entry).trim()])
      ),
      public_company_name: company.name,
      public_company_business_id: company.business_id,
      public_company_contact: company.customer_service_contact || company.contact_email || company.email,
      public_company_country: company.home_country || "FI",
      public_company_verification_status: company.verification_status || "unverified"
    })
    .select("id")
    .single();

  if (version) {
    const tierRows = (value(formData, "tiers") || "100=599\n500=559\n1000=529")
      .split(/\r?\n/)
      .map((row) => row.split(/[=→]/).map((part) => part.trim()))
      .filter(([min, tierPrice]) => Number(min) > 0 && Number(tierPrice?.replace(",", ".")) > 0)
      .map(([min, tierPrice]) => ({
        offer_version_id: version.id,
        min_acceptances: Number(min),
        price: Number(tierPrice.replace(",", ".")),
        label: `${min} hyväksyjää -> ${tierPrice} €`
      }));

    if (tierRows.length > 0) await supabase.from("offer_price_tiers").insert(tierRows);
  }

  revalidatePath(`/joukot/${groupId}`);
  redirect(`/joukot/${groupId}`);
}

export async function acceptOfferAction(formData: FormData) {
  const { supabase, user } = await currentUser();
  const groupId = value(formData, "group_id");
  const offerId = value(formData, "offer_id");
  const offerVersionId = value(formData, "offer_version_id");

  const { data: offerVersion } = await supabase
    .from("offer_versions")
    .select("id, offer_id, valid_until, max_acceptances, stock_limit, unlimited_until_close, fulfillment_start_type, fulfillment_start_date, fulfillment_end_date, delivery_days_min, delivery_days_max, fulfillment_note, terms_version, offers!inner(status)")
    .eq("id", offerVersionId)
    .single();

  const joinedOffer = offerVersion?.offers as { status?: string } | { status?: string }[] | undefined;
  const offerStatus = Array.isArray(joinedOffer) ? joinedOffer[0]?.status : joinedOffer?.status;
  if (!offerVersion || !["active", "published"].includes(String(offerStatus))) redirect(`/joukot/${groupId}?virhe=tarjous_suljettu`);

  if (offerVersion.valid_until && new Date(`${offerVersion.valid_until}T23:59:59`) < new Date()) {
    await supabase.from("offers").update({ status: "closed_to_new", closed_at: new Date().toISOString() }).eq("id", offerId);
    redirect(`/joukot/${groupId}?virhe=tarjous_suljettu`);
  }

  const { count: acceptedCount } = await supabase
    .from("offer_acceptances")
    .select("id", { count: "exact", head: true })
    .eq("offer_version_id", offerVersionId)
    .in("status", ["accepted", "auto_improved", "confirmed", "completed"]);

  const capacity = offerVersion.unlimited_until_close ? null : (offerVersion.max_acceptances ?? offerVersion.stock_limit);
  if (capacity && (acceptedCount ?? 0) >= capacity) redirect(`/joukot/${groupId}?virhe=kapasiteetti_taynna`);

  if (formData.get("data_sharing_consent") !== "on") redirect(`/joukot/${groupId}?virhe=tietojenluovutus`);

  await supabase.from("offer_acceptances").upsert({
    offer_id: offerId,
    offer_version_id: offerVersionId,
    company_id: value(formData, "company_id"),
    profile_id: user.id,
    accepted_price: numberValue(formData, "accepted_price"),
    current_price: numberValue(formData, "current_price"),
    maximum_accepted_price: numberValue(formData, "accepted_price"),
    terms_version: value(formData, "terms_version"),
    allow_improved_offer_auto_apply: formData.get("allow_auto_apply") === "on",
    status: "accepted",
    acceptance_snapshot: {
      product_or_service: value(formData, "product_or_service"),
      total_price: numberValue(formData, "current_price"),
      seller_terms: value(formData, "terms_version"),
      data_sharing_consent_version: "data-sharing-v1",
      fulfillment: {
        fulfillment_start_type: offerVersion.fulfillment_start_type,
        fulfillment_start_date: offerVersion.fulfillment_start_date,
        fulfillment_end_date: offerVersion.fulfillment_end_date,
        delivery_days_min: offerVersion.delivery_days_min,
        delivery_days_max: offerVersion.delivery_days_max,
        fulfillment_note: offerVersion.fulfillment_note
      },
      legal_note: "JOUKKO on alusta. Myyjä vastaa kaupasta ja ehdoista."
    }
  }, { onConflict: "offer_version_id,profile_id" });

  revalidatePath(`/joukot/${groupId}`);
  redirect(`/minun?hyvaksytty=1`);
}

export async function approveGroupAction(formData: FormData) {
  const { supabase } = await currentAdmin();
  await supabase.from("groups").update({ status: "active" }).eq("id", value(formData, "group_id"));
  revalidatePath("/admin");
}

export async function selectWinningOfferAction(formData: FormData) {
  const { supabase } = await currentAdmin();
  const groupId = value(formData, "group_id");
  const offerId = value(formData, "offer_id");
  const { error } = await supabase.rpc("finalize_offer_competition", { p_group_id: groupId, p_winning_offer_id: offerId });
  if (error) redirect("/admin?virhe=kilpailun_paattaminen");
  revalidatePath("/admin");
  revalidatePath(`/joukot/${groupId}`);
}

export async function approveCompanyAction(formData: FormData) {
  const { supabase } = await currentAdmin();
  await supabase.from("companies").update({
    verification_status: "verified",
    commission_agreement_status: "accepted",
    commission_agreement_accepted_at: new Date().toISOString(),
    billing_setup_status: "ready",
    billing_setup_ready_at: new Date().toISOString(),
    admin_review_status: "approved",
    admin_review_note: value(formData, "admin_review_note") || "Staging-hyväksyntä; live Stripe ei ole käytössä."
  }).eq("id", value(formData, "company_id"));
  revalidatePath("/admin");
}
