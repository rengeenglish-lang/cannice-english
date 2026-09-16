import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { AccountHeader } from "@/components/dashboard/AccountHeader";
import { AccountTabs } from "@/components/dashboard/AccountTabs";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { PasswordForm } from "@/components/dashboard/PasswordForm";

export const metadata: Metadata = { title: "Hesabım" };

export default async function ProfilePage() {
  const user = await getAuthContext();
  if (!user) return null;

  return (
    <div>
      <AccountHeader name={user.name} email={user.email} activeTabLabel="Hesabım" />
      <AccountTabs active="Hesabım" />

      <div className="mt-8">
        <h1 className="page-title text-center sm:text-3xl">Hesap Bilgilerim</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[color:var(--muted)]">
          Hesabınıza ait isim, soy isim ve şifre gibi bilgileri bu sayfadan güncelleyebilirsiniz.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileForm
          name={user.name}
          phone={user.phone ?? ""}
          nationalId={user.nationalId ?? ""}
          birthDate={user.birthDate ? user.birthDate.toISOString().slice(0, 10) : ""}
          occupation={user.occupation ?? ""}
          educationLevel={user.educationLevel ?? ""}
        />
        <PasswordForm />
      </div>
    </div>
  );
}
