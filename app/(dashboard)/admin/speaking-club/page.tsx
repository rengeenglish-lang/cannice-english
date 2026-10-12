import type { Metadata } from "next";
import { forbidden, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { getSpeakingClubRooms, speakingClubGroupCounts } from "@/server/services/speaking-club.service";
import { SpeakingClubForm } from "@/components/admin/SpeakingClubForm";

export const metadata: Metadata = { title: "Speaking Club", robots: { index: false, follow: false } };

export default async function AdminSpeakingClubPage() {
  const actor = await getAuthContext();
  if (!actor) redirect("/sign-in");
  if (actor.role !== "ADMIN") forbidden();
  const [{ rooms, note }, counts] = await Promise.all([getSpeakingClubRooms(), speakingClubGroupCounts()]);
  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Speaking Club</h1>
      <p className="page-copy">
        Öğrenciler seviyelerine göre üç odaya ayrılır. &quot;Speaking Club&apos;a Katıl&quot; butonu, seviyesi bilinen öğrenciyi kendi odasına
        yönlendirir; seviyesi bilinmeyen öğrenciden önce Genel İngilizce Seviye Testi&apos;ni çözmesi istenir.
      </p>
      <div className="mt-8">
        <SpeakingClubForm rooms={rooms} note={note} counts={counts} />
      </div>
    </div>
  );
}
