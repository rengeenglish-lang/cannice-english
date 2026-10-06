import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { emptyBrief } from "../lib/seo/studio";
import { CLUSTERS_KEY, clustersSchema, linksSchema } from "../lib/seo/planning";
import { resolveDestination } from "../server/services/seo/destinations";
import { saveApprovedLinks, saveClusters, getClusters, getPlanningChoices } from "../server/services/seo/planning.service";
const url = new URL(process.env.DATABASE_URL!);
if (!["localhost","127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test")) throw new Error("Local test database required");
after(()=>db.$disconnect());
test("planning rejects duplicates, self-support and oversized links",()=>{
 assert.equal(linksSchema.safeParse([{itemId:"a",label:"One"},{itemId:"a",label:"Two"}]).success,false);
 assert.equal(clustersSchema.safeParse({revision:0,clusters:[{id:"a",name:"Topic",pillarId:"x",supportingIds:["x"]}]}).success,false);
});
test("link approvals and clusters are authorized, revision checked, audited and source validated",async()=>{
 const tag=randomUUID();
 const admin=await db.user.create({data:{name:"Planning",email:`p-${tag}@example.test`,role:"ADMIN"}});
 const student=await db.user.create({data:{name:"Student",email:`s-${tag}@example.test`}});
 const old=await db.appSetting.findUnique({where:{key:CLUSTERS_KEY}});
 const keyword=await db.seoKeyword.create({data:{keyword:"Planning",normalized:tag,languageCode:"tr",market:"TR",intent:"INFORMATIONAL",sourceNote:"Test source"}});
 const post=await db.blogPost.create({data:{title:"Draft",slug:tag,excerpt:"",content:"",authorId:admin.id,status:"DRAFT"}});
 const target=await db.blogPost.create({data:{title:"Target",slug:`target-${tag}`,excerpt:"",content:"",authorId:admin.id,status:"PUBLISHED"}});
 const draft=await db.seoArticleDraft.create({data:{keywordId:keyword.id,postId:post.id,brief:emptyBrief(keyword),reviewedHash:"old"}});
 const make=(sourceId:string,url:string)=>db.seoContentItem.create({data:{sourceKey:`TEST:${tag}:${sourceId}`,sourceType:"BLOG",sourceId,url,title:"Target",access:"PUBLIC",publication:"PUBLISHED",available:true,contentHash:"test",internalLinks:[],scannedAt:new Date()}});
 const dest=await make(target.id,`/blog/${target.slug}`);
 const self=await make(post.id,`/blog/${post.slug}`);
 try{
  await assert.rejects(saveApprovedLinks(student.id,{})); await assert.rejects(saveClusters(student.id,{})); await assert.rejects(getClusters(student.id)); await assert.rejects(getPlanningChoices(student.id));
  assert.ok(await resolveDestination(dest.id)); assert.equal(await resolveDestination(self.id),null);
  const input={id:draft.id,revision:0,links:[{itemId:dest.id,label:"Read target"}]};
  await saveApprovedLinks(admin.id,input);
  assert.equal((await db.seoArticleDraft.findUniqueOrThrow({where:{id:draft.id}})).reviewedHash,null);
  await assert.rejects(saveApprovedLinks(admin.id,input));
  await db.appSetting.deleteMany({where:{key:CLUSTERS_KEY}});
  // A second real public source is required for a supporting page.
  await db.blogPost.update({where:{id:post.id},data:{status:"PUBLISHED"}});
  const plan={revision:0,clusters:[{id:tag,name:"Reading cluster",pillarId:dest.id,supportingIds:[self.id]}]};
  await saveClusters(admin.id,plan); await assert.rejects(saveClusters(admin.id,plan));
  assert.equal((await getClusters(admin.id)).status[0].invalidIds.length,0);
  await assert.rejects(saveApprovedLinks(admin.id,{...input,revision:1}));
  await db.blogPost.update({where:{id:target.id},data:{status:"DRAFT"}});
  assert.equal(await resolveDestination(dest.id),null);
  assert.deepEqual((await getClusters(admin.id)).status[0].invalidIds,[dest.id]);
  await assert.rejects(saveClusters(admin.id,{...plan,revision:1}));
  await db.blogPost.update({where:{id:target.id},data:{status:"PUBLISHED",slug:`changed-${tag}`}});
  assert.equal(await resolveDestination(dest.id),null);
  assert.ok(await db.seoActivityLog.count({where:{actorId:admin.id,action:"LINKS_APPROVED"}}));
  await db.user.update({where:{id:admin.id},data:{isActive:false}});
  await assert.rejects(getClusters(admin.id)); await assert.rejects(saveApprovedLinks(admin.id,input));
 }finally{
  await db.seoContentItem.deleteMany({where:{id:{in:[dest.id,self.id]}}});
  await db.blogPost.deleteMany({where:{authorId:admin.id}}); await db.seoKeyword.delete({where:{id:keyword.id}});
  await db.seoActivityLog.deleteMany({where:{actorId:admin.id}}); await db.user.deleteMany({where:{id:{in:[admin.id,student.id]}}});
  if(old) await db.appSetting.upsert({where:{key:CLUSTERS_KEY},create:old,update:{value:old.value}}); else await db.appSetting.deleteMany({where:{key:CLUSTERS_KEY}});
 }
});
