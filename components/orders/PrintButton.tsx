"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="secondary-button print:hidden">
      Yazdır / PDF Kaydet
    </button>
  );
}
