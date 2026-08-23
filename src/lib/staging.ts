export const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";
export const isProductionRelease = process.env.NEXT_PUBLIC_APP_ENV === "production";

export const stagingLabel = isStaging ? "TESTIYMPÄRISTÖ - EI OIKEITA KAUPPOJA" : "";
