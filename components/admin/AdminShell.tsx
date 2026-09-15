import Link from "next/link";

export function DashboardSidebar({ role }: { role: "STUDENT" | "TEACHER" | "ADMIN" }) {
  const isStaff = role === "TEACHER" || role === "ADMIN";
  return (
    <aside className="dashboard-sidebar p-4">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2">
        <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-[color:var(--accent)] to-[#0f9b8e] text-sm font-extrabold text-white">C</span>
        <span className="font-extrabold text-[color:var(--foreground)]">Cannice English</span>
      </Link>
      <nav className="space-y-1">
        <Link href="/dashboard" className="dashboard-nav-item">Panelim</Link>
        <Link href="/packages" className="dashboard-nav-item">Paketlere Göz At</Link>
        {isStaff ? (
          <>
            <p className="mb-1 mt-6 px-3 text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Yönetim</p>
            <Link href="/admin" className="dashboard-nav-item">Genel Bakış</Link>
            <Link href="/admin/orders" className="dashboard-nav-item">Siparişler</Link>
            <Link href="/admin/coupons" className="dashboard-nav-item">Kuponlar</Link>
            <Link href="/admin/products" className="dashboard-nav-item">Ürünler</Link>
            <Link href="/admin/testimonials" className="dashboard-nav-item">Katılımcı Görüşleri</Link>
            <Link href="/admin/blog" className="dashboard-nav-item">Blog</Link>
            <Link href="/admin/submissions" className="dashboard-nav-item">Değerlendirmeler</Link>
            <Link href="/admin/leads" className="dashboard-nav-item">Gelen Talepler</Link>
          </>
        ) : null}
      </nav>
    </aside>
  );
}
