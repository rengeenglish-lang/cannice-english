import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeDestinations, type IntelligenceItem } from "../lib/seo/intelligence";
const base: IntelligenceItem = { id: "1", title: "YDS relative clauses", url: "/exams/yds", sourceType: "TOPIC", sourceId: "topic", examSlug: "yds", languageCode: "tr-TR", excerpt: null, access: "PUBLIC", publication: "LIVE", available: true };
const input = { keyword: "YDS relative clauses", language: "tr-TR", examSlug: "yds", postId: "self" };
test("recommendations exclude private, removed, unsafe, different exam/language and self destinations", () => {
 const bad = [ { available: false }, { publication: "DRAFT" }, { url: "//evil.example" }, { url: "javascript:alert(1)" }, { url: "/\\evil.example" }, { examSlug: "ielts" }, { languageCode: "en" }, { sourceType: "BLOG", sourceId: "self" } ];
 for(const change of bad) assert.equal(analyzeDestinations(input, [{...base,...change}]).length,0);
 assert.equal(analyzeDestinations(input, [base]).length,1);
});
test("overlap evidence needs specific lexical agreement, products are not competing articles", () => {
 const rows=analyzeDestinations(input,[base,{...base,id:"2",title:"YDS kelime",sourceType:"PRODUCT"}]);
 assert.equal(rows[0].possibleOverlap,true);
 assert.deepEqual(rows[0].matched,["yds","relative","clauses"]);
 assert.equal(rows[1].possibleOverlap,false);
 assert.equal(analyzeDestinations({...input,keyword:"bir ve için",examSlug:null},[base]).length,0);
 assert.equal(analyzeDestinations({...input,keyword:"YDS"},[{...base,title:"YDS kelime"}])[0].possibleOverlap,false);
});
