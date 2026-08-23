import { categories as demoCategories, groups as demoGroups, metrics as demoMetrics, offers as demoOffers } from "./demo-data";
import { createSupabaseServerClient } from "./supabase";
import { isProductionRelease, isStaging } from "./staging";
import type { Category, Group, Metrics, Offer } from "./types";

const zeroMetrics: Metrics = { uniqueUsers: 0, activeParticipations: 0 };

export async function getMetrics(): Promise<Metrics> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return isStaging ? demoMetrics : zeroMetrics;

  const [{ count: uniqueUsers }, { count: activeParticipations }, { data: categoryCounts }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("group_members").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("category_participation_counts").select("participation_count")
  ]);
  const publicParticipationCount = categoryCounts?.reduce((sum, category) => sum + Number(category.participation_count ?? 0), 0) ?? 0;

  return {
    uniqueUsers: uniqueUsers && uniqueUsers > 0 ? uniqueUsers : isProductionRelease ? 0 : publicParticipationCount,
    activeParticipations: activeParticipations && activeParticipations > 0 ? activeParticipations : isProductionRelease ? 0 : publicParticipationCount
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return isStaging ? demoCategories : [];

  const { data, error } = await supabase
    .from("category_participation_counts")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return isStaging ? demoCategories : [];
  return data as Category[];
}

export async function getGroups(): Promise<Group[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return isStaging ? demoGroups : [];

  const { data, error } = await supabase
    .from("group_cards")
    .select("*")
    .in("status", ["active", "pending"])
    .order("featured", { ascending: false })
    .order("member_count", { ascending: false });

  if (error || !data) return isStaging ? demoGroups : [];
  return data as Group[];
}

export async function getGroup(id: string): Promise<Group | null> {
  const groups = await getGroups();
  return groups.find((group) => group.id === id || group.slug === id) ?? null;
}

export async function getOffersForGroup(groupId: string): Promise<Offer[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return isStaging ? demoOffers.filter((offer) => offer.group_id === groupId) : [];

  const { data, error } = await supabase
    .from("offer_cards")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "active")
    .order("total_price", { ascending: true });

  if (error || !data) return [];
  return data as Offer[];
}

export async function findSimilarGroups(query: string): Promise<Group[]> {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 3) return [];

  const groups = await getGroups();
  return groups.filter((group) =>
    `${group.name} ${group.description} ${group.terms.join(" ")}`.toLowerCase().includes(normalized)
  ).slice(0, 4);
}
