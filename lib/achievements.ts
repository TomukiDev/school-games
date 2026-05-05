import { APP_GAME_IDS, type AppGameId } from "@/lib/game-ranking";

export type AchievementDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "2b3f6494-dc7e-457f-bf8c-f593a5dcdb33",
    slug: "first-round",
    title: "Primo Round",
    description: "Hai completato il tuo primo round.",
  },
  {
    id: "9be46157-d084-4cc2-84ec-84bd9dc70f94",
    slug: "record-breaker",
    title: "Nuovo Record",
    description: "Hai battuto il tuo record personale in una sfida.",
  },
  {
    id: "7a2f70aa-c37f-4f3a-98a4-f98639fd1db4",
    slug: "tabelline-solo-one",
    title: "Specialista",
    description: "Hai completato un round Tabelline con una sola tabellina selezionata.",
  },
  {
    id: "f849f5bc-dbe5-49bc-9d5b-6d7f689ece84",
    slug: "tabelline-all",
    title: "Collezionista",
    description: "Hai giocato Tabelline con tutte le tabelline selezionate.",
  },
  {
    id: "c349f31f-d39d-4ef4-9f98-b318cbadac53",
    slug: "clock-12h",
    title: "Modalita 12h",
    description: "Hai completato un round Orologio in formato 12h.",
  },
  {
    id: "637f00f8-98ac-4580-9f33-4faaeb762f90",
    slug: "clock-expert",
    title: "Occhio Esperto",
    description: "Hai completato un round Orologio con categoria Esperti.",
  },
  {
    id: "dfc1bbfc-d419-47d4-b8e6-3214fccfcbaf",
    slug: "streak-3",
    title: "Tris di Giorni",
    description: "Hai giocato per 3 giorni di fila.",
  },
  {
    id: "1bc4e5da-f3b3-4e56-9f4f-d3fa8a723a42",
    slug: "streak-7",
    title: "Settimana Super",
    description: "Hai giocato per 7 giorni di fila.",
  },
];

export type SessionStats = {
  selectedTables?: number[];
  categories?: number[];
  format?: "12h" | "24h";
};

export function pickAchievementIds(params: {
  gameId: AppGameId;
  newPersonalBest: boolean;
  streakDays: number;
  stats?: SessionStats;
}): string[] {
  const unlocked = new Set<string>(["2b3f6494-dc7e-457f-bf8c-f593a5dcdb33"]);

  if (params.newPersonalBest) {
    unlocked.add("9be46157-d084-4cc2-84ec-84bd9dc70f94");
  }

  if (params.gameId === APP_GAME_IDS.tabelline) {
    const selectedCount = params.stats?.selectedTables?.length ?? 0;
    if (selectedCount === 1) unlocked.add("7a2f70aa-c37f-4f3a-98a4-f98639fd1db4");
    if (selectedCount >= 10) unlocked.add("f849f5bc-dbe5-49bc-9d5b-6d7f689ece84");
  }

  if (params.gameId === APP_GAME_IDS.orologio) {
    if (params.stats?.format === "12h") unlocked.add("c349f31f-d39d-4ef4-9f98-b318cbadac53");
    if ((params.stats?.categories ?? []).includes(4)) unlocked.add("637f00f8-98ac-4580-9f33-4faaeb762f90");
  }

  if (params.streakDays >= 3) unlocked.add("dfc1bbfc-d419-47d4-b8e6-3214fccfcbaf");
  if (params.streakDays >= 7) unlocked.add("1bc4e5da-f3b3-4e56-9f4f-d3fa8a723a42");

  return [...unlocked];
}
