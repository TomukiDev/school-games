type CosmeticDef = {
  id: string;
  slug: string;
  label: string;
  unlockLevel?: number;
  unlockAchievementId?: string;
};

export const COSMETICS: CosmeticDef[] = [
  {
    id: "615fd4fd-baf9-4d84-a524-a39f48f8fa2d",
    slug: "classic",
    label: "Classico",
    unlockLevel: 1,
  },
  {
    id: "4de4f9d8-6043-4705-84e9-e327dcecca2b",
    slug: "sunny",
    label: "Sole",
    unlockLevel: 3,
  },
  {
    id: "c67ac66c-cde4-4f6c-b9e6-4317cd9f0450",
    slug: "galaxy",
    label: "Galassia",
    unlockAchievementId: "1bc4e5da-f3b3-4e56-9f4f-d3fa8a723a42",
  },
];

export function pickCosmeticUnlockIds(params: {
  level: number;
  unlockedAchievementIds: string[];
}): string[] {
  return COSMETICS.filter((c) => {
    if (typeof c.unlockLevel === "number" && params.level >= c.unlockLevel) return true;
    if (c.unlockAchievementId && params.unlockedAchievementIds.includes(c.unlockAchievementId)) return true;
    return false;
  }).map((c) => c.id);
}
