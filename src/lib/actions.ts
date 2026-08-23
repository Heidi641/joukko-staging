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

  const requestedRole = value(formData, "role");
  const role = requestedRole === "company" ? "company" : "consumer";
  const email = value(formData, "email");
  const displayName = value(formData, "display_name");

  const { data, error } = await supabase.auth.signUp({
    email,
    password: value(formData, "password"),
    options: { data: { display_name: displayName, role } }
  });

  if (error || !data.user) redirect("/rekisteroidy?virhe=1");

  await supabase.from("profiles").upsert({
    id: data.user.id,
    role,
    display_name: displayName || email
  });

  if (role === "company") {
    const companyName = value(formData, "company_name");
    const businessId = value(formData, "business_id");
    if (!companyName || !businessId) redirect("/rekisteroidy?virhe=yritystiedot");

    await supabase.from("companies").insert({
      owner_id: data.user.id,
      name: companyName,
      business_id: businessId,
      email,
      contact_email: email,
      customer_service_contact: email,
      verification_status: "unverified"
    });
  }

  redirect("/minun");
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
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "company") redirect("/yritys?virhe=rooli");

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, business_id, contact_email, email, customer_service_contact, home_country, verification_status")
    .eq("owner_id", user.id)
    .eq("verification_status", "verified")
    .limit(1)
    .single();
  if (!company) redirect("/yritys?virhe=yritys");

  const groupId = value(formData, "group_id");
  const { data: group } = await supabase
    .from("groups")
    .select("id, group_type, brand, model_code, categories!inner(id, active, regulated)")
    .eq("id", groupId)
    .single();
  if (!group) redirect("/yritys?virhe=joukko");
  const category = Array.isArray(group.categories) ? group.categories[0] : group.categories;
  if (!category?.active) redirect("/yritys?virhe=kategoria");
  if (isProductionRelease && category.regulated) redirect("/yritys?virhe=regulated");

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
    .insert({ group_id: groupId, company_id: company.id, status: "active", current_version: 1 })
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
      minimum_participants: numberValue(formData, "minimum_participants", 1),
      contract_length: value(formData, "contract_length") || null,
      vat_status: value(formData, "vat_status") || "Sisältää ALV:n",
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
      comparison_fields: {
        warranty: value(formData, "warranty_terms"),
        availability: value(formData, "availability")
      },
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

  await supabase.from("offer_acceptances").upsert({
    offer_id: value(formData, "offer_id"),
    offer_version_id: value(formData, "offer_version_id"),
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
      legal_note: "JOUKKO on alusta. Myyjä vastaa kaupasta ja ehdoista."
    }
  }, { onConflict: "offer_version_id,profile_id" });

  revalidatePath(`/joukot/${groupId}`);
  redirect(`/minun?hyvaksytty=1`);
}

export async function approveGroupAction(formData: FormData) {
  const { supabase } = await currentUser();
  await supabase.from("groups").update({ status: "active" }).eq("id", value(formData, "group_id"));
  revalidatePath("/admin");
}
