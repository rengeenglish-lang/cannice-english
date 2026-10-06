"use client";
import { useActionState, useState } from "react";
import { savePlanningAction } from "@/app/actions/admin-seo-planning";
import { SeoForm } from "./SeoForm";
type Choice = { id: string; title: string; url: string };
const inputClass = "w-full rounded-lg border border-[color:var(--border)] p-2 focus-ring";
function Options({ choices }: { choices: Choice[] }) { return <><option value="">Sayfa seçin</option>{choices.map(c => <option key={c.id} value={c.id}>{c.title} — {c.url}</option>)}</>; }
export function LinkPlanForm({ id, revision, links: initial, choices }: { id: string; revision: number; links: {itemId:string;label:string}[]; choices: Choice[] }) {
  const [links, setLinks] = useState(initial);
  const [state, action, pending] = useActionState(savePlanningAction, { ok: false, message: "" });
  return <SeoForm pending={pending} onSave={action} className="space-y-3">
    <input type="hidden" name="mode" value="links" />
    <input type="hidden" name="payload" value={JSON.stringify({id,revision,links})} />
    {links.map((link,i) => <div key={i} className="space-y-2 rounded-lg border border-[color:var(--border)] p-3">
      <label>Hedef sayfa {i+1}<select aria-label={`Hedef sayfa ${i+1}`} required value={link.itemId} className={inputClass} onChange={e => setLinks(links.map((v,j) => j===i?{...v,itemId:e.target.value}:v))}><Options choices={choices} /></select></label>
      <label>Bağlantı metni {i+1}<input aria-label={`Bağlantı metni ${i+1}`} required minLength={2} maxLength={160} className={inputClass} value={link.label} onChange={e => setLinks(links.map((v,j) => j===i?{...v,label:e.target.value}:v))} /></label>
      <button type="button" className="ghost-button" onClick={() => setLinks(links.filter((_,j) => i!==j))}>Bağlantıyı kaldır {i+1}</button>
    </div>)}
    {links.length < 12 ? <button type="button" className="ghost-button" onClick={() => setLinks([...links,{itemId:"",label:""}])}>Bağlantı ekle</button> : null}
    <button className="primary-button">Bağlantıları onayla ve kaydet</button>
    <p role="status">{state.message}</p>
  </SeoForm>;
}
type Cluster = {id:string; name:string; pillarId:string; supportingIds:string[]};
export function ClusterForm({revision, clusters: initial, choices}: {revision:number;clusters:Cluster[];choices:Choice[]}) {
  const [clusters,setClusters] = useState(initial);
  const [state,action,pending] = useActionState(savePlanningAction,{ok:false,message:""});
  function patch(i:number, change:Partial<Cluster>) {setClusters(clusters.map((c,j)=>j===i?{...c,...change}:c));}
  return <SeoForm pending={pending} onSave={action} className="space-y-4">
    <input type="hidden" name="mode" value="clusters" /><input type="hidden" name="payload" value={JSON.stringify({revision,clusters})} />
    {clusters.map((c,i)=><div key={c.id} className="space-y-3 rounded-lg border border-[color:var(--border)] p-3">
      <label>Küme adı {i+1}<input aria-label={`Küme adı ${i+1}`} required minLength={3} maxLength={160} value={c.name} className={inputClass} onChange={e=>patch(i,{name:e.target.value})}/></label>
      <label>Ana konu sayfası {i+1}<select aria-label={`Ana konu sayfası ${i+1}`} required value={c.pillarId} className={inputClass} onChange={e=>patch(i,{pillarId:e.target.value,supportingIds:c.supportingIds.filter(id=>id!==e.target.value)})}><Options choices={choices}/></select></label>
      <p className="text-sm">Destekleyici sayfalar (en fazla 30)</p>
      <div className="max-h-64 overflow-y-auto space-y-2">{choices.filter(choice=>choice.id!==c.pillarId).map(choice=><label key={choice.id} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={c.supportingIds.includes(choice.id)} onChange={e=>patch(i,{supportingIds:e.target.checked?[...c.supportingIds,choice.id]:c.supportingIds.filter(id=>id!==choice.id)})}/><span>{choice.title}</span></label>)}</div>
      <button type="button" className="ghost-button" onClick={()=>setClusters(clusters.filter((_,j)=>i!==j))}>Kümeyi kaldır {i+1}</button>
    </div>)}
    {clusters.length<100?<button type="button" className="ghost-button" onClick={()=>setClusters([...clusters,{id:crypto.randomUUID(),name:"",pillarId:"",supportingIds:[]}])}>Konu kümesi ekle</button>:null}
    <button className="primary-button">Konu kümelerini kaydet</button><p role="status">{state.message}</p>
  </SeoForm>;
}
