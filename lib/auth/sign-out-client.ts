import { createClient } from "@/lib/supabase/client";

type AppRouter = {
  push: (href: string) => void;
  refresh: () => void;
};

export async function signOutClient(router: AppRouter): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.push("/login");
  router.refresh();
}
