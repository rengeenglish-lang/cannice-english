import Link from "next/link";
import { forbidden } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { getSeoStudio } from "@/server/services/seo/studio.service";
export default async function LinksPage({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const actor=await getAuthContext(); if(actor?.role!=="ADMIN") forbidden();
 const query=await searchParams; const data=await getSeoStudio(actor.id,query.page);
 return <section className="max-w-4xl space-y-4"><h2 className="text-2xl font-bold">İç bağlantı onayları</h2>
 <p>Makalenizi açın, önerileri inceleyin ve bağlantı planını kaydedin. Hedefler onay sırasında ve editör incelemesinde kaynak kayıtlardan doğrulanır. Yayın otomasyonu kapalıdır.</p>
 {data.items.length?<ul className="space-y-3">{data.items.map(i=><li className="dashboard-panel p-4" key={i.id}><Link className="underline focus-ring" href={`/admin/seo/studio/${i.id}`}>{i.post.title}</Link></li>)}</ul>:<p>Henüz makale yok. <Link href="/admin/seo/keywords" className="underline">Bir anahtar kelimeden brief oluşturun.</Link></p>}
 <nav className="flex gap-4" aria-label="Bağlantı planı sayfaları">{data.page>1?<Link href={`?page=${data.page-1}`}>Önceki</Link>:null}{data.page*20<data.count?<Link href={`?page=${data.page+1}`}>Sonraki</Link>:null}</nav></section>;
}
