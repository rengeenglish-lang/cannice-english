"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileFormState } from "@/app/actions/profile";

const initialState: ProfileFormState = { status: "idle" };

type ProfileFormProps = {
  name: string;
  phone: string;
  nationalId: string;
  birthDate: string;
  occupation: string;
  educationLevel: string;
};

const OCCUPATIONS = ["Öğrenci", "Öğretmen", "Mühendis", "Sağlık Çalışanı", "Kamu Yöneticisi", "Serbest Meslek", "Diğer"];
const EDUCATION_LEVELS = ["Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora"];

export function ProfileForm({ name, phone, nationalId, birthDate, occupation, educationLevel }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="dashboard-panel space-y-4">
      <div>
        <h2 className="section-title text-lg">Kişisel Bilgiler</h2>
      </div>
      <div>
        <label className="label" htmlFor="name">Ad Soyad</label>
        <input id="name" name="name" required defaultValue={name} className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="nationalId">T.C. Kimlik Numaranız (opsiyonel)</label>
        <input id="nationalId" name="nationalId" defaultValue={nationalId} inputMode="numeric" maxLength={11} className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Telefon (Gsm) Numaranız</label>
        <input id="phone" name="phone" defaultValue={phone} className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="birthDate">Doğum Tarihiniz</label>
        <input id="birthDate" name="birthDate" type="date" defaultValue={birthDate} className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="occupation">Mesleğiniz</label>
        <select id="occupation" name="occupation" defaultValue={occupation} className="auth-input">
          <option value="">Seçiniz</option>
          {OCCUPATIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="educationLevel">Eğitim Durumunuz</label>
        <select id="educationLevel" name="educationLevel" defaultValue={educationLevel} className="auth-input">
          <option value="">Seçiniz</option>
          {EDUCATION_LEVELS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}

      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Kaydediliyor…" : "Kaydet →"}
      </button>
    </form>
  );
}
