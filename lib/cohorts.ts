export function cohortAvailability(cohort: { minimumCapacity: number; maximumCapacity: number; status: string }, confirmed: number) {
  const remaining = Math.max(0, cohort.maximumCapacity - confirmed);
  const capacity = remaining === 0 ? "FULL" : remaining <= 2 ? "LIMITED" : "AVAILABLE";
  return {
    confirmed, remaining, capacity,
    label: capacity === "FULL" ? "Kontenjan Doldu" : capacity === "LIMITED" ? "Son Kontenjanlar" : "Kontenjan Açık",
    formation: confirmed === 0 ? "YENİ GRUP" : confirmed < cohort.minimumCapacity ? "KAYIT TOPLANIYOR" : "GRUP KESİNLEŞTİ",
    canRegister: cohort.status === "OPEN" && remaining > 0,
    canWaitlist: cohort.status === "OPEN" && remaining === 0,
  };
}
