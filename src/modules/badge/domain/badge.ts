export const BADGE_RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "one_of_one"] as const;
export type BadgeRarity = (typeof BADGE_RARITIES)[number];

export function nextBadgeSerial(issuedCount: number, maxSupply: number | null) {
  const serial = issuedCount + 1;
  if (maxSupply !== null && serial > maxSupply) throw new Error("BADGE_SUPPLY_EXHAUSTED");
  return serial;
}
