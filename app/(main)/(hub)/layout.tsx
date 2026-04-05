import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isProfileComplete } from "@/lib/profile";

export default async function HubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, birth_date")
    .eq("id", user.id)
    .maybeSingle();

  if (!isProfileComplete(profile)) {
    redirect("/profile?setup=1");
  }

  return <>{children}</>;
}
