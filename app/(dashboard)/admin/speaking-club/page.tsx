import type { Metadata } from "next";
import { requireStaff } from "@/server/auth/context";
import { getSpeakingClub } from "@/server/services/settings.service";
import { SpeakingClubForm } from "@/components/admin/SpeakingClubForm";

export const metadata: Metadata = { title: "Speaking Club", robots: { index: false, follow: false } };

export default async function AdminSpeakingClubPage() {
  await requireStaff();
  const club = await getSpeakingClub();
  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Speaking Club</h1>
      <p className="page-copy">Öğrenci panelindeki &quot;Speaking Club&apos;a Katıl&quot; butonunun açtığı toplantı ve program bilgisi.</p>
      <div className="mt-8">
        <SpeakingClubForm current={club} />
      </div>
    </div>
  );
}
