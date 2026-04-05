export type ProfileRow = {
  id: string;
  full_name: string | null;
  birth_date: string | null;
  profile_completed: boolean;
  updated_at?: string;
};

export function isProfileComplete(p: Pick<ProfileRow, "full_name" | "birth_date"> | null): boolean {
  return Boolean(
    p?.full_name?.trim() && p?.birth_date,
  );
}
