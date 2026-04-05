import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ setup?: string }>;
}>) {
  const params = await searchParams;
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <ProfileForm
        userId={user.id}
        email={user.email ?? ""}
        initialFullName={profile?.full_name ?? ""}
        initialBirthDate={profile?.birth_date ?? ""}
        setup={params.setup === "1"}
      />
    </div>
  );
}
